import express from "express";
import morgan from "morgan";
import session from "express-session";
import MongoStore from "connect-mongo";
import flash from "express-flash";
import { localsMiddleware } from "./middlewares";
import rootRouter from "./routers/rootRouter.js";
import userRouter from "./routers/userRouter.js";
import videoRouter from "./routers/videoRouter.js";
import apiRouter from "./routers/apiRouter";

const app = express();
const logger = morgan("dev");

// process.env.NODE_ENV =
// 	process.env.NODE_ENV &&
// 	process.env.NODE_ENV.trim().toLowerCase() == "production"
// 		? "production"
// 		: "development";

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");

// CORS ERROR
app.use((_, res, next) => {
	//v2
	res.header("Cross-Origin-Embedder-Policy", "credentialless");
	res.header("Cross-Origin-Opener-Policy", "same-origin");

	// v1
	// res.header("Cross-Origin-Opener-Policy", "same-origin");
	// res.header("Cross-Origin-Embedder-Policy", "require-corp");
	// res.header("cross-origin-resource-policy", "cross-origin");
	// res.header("Access-Control-Allow-Credentials", "true");
	next();
});

app.use(logger);
app.use(express.urlencoded({ extended: true })); // req.body
app.use(express.json()); // text 가 아닌 json 으로 보낸다고 알려줘야함
app.use(
	session({
		secret: process.env.COOKIE_SECRET,
		resave: false,
		saveUninitialized: false,
		store: MongoStore.create({
			mongoUrl: process.env.DB_URL,
		}),
	})
);
app.use(flash());
app.use(localsMiddleware);
app.use("/uploads", express.static("uploads"));
app.use("/static", express.static("assets"));
app.use("/modules", express.static("node_modules/@@ffmpeg/core/dist"));
app.use("/", rootRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);
app.use("/api", apiRouter);

export default app;
