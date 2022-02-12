const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const deleteBtns = document.querySelectorAll("#commentDelete");

const handleClickDelete = async (event) => {
	const videoComment = event.target.parentNode;
	const videoId = videoContainer.dataset.videoid;
	const commentId = videoComment.dataset.id;
	const response = await fetch(`/api/comment/${commentId}/delete`, {
		method: "DELETE",
	});
	if (response.status === 200) {
		videoComment.remove();
	}
};

const addComment = (text, id, avatar, name) => {
	const videoComments = document.querySelector(".video__comments ul");
	const newComment = document.createElement("li");
	newComment.dataset.id = id;
	newComment.className = "video__comment";
	// comment user avatar
	const div = document.createElement("div");
	const img = document.createElement("img");
	const nameSpan = document.createElement("span");
	img.className = "header__avatar";
	img.src = "/" + avatar;
	nameSpan.innerText = name;
	div.appendChild(img);
	div.appendChild(nameSpan);
	const span = document.createElement("span");
	span.innerText = `  ${text}`;
	const span2 = document.createElement("span");
	span2.id = "commentDelete";
	span2.innerText = "❌";
	span2.addEventListener("click", handleClickDelete);
	newComment.appendChild(div);
	newComment.appendChild(span);
	newComment.appendChild(span2);
	videoComments.prepend(newComment);
};

const handleSubmit = async (event) => {
	event.preventDefault();
	const textarea = form.querySelector("input");
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
	if (response.status === 201) {
		textarea.value = "";
		const { newCommentId, ownerAvatar, ownerName } = await response.json();
		addComment(text, newCommentId, ownerAvatar, ownerName);
	}
};

if (form) {
	// if login ?
	form.addEventListener("submit", handleSubmit);
	// need loop adding eventlistener for all btns
	for (const btn of deleteBtns) {
		btn.addEventListener("click", handleClickDelete);
	}
}
