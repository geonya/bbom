const video = document.querySelector("video");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");
const playBtn = document.getElementById("play");
const playBtni = playBtn.querySelector("i");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const muteBtn = document.getElementById("mute");
const muteBtni = muteBtn.querySelector("i");
const volumeRange = document.getElementById("volume");
const timeline = document.getElementById("timeline");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const stepForwardBtn = document.getElementById("stepForward");

let volumeValue = 0.5;
video.volume = volumeValue;
let leaveTimeout = null;
let moveTimeout = null;
let pauseTimeout = null;

const hanlePlay = () => {
	// if video is playing ?
	if (video.paused) {
		video.play();
	} else {
		video.pause();
	}
	playBtni.className = video.paused ? "fas fa-play" : "fas fa-pause";
	// else play the video
};

const handlePause = () => {
	if (pauseTimeout !== null) {
		clearTimeout(pauseTimeout);
	}
	playBtni.className = "fas fa-play";
	videoControls.classList.add("showing");
	pauseTimeout = setTimeout(removeShowing, 5000);
};

const handleMute = () => {
	if (video.muted) {
		video.muted = false;
	} else {
		video.muted = true;
	}
	if (volumeValue == 0) {
		videoValue = 0.1;
		video.volume = 0.1;
	}
	muteBtni.className = video.muted
		? "fas fa-volume-mute"
		: "fas fa-volume-up";
	volumeRange.value = video.muted ? "0" : volumeValue;
};

const handleChangeVolume = (e) => {
	const {
		target: { value },
	} = e;

	if (video.muted) {
		video.muted = false;
		muteBtni.className = "fas fa-volume-up";
	}
	if (value == 0) {
		video.muted = true;
		muteBtni.className = "fas fa-volume-mute";
	}
	video.volume = value;
	volumeValue = value;
};

const formatTime = (s) => new Date(s * 1000).toISOString().substr(14, 5);

const handleTotalTime = () => {
	totalTime.innerText = formatTime(Math.floor(video.duration));
	timeline.max = Math.floor(video.duration);
};

const handleCurrentTime = () => {
	currentTime.innerText = formatTime(Math.floor(video.currentTime));
	timeline.value = Math.floor(video.currentTime);
};

const handleTimelineChange = (e) => {
	const {
		target: { value },
	} = e;
	video.currentTime = value;
};

const handleEnded = () => {
	const { videoid } = videoContainer.dataset;
	fetch(`/api/videos/${videoid}/view`, { method: "POST" });
};

const handleFullScreen = () => {
	if (document.fullscreenElement) {
		document.exitFullscreen();
	} else {
		videoContainer.requestFullscreen();
	}
};

const removeShowing = () => videoControls.classList.remove("showing");

const handleMouseleave = () => {
	leaveTimeout = setTimeout(removeShowing, 5000);
};
const handleMousemove = () => {
	if (leaveTimeout) {
		clearTimeout(moveTimeout);
		moveTimeout = null;
	} else {
		clearTimeout(leaveTimeout);
		leaveTimeout = null;
	}
	videoControls.classList.add("showing");
	moveTimeout = setTimeout(removeShowing, 5000);
};

const handleClick = () => {
	if (video.paused) {
		video.play();
	} else {
		video.pause();
	}
	playBtni.className = video.paused ? "fas fa-play" : "fas fa-pause";
};

const handleKeydown = (e) => {
	e.preventDefault(); // prevent spacebar scroll move
	if (e.keyCode === 32) {
		if (video.paused) {
			video.play();
		} else {
			video.pause();
		}
	}
	playBtni.className = video.paused ? "fas fa-play" : "fas fa-pause";
};

const handleStepforward = () => {
	video.currentTime = video.duration;
};

playBtn.addEventListener("click", hanlePlay);
muteBtn.addEventListener("click", handleMute);
video.addEventListener("pause", handlePause);
volumeRange.addEventListener("input", handleChangeVolume);
video.addEventListener("loadeddata", handleTotalTime);
video.addEventListener("timeupdate", handleCurrentTime);
timeline.addEventListener("input", handleTimelineChange);
video.addEventListener("ended", handleEnded);
fullscreenBtn.addEventListener("click", handleFullScreen);
videoContainer.addEventListener("mousemove", handleMousemove);
videoContainer.addEventListener("mouseleave", handleMouseleave);
video.addEventListener("click", handleClick);
videoContainer.addEventListener("keydown", handleKeydown);
stepForwardBtn.addEventListener("click", handleStepforward);
