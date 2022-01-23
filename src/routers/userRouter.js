import express from "express";
import {
	getEdit,
	postEdit,
	myProfile,
	getChangePassword,
	postChangePassword,
	startGithubLogin,
	finishGithubLogin,
} from "../controllers/userController";
import {
	protectorMiddleware,
	publicOnlyMiddleware,
	avatarUpload,
} from "../middlewares";

const userRouter = express.Router();

userRouter.get("/:id([0-9a-f]{24})", myProfile);
userRouter
	.route("/edit")
	.all(protectorMiddleware)
	.get(getEdit)
	.post(avatarUpload.single("avatar"), postEdit);
userRouter
	.route("/:id([0-9a-f]{24})/changepassword")
	.all(protectorMiddleware)
	.get(getChangePassword)
	.post(postChangePassword);
userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin);

export default userRouter;
