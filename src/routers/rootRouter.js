import express from "express";
import { home, search } from "../controllers/videoController";
import {
	getJoin,
	postJoin,
	getLogin,
	postLogin,
	logout,
} from "../controllers/userController";
import {
	protectorMiddleware,
	publicOnlyMiddleware,
	avatarUpload,
} from "../middlewares";

const rootRouter = express.Router();

rootRouter.get("/", home);
rootRouter
	.route("/join")
	.all(publicOnlyMiddleware)
	.get(getJoin)
	.post(avatarUpload.single("avatar"), postJoin);
rootRouter
	.route("/login")
	.all(publicOnlyMiddleware)
	.get(getLogin)
	.post(postLogin);
rootRouter.get("/logout", protectorMiddleware, logout);
rootRouter.get("/search", search);

export default rootRouter;
