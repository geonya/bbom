import "regenerator-runtime";
import "dotenv/config";
import "./db";
import app from "./server.js";
import Comment from "./models/Comment";
import User from "./models/User";
import Video from "./models/Video";

const PORT = 4000;

const handleListening = () => {
	console.log(`✅ Sever Listening on http://localhost:${PORT} 🚀`);
};

app.listen(PORT, handleListening);
