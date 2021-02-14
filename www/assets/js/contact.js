var g = window.BS_blog;
var get = g.$1;
var listen = g.listen;
var send = g.ajax;

var $form = get("[data-js='contact']");
var $button = get("[type='submit']", $form);

function onSubmit (event) {
  event.preventDefault();

  send($form.method, $form.action, new FormData($form), onSuccess, onError);

  function onSuccess() {
    var $result = get("[data-js='result']", $form);

    $button.style = "display: none ";
    $form.reset();

    if ($result) {
      $result.innerHTML = "Thanks!";
    }
  }

  function onError() {
    var $result = get("[data-js='result']", $form);
    if ($result) {
      $result.innerHTML = "Oops! There was a problem.";
    }
  }
}

listen("submit", $form, onSubmit);
