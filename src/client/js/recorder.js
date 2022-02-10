import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

const actionBtn = document.getElementById("actionBtn");
const preview = document.getElementById("preview");

let stream;
let recorder;
let videoFile;

const files = {
	input: "recording.webm",
	output: "output.mp4",
	thumb: "thumbnail.jpg",
};

const downloadFile = (fileUrl, fileName) => {
	const a = document.createElement("a");
	a.href = fileUrl;
	a.download = fileName;
	document.body.appendChild(a);
	a.click();
};

const handleDownload = async () => {
	actionBtn.innerText = "Transcoding...";
	actionBtn.removeEventListener("click", handleDownload);
	actionBtn.disabled = true;

	const ffmpeg = createFFmpeg({
		corePath: "https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js",
		log: true,
	});
	await ffmpeg.load();
	// 가상 컴퓨터에 파일 생성
	ffmpeg.FS("writeFile", files.input, await fetchFile(videoFile));
	// -i : input transcoding to mp4
	await ffmpeg.run("-i", files.input, "-r", "60", files.output);

	await ffmpeg.run(
		"-i",
		files.input,
		"-ss", // search
		"00:01",
		"-frames:v",
		"1", // 1초컷 (영상이 1초 이하면 오류 발생 가능)
		files.thumb // in FS
	);
	// output file read
	const mp4File = ffmpeg.FS("readFile", files.output);
	const thumbFile = ffmpeg.FS("readFile", files.thumb);
	// unsigned number : 양의 정수
	// blob 자바스크립트 세계에 파일 같은 객체 binary 정보를 가지고 있는 file like data buffer 를 통해 사용할 수 있음
	const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" });
	const thumbBlob = new Blob([thumbFile.buffer], { type: "image/jpg" });

	const mp4Url = URL.createObjectURL(mp4Blob);
	const thumbUrl = URL.createObjectURL(thumbBlob);

	downloadFile(mp4Url, "myRecording.mp4");
	downloadFile(thumbUrl, "myThumbnamil.jpg");

	ffmpeg.FS("unlink", files.input);
	ffmpeg.FS("unlink", files.output);
	ffmpeg.FS("unlink", files.thumb);

	URL.revokeObjectURL(mp4Blob);
	URL.revokeObjectURL(thumbBlob);
	URL.revokeObjectURL(videoFile);

	stream = null;
	recordingPreview();
	actionBtn.disabled = false;
	actionBtn.innerText = "Recording Again";
	actionBtn.addEventListener("click", handleStart);
};

const handleStart = () => {
	actionBtn.innerText = "Recording...";
	actionBtn.removeEventListener("click", handleStart);
	actionBtn.addEventListener("click", handleDownload);
	recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
	recorder.ondataavailable = (event) => {
		// 파일을 가리키는 브라우저의 메모리상에서만 존재하는 URL
		videoFile = URL.createObjectURL(event.data);
		// playing video which is recorded
		preview.srcObject = null;
		preview.src = videoFile;
		preview.loop = true;
		preview.play();
	};
	recorder.start();
	setTimeout(() => {
		recorder.stop();
		actionBtn.innerText = "Download";
	}, 5000);
};

const recordingPreview = async () => {
	try {
		stream = await navigator.mediaDevices.getUserMedia({
			audio: false,
			video: { width: 320, height: 480 },
		});
		preview.srcObject = stream;
		preview.play();
	} catch (e) {
		console.log(e);
	}
};
recordingPreview();
actionBtn.addEventListener("click", handleStart);
