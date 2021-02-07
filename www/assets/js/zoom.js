function postContext () {
  return document.querySelector("[data-js='post']");
}

function onClick (event) {
  if (event.target.matches("img.post-img-zoomable")) {
    event.target.classList.toggle("is-zoomed");
  }
}

var context = postContext();

if (context.dataset.zoomable == null) {
  context.addEventListener("click", onClick);
  context.dataset.zoomable = true;
}
