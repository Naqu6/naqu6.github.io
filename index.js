document.querySelector(".about-us-link").onclick = function(event) {
	event.preventDefault();
	document.querySelector(".about-us").scrollIntoView();
}

document.querySelector(".services-link").onclick = function(event) {
	event.preventDefault();
	document.querySelector("#services").scrollIntoView();
}

document.querySelector(".contact-link").onclick = function(event) {
	event.preventDefault();
	document.querySelector("#contact").scrollIntoView();
}

document.querySelector(".order-online-link").onclick = function(event) {
	event.preventDefault();
	document.querySelector("#order-online").scrollIntoView();
}