import "regenerator-runtime";
import "../scss/styles.scss";

const thumbBoxs = document.querySelectorAll(".video-mixin__thumb");

const handleMousemove = (event) => {
	event.target.nextSibling.classList.add("showing");
	event.target.removeEventListener("mousemove", handleMousemove);
	event.target.addEventListener("mouseleave", handleMouseleave);
};

const handleMouseleave = (event) => {
	event.target.nextSibling.classList.remove("showing");
	event.target.removeEventListener("mouseleave", handleMouseleave);
	event.target.addEventListener("mousemove", handleMousemove);
};

thumbBoxs.forEach((item) =>
	item.addEventListener("mousemove", handleMousemove)
);
