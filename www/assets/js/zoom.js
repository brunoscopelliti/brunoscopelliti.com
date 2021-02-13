var g = window.BS_blog;
var get = g.$1;
var delegate = g.delegate;
var listen = g.listen;

function toggleZoom (event) {
  event.target.classList.toggle("is-zoomed");
}

var context = get("[data-js='post']");

if (context.dataset.zoomable == null) {
  listen("click", context, delegate(toggleZoom, "img.post-img-zoomable"));
  context.dataset.zoomable = true;
}