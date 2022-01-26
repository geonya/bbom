import Comment from "../models/Comment";
import User from "../models/User";
import Video from "../models/Video";
import bcrypt from "bcrypt";
import fetch from "node-fetch"; // v.3 이하로 설치 바람

export const getJoin = (req, res) => {
	const pageTitle = "Join";
	return res.render("join", { pageTitle });
};
export const postJoin = async (req, res) => {
	const pageTitle = "Join";
	const {
		body: { userId, name, email, password, password2, location },
		file,
	} = req;
	const isHeroku = process.env.NODE.ENV === "production";
	let errorMessages = [];
	const userExists = await User.exists({ userId });
	if (userExists) {
		errorMessages.push("ID is already taken");
	}
	const emailExists = await User.exists({ email });
	if (emailExists) {
		errorMessages.push("Email is already taken");
	}
	if (password === "" || password !== password2) {
		// password is not required so not allowed empty
		errorMessages.push("Password confirmation is wrong.");
	}
	if (errorMessages.length > 0) {
		return res.render("join", { pageTitle, errorMessages });
	}
	try {
		const user = await User.create({
			userId,
			name,
			email,
			password,
			location,
			avatarUrl: file
				? isHeroku
					? file.location
					: file.path
				: process.env.AVATAR,
		});
		req.session.loggedIn = true;
		req.session.user = user;
		return res.redirect("/");
	} catch (error) {
		return res.status(400).render("join", {
			pageTitle,
			errorMessage: error._message,
		});
	}
};

export const getLogin = (req, res) => {
	const pageTitle = "Login";
	return res.render("login", { pageTitle });
};
export const postLogin = async (req, res) => {
	const pageTitle = "Login";
	const {
		body: { userId, password },
	} = req;
	let errorMessages = [];
	try {
		const user = await User.findOne({ userId });
		if (!user) {
			errorMessages.push("User does not exsists");
		}
		if (user.socialOnly) {
			return res.redirect("/users/github/start");
		}
		const match = await bcrypt.compare(password, user.password);
		if (!match) {
			errorMessages.push("Password is not correct");
		}
		if (errorMessages.length > 0) {
			return res.render("login", { pageTitle, errorMessages });
		}
		req.session.loggedIn = true;
		req.session.user = user;
		req.flash("success", `Welcome ${user.name} !`);
		return res.redirect("/");
	} catch (error) {
		return res.status(400).render("login", {
			pageTitle,
			errorMessages: error._message,
		});
	}
};

export const logout = (req, res) => {
	req.flash("info", "Bye Bye");
	req.session.destroy();
	return res.redirect("/");
};

export const myProfile = async (req, res) => {
	const { id } = req.params;
	const user = await User.findById(id)
		.populate({
			path: "videos",
			populate: {
				path: "owner",
				model: "User",
			},
		})
		.populate("comments");
	if (!user) {
		return res.status(404).render("404", { pageTitle: "User not found." });
	}
	return res.render("users/myprofile", { pageTitle: user.name, user });
};

export const getEdit = (req, res) => {
	const pageTitle = "Edit Profile";
	return res.render("users/edit-profile", { pageTitle });
};

export const postEdit = async (req, res) => {
	const pageTitle = "Edit Profile";
	const {
		body: { name, email, location },
		session: {
			user: { _id, name: sessionName, email: sessionEmail, avatarUrl },
		},
		file,
	} = req;
	let errorMessage = [];
	// name validatation text
	if (name !== sessionName) {
		const exists = await User.exists({ name });
		if (exists) {
			errorMessage.push("name is exists");
		}
	}
	// email validation
	if (email !== sessionEmail) {
		const exists = await User.exists({ email });
		if (exists) {
			errorMessage.push("email is exists");
		}
	}
	if (errorMessage.length > 0) {
		return res.status(400).render("users/edit-profile", {
			pageTitle,
			errorMessage,
		});
	}

	const isHeroku = process.env.NODE.ENV === "production";
	const updateUser = await User.findByIdAndUpdate(
		_id,
		{
			name,
			email,
			location,
			avatarUrl: file
				? isHeroku
					? file.location
					: file.path
				: process.env.AVATAR,
		},
		{ new: true }
	);
	req.session.user = updateUser;
	return res.redirect(`/users/${updateUser._id}`);
};

export const getChangePassword = (req, res) => {
	const pageTitle = "Change Password";
	if (req.session.socialOnly === true) {
		req.flash("error", "Can't change password.");
		return res.redirect("/");
	}
	return res.render("users/change-password", { pageTitle });
};

export const postChangePassword = async (req, res) => {
	const pageTitle = "Change Password";
	const {
		params: { id },
	} = req;
	const {
		body: { oldPassword, newPassword, confirmPassword },
	} = req;
	const user = await User.findById(id);
	const match = await bcrypt.compare(oldPassword, user.password);
	const errorMessages = [];
	if (!match) {
		errorMessages.push("Password doesn't match");
	}
	if (oldPassword === newPassword) {
		errorMessages.push("New Password is same as old one.");
	}
	if (newPassword !== confirmPassword) {
		errorMessages.push("Password Confirmation is wrong.");
	}
	if (errorMessages.length > 0) {
		return res.status(400).render("users/change-password", {
			pageTitle,
			errorMessages,
		});
	}
	user.password = newPassword;
	await user.save();
	req.flash("info", "Password updated");
	return res.redirect("/");
};

export const startGithubLogin = (req, res) => {
	const baseUrl = "https://github.com/login/oauth/authorize";
	const config = {
		client_id: process.env.GH_CLIENT,
		allow_signup: false,
		scope: "read:user user:email",
	};
	const params = new URLSearchParams(config).toString();
	const finalUrl = `${baseUrl}?${params}`;
	return res.redirect(finalUrl);
};
export const finishGithubLogin = async (req, res) => {
	const config = {
		client_id: process.env.GH_CLIENT,
		client_secret: process.env.GH_SECRET,
		code: req.query.code,
	};
	const baseUrl = "https://github.com/login/oauth/access_token";
	const params = new URLSearchParams(config).toString();
	const finalUrl = `${baseUrl}?${params}`;
	// send post request using by <fetch>
	const tokenRequest = await (
		await fetch(finalUrl, {
			headers: {
				Accept: "application/json",
			},
			method: "POST",
		})
	).json();
	if ("access_token" in tokenRequest) {
		// access api
		const { access_token } = tokenRequest;
		const apiUrl = "https://api.github.com";
		const userData = await (
			await fetch(`${apiUrl}/user`, {
				headers: {
					Authorization: `token ${access_token}`,
				},
			})
		).json();
		const userEmail = await (
			await fetch(`${apiUrl}/user/emails`, {
				headers: {
					Authorization: `token ${access_token}`,
				},
			})
		).json();
		const emailObj = userEmail.find(
			(email) => email.primary === true && email.verified === true
		);
		if (!emailObj) {
			return res.redirect("/login");
		}
		let user = await User.findOne({ email: emailObj.email });
		if (!user) {
			user = await User.create({
				userId: userData.login,
				name: userData.name,
				email: emailObj.email,
				password: "",
				location: userData.location,
				socialOnly: true,
				avatarUrl: userData.avatar_url,
			});
		}
		req.session.loggedIn = true;
		req.session.user = user;
		return res.redirect("/");
	} else {
		return res.status(400).redirect("/login");
	}
};
