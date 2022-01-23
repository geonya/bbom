const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const deleteBtns = document.querySelectorAll("#commentDelete");

const handleClickDelete = async (event) => {
	const videoComment = event.target.parentNode;
	const videoId = videoContainer.dataset.videoid;
	const commentId = videoComment.dataset.commentid;
	const { status } = await fetch(`/api/videos/${videoId}/comment/delete`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ commentId }),
	});
	if (status === 200) {
		videoComment.remove();
	}
};

const addComment = (text, id) => {
	const videoComments = document.querySelector(".video__comments ul");
	const newComment = document.createElement("li");
	newComment.className = "video__comment";
	// insert data set in fake comment tag
	newComment.setAttribute("data-commentId", id);
	const icon = document.createElement("i");
	icon.className = "fas fa-comment";
	const span = document.createElement("span");
	span.innerText = `  ${text}`;
	const button = document.createElement("button");
	button.id = "commentDelete";
	button.innerText = "❌";
	// before sync, need eventlistener
	button.addEventListener("click", handleClickDelete);
	newComment.appendChild(icon);
	newComment.appendChild(span);
	newComment.appendChild(button);
	videoComments.prepend(newComment);
};

const handleSubmit = async (event) => {
	event.preventDefault();
	const textarea = form.querySelector("textarea");
	const text = textarea.value;
	const videoId = videoContainer.dataset.videoid;
	if (text === "") {
		return;
	}
	const response = await fetch(`/api/videos/${videoId}/comment`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ text }),
	}); // fetch :: send request to backend
	const { status } = response;
	const result = await response.json(); // fetch promise need await
	if (status === 201) {
		addComment(text, result.id);
	}
	textarea.value = "";
};

if (form) {
	// if login ?
	// better than click event
	form.addEventListener("submit", handleSubmit);
	// need loop adding eventlistener for all btns
	for (const btn of deleteBtns) {
		btn.addEventListener("click", handleClickDelete);
	}
}
