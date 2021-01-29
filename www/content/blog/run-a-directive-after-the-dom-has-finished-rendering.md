---
title: "How to execute an AngularJS directive after the DOM has completed rendering"
preview: "Rendering an AngularJS directive after DOM is rendered is a common requirement. In this post I'll show you how to do it."
date: 2013-03-04T09:00:00+01:00
meta_description: "How to execute an AngularJS directive after the DOM has finished rendering"
categories: "AngularJS"
layout: "post"
changefreq: "yearly"
lastmod: 2021-01-01T09:00:00+01:00
priority: 0.7
---

You have a custom directive, `repeatHelloWorld`; it has the important task to log the message "Hello, world!" in the console, the number of times specified by the parameter accepted by the directive, and defined in the controller.

```html
<body ng-controller="stageController">
  <div repeat-hello-world="{{ "{{ repeat " }}}}"></div>
</body>
```

Controller and directive are defined as:

```js
// Controller
function stageController($scope) {
  $scope.repeat = 5;
}

angular.module("myApp", ["myApp.directives"]);

// Directive
angular.module("myApp.directives", [])
  .directive("repeatHelloWorld", function () {
    return {
      link: function (scope, elem, attrs, ctrl) {
        var hello = function () {
          for (var i = 0; i < attrs.repeatHelloWorld; i++) {
            console.log("Hello world!");
          }
        }

        hello();
      }
    }
  });
```

Everything looks ok, but when you run the page, the console remains empty. This is due to the fact that when the directive is executed the DOM has not already finished the rendering. In fact, if we debug the code, we immediately recognize that `attrs.repeatHelloWorld` is `undefined` during the execution of the `link` function.

## The solution

To run the directive after the DOM has finished rendering you should postpone the execution, for example using the `setTimeout` function.
AngularJS has a method wrapper for the `window.setTimeout` function, that is [$timeout](https://docs.angularjs.org/api/ng/service/$timeout 'AngularJS api: $timeout').

`$timeout` adds a new event to the browser event queue (the rendering engine is already in this queue) so it will complete the execution before the new timeout event.

So in the end in our directive we have just to replace `hello();` with the following:

```js
$timeout(hello, 0);
```
