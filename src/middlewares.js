import multer from "multer";

export const localsMiddleware = (req, res, next) => {
	res.locals.siteName = "BBOM";
	if (req.session.loggedIn) {
		res.locals.loggedIn = true;
		res.locals.loggedInUser = req.session.user || {};
	}
	next();
};

export const protectorMiddleware = (req, res, next) => {
	if (req.session.user) {
		next();
	} else {
		req.flash("error", "Login First");
		return res.redirect("/login");
	}
};

export const publicOnlyMiddleware = (req, res, next) => {
	if (!req.session.loggedIn) {
		return next();
	} else {
		req.flash("error", "Not authorized");
		return res.redirect("/");
	}
};

export const avatarUpload = multer({
	dest: "uploads/avatars/",
	limits: {
		fileSize: 3000000,
	},
});

export const videoUpload = multer({
	dest: "uploads/videos/",
	limits: {
		fileSize: 30000000,
	},
});
