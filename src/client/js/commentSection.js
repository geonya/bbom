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

const addComment = (text) => {
  const videoComments = document.querySelector(".video__comments ul");
  const newComment = document.createElement("li");
  newComment.className = "video__comment";
  const icon = document.createElement("i");
  icon.className = "fas fa-comment";
  const span = document.createElement("span");
  span.innerText = `  ${text}`;
  const button = document.createElement("button");
  button.id = "commentDelete";
  button.innerText = "❌";
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
  // status = fetch-promise.status
  const { status } = await fetch(`/api/videos/${videoId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  }); // fetch :: send request to backend
  // fetch 로 백엔드에 request 해서 data 가 돌아오는데 시간이 걸리기 때문에 await 을 해주는게 좋다.
  textarea.value = "";
  if (status === 201) {
    // create success status code
    addComment(text);
  }
};
// fetch 만 하면 쿠키는 자동으로 브라우저에 전송되고 백엔드에서 사용할 수 있음

if (form) {
  // login 을 해야 form 이 생성됨
  form.addEventListener("submit", handleSubmit);
  // delete Btn don't exists
  for (const btn of deleteBtns) {
    btn.addEventListener("click", handleClickDelete);
  }
}
// btn click event 대신에 form 에 submit event 를 감지하는 것이 더 좋다.
