import req from "express/lib/request";
import Comment from "../models/Comment";
import User from "../models/User";
import Video from "../models/Video";

export const home = async (req, res) => {
	const pageTitle = "Home";
	const videos = await Video.find({})
		.sort({ createdAt: "desc" })
		.populate("owner");
	if (!videos) {
		return res.render("home", {
			pageTitle,
			errorMessage: "Video not found.",
		});
	}
	return res.render("home", { pageTitle, videos });
};

export const watch = async (req, res) => {
	const {
		params: { id },
	} = req;
	const video = await Video.findById(id)
		.populate("owner")
		.populate("comments");
	if (!video) {
		return res.render("watch", {
			pageTitle,
			errorMessage: "Video does not exsists",
		});
	}
	return res.render("watch", { pageTitle: video.title, video });
};

export const getEdit = async (req, res) => {
	const {
		params: { id },
		session: {
			user: { _id },
		},
	} = req;
	const video = await Video.findById(id);
	if (!video) {
		return res.status(404).render("404", { pageTitle: "Video not found." });
	}
	if (String(video.owner) !== String(_id)) {
		req.flash("error", "You are not the owner of this video.");
		return res.status(403).redirect("/");
	}
	return res.render("edit-video", {
		pageTitle: `Editing : ${video.title}`,
		video,
	});
};
export const postEdit = async (req, res) => {
	const {
		session: {
			user: { _id },
		},
		params: { id },
		body: { title, description, hashtags },
	} = req;
	const video = await Video.findById(id);
	if (!video) {
		return res.status(404).render("404", { pageTitle: "Video not found." });
	}
	if (String(video.owner) !== String(_id)) {
		return res.status(403).redirect("/");
	}
	await Video.findByIdAndUpdate(id, {
		title,
		description,
		hashtags: Video.formatHashtags(hashtags),
	});
	req.flash("success", "Changes saved");
	return res.redirect(`/videos/${id}`);
};

export const deleteVideo = async (req, res) => {
	const pageTitle = "Edit Video";
	const {
		session: {
			user: { _id },
		},
		params: { id },
	} = req;
	const video = await Video.findById(id);
	if (!video) {
		return res.render("edit-video", {
			pageTitle,
			errorMessage: "Video Not exists",
		});
	}
	if (String(video.owner) !== String(_id)) {
		return res.redirect("/");
	}
	await Video.findByIdAndRemove(id);
	return res.redirect("/");
};

export const getUpload = (req, res) => {
	const pageTitle = "Upload Video";
	return res.render("upload", { pageTitle });
};
export const postUpload = async (req, res) => {
	const pageTitle = "Upload Video";
	const {
		body: { title, description, hashtags },
		session: {
			user: { _id },
		},
		files: { video, thumb },
	} = req;

	try {
		const newVideo = await Video.create({
			title,
			description,
			fileUrl: video[0].path,
			thumbUrl: thumb[0].path,
			createdAt: new Date(),
			hashtags: Video.formatHashtags(hashtags),
			owner: _id,
		});
		const user = await User.findById(_id);
		user.videos.push(newVideo._id);
		user.save();
		return res.redirect("/");
	} catch (error) {
		return res.render("upload", {
			pageTitle,
			errorMessage: error._message,
		});
	}
};

export const search = async (req, res) => {
	const pageTitle = "Search the videos!";
	const {
		query: { keyword },
	} = req;
	let videos = [];
	let errorMessage;
	if (keyword) {
		videos = await Video.find({
			title: {
				$regex: new RegExp(keyword, "i"),
			},
		}).populate("owner");
		if (videos.length === 0) {
			errorMessage = "Video not found";
		}
	}
	return res.render("search", { pageTitle, videos, errorMessage });
};

export const registerView = async (req, res) => {
	const {
		params: { id },
	} = req;
	const video = await Video.findById(id);
	if (!video) {
		return res.sendStatus(404);
	}
	video.meta.views = video.meta.views + 1;
	await video.save();
	return res.sendStatus(200);
};

export const createComment = async (req, res) => {
	const {
		params: { id },
		session: { user },
		body: { text },
	} = req;
	const video = await Video.findById(id);
	if (!video) {
		return res.sendStatus(404); // send and kill request
	}
	const dbUser = await User.findById({ _id: user._id });
	const comment = await Comment.create({
		text,
		owner: user._id,
		video: id,
	});
	video.comments.push(comment._id);
	dbUser.comments.push(comment._id);
	await video.save();
	await dbUser.save();
	return res.status(201).json({ id: comment._id });
};

export const deleteComment = async (req, res) => {
	const {
		params: { id },
		body: { commentId },
	} = req;
	const video = await Video.findById(id);
	if (!video) {
		return res.sendStatus(404);
	}
	const comment = await Comment.findById({ _id: commentId });
	if (!comment) {
		return res.sendStatus(404);
	}
	await Comment.findByIdAndRemove({ _id: commentId });
	return res.sendStatus(200);
};
