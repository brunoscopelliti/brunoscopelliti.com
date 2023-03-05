var g = window.BS_blog;
var get = g.$1;

var $year = get("[data-js='year']");

if ($year) {
  var today = new Date();
  $year.textContent = today.getFullYear();
}
