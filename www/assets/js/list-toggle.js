var g = window.BS_blog;
var get = g.$1;
var listen = g.listen;

var button = get("[data-js='toggle-btn']");
var list = get("[data-js='list']");

var state = {
  expanded: false
};

function onToggle () {
  var expanded = state.expanded = !state.expanded;

  var label = expanded
    ? "Show less"
    : "Show more";

  button.textContent = label;

  button.setAttribute("aria-label", 
    button.getAttribute("aria-label").replace(/Show (less|more)/, label));

  button.setAttribute("aria-expanded", String(expanded));

  list.classList.toggle("expanded");
}


listen("click", button, onToggle);