import mongoose from "mongoose";
import User from "./User";

const commentSchema = new mongoose.Schema({
	text: { type: String, required: true },
	owner: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "User",
	},
	video: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "Video",
	},
	createdAt: { type: Date, required: true, default: Date.now },
});

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;
