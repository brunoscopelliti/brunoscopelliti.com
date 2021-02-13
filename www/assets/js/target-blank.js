var g = window.BS_blog;
var getAll = g.$;

/**
 * Set target's attribute on external link.
 */
var $links = getAll("[data-js='post'] a");
for (var i = 0; i < $links.length; i++) {
  var $link = $links[i];
  if ($link.hostname !== location.hostname) {
    $link.setAttribute("target", "_blank");
    $link.setAttribute("rel", "noopener noreferrer");
  }
}