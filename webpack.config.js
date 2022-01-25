const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const BASE_JS = "./src/client/js/";
module.exports = {
	entry: {
		main: `${BASE_JS}main.js`,
		videoPlayer: `${BASE_JS}videoPlayer.js`,
		recorder: `${BASE_JS}recorder.js`,
		commentSection: `${BASE_JS}commentSection.js`,
	},
	output: {
		filename: "js/[name].js", // entry name 을 변수로 가짐
		path: path.resolve(__dirname, "assets"),
		clean: true, // 저장할 때마다 파일 전체 갱신
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: "css/styles.css",
		}),
	],
	module: {
		rules: [
			{
				test: /\.js$/,
				use: {
					loader: "babel-loader",
					options: {
						presets: [
							["@babel/preset-env", { targets: "defaults" }],
						],
					},
				},
				test: /\.scss?$/,
				exclude: /node_module/,
				use: [
					MiniCssExtractPlugin.loader,
					"css-loader", // import 기능
					"sass-loader", // scss -> css 번역
					// ^ 반대 순서로 작동 ^
				],
			},
		],
	},
};
