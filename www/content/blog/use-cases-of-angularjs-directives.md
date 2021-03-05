---
title: "Use cases of AngularJS directives"
preview: "I explore AngularJS directives, and some of their typical use cases within an application."
date: 2013-02-26T09:00:00+01:00
meta_description: "Use case of AngularJS directives"
categories: "AngularJS"
layout: "post"
changefreq: "yearly"
lastmod: 2021-01-01T09:00:00+01:00
priority: 0.7
---

A [directive](https://docs.angularjs.org/guide/directive "AngularJS Directive") is essentially a function executed when the AngularJS compiler finds its declaration into the DOM.
The function can do almost anything, but as common task we can consider defining a behavior or executing a DOM transformation.
A directive can be presented as an attribute, an element name, a class name, or a name in a comment.

AngularJS comes with a rich built-in set of directives, that can be even extended.

In this post we're covering some typical use cases for custom directives.

## Basic syntax for custom directives

Let's start from the basic syntax to create a custom directive.

For all the code samples in this page I started from the [angular-seed template](https://github.com/angular/angular-seed "Application skeleton for a typical AngularJS web app"); this makes quite easy to extract a model to begin to implement custom directives.

```html
<!doctype html>
<html ngApp="myApp">
  <head>
    <title>AngularJS examples</title>
  </head>
  <body>
    <div my-first-directive></div>
    <script src="lib/angular/angular.js"></script>
    <script src="js/app.js"></script>
    <script src="js/directives.js"></script>
  </body>
</html>
```

After including the directive in the html code, we have to instruct AngularJS about what to do when encounters the directive.

The angular-seed template suggests to accomplish this operation in a different javascript file; so in the js/directives.js file, I wrote something like:

```js
angular.module("myApp.directives", []).
  directive("myFirstDirective", function (injectables) {
    return function link (scope, element, attrs) {
      // Do stuff here
    }
  });
```

Now, a final step is required; in the main module - the one from which depends the entire application - we specify the dependencies.
So in the js/app.js file, I wrote:

```js
// No dependencies... this is not the case!
// angular.module("myApp", []);

// With dependencies:
angular.module("myApp", ["myApp.directives"]);
```

Now I will follow these steps to write a custom directive.

## Custom directives use cases
At the moment I see two principal scenarios, in which the use of directives could be very useful.

* **Directives allow code reusability.** Directives indeed could be used to split the code of a complex app into smaller pieces, which could be reused also in others pages, or even in others projects. A typical example could be an e-commerce web app: in this kind of app, there are some components that can't miss, like the cart, the item page etc. All these parts could be realized through directives.

* **Directives allow to save the two way data binding**, when AngularJS is used in conjunction with third party modules, eg. a jQuery plugin.

## Templating through directives

Let's start with a simple demo.

{{% codepen hash=Bepum %}}

The previous example is a super-simplified e-commerce site; it just consists of a search result page, and the shopping cart.

For the sake of simplicity, it is just possible to add an item to the cart, clicking on the special link; and when this is done, the count of the items in the cart will increase.

In every e-commerce web site there must be a shopping cart; it is usually present in every page of the site, so it's for sure a good idea to create a reusable template to model our shopping cart. We could do this thanks to AngularJS directives.

I started including in the html page the new custom directive:

```html
<shopping-cart></shopping-cart>
```

Since I used the directive as a new html element, in the directive definition object I have to specify a value for the `restrict` property.
Others properties allow to specify the template (made with real html elements) with which replace the `shopping-cart` element.

The second directive I wrote is probably more interesting to watch. I used this directive to model each result in the search result page.

```html
<div class="item" ng-repeat="i in items">
  <div item-card item-title="{{i.title}}" item-src="{{i.src}}" item-price="{{i.price}}"></div>
</div>
```

In the directive definition object of the `item-card` directive new properties appear.

The more interesting thing to note is the `scope` property in the directive definition object. It allows to create a new isolate scope. The isolate scope takes an object hash which defines a set of local scope properties derived from the parent scope.

```js
scope: {
  title: "@itemTitle",
  price: "@itemPrice",
  src: "@itemSrc"
}
```

This scope override the scope defined in the controller; this means that now is not possible to access the variables and the functions defined in the scope of the main controller. This is actually a problem, cause now

```html
<a ng-click="buyItem(title, price);">Add to cart</a>
```

won't works.

To resolve this situation I set the controller property, to specify a new controller specific for the isolate scope created before. This controller could be used in the same way we use the main controller.

```js
controller: function ($scope, $element, $attrs, $location) {
  $scope.addToCart = function (t, p) {
    // get the scope associated with the main controller
    var mainScope = angular.element("#main").scope();
    mainScope.buyItem(t, p);
    return false;
  };
}
```

And changing the template this way:

```html
<a ng-click="addToCart(title, price);">Add to cart</a>
```

This example could be used as starting point to show more sophisticated features of AngularJS, and maybe someday I will do this; but meanwhile let's pass to the second use case.

## Saving two way data binding through directives

If the first use case could be seen as an optimization of the code, there is another case in which the use of custom directives is not an option.

When your app grows up in complexity, sooner or later comes the time you would like to include a jQuery plugin, or another external library.

This could break the two way data binding (strong point of AngularJS) established between model and view.

{{% codepen hash=zIstF %}}

The solution to avoid this unpleasant inconvenience, as shown in the above example, is to wrap the plugin around an AngularJS directive, in conjunction with the using one of the following methods:

* `$watch(watchExpression, listener, objectEquality)`

  Registers a listener callback to be executed whenever the watchExpression changes ([docs](https://docs.angularjs.org/api/ng/type/$rootScope.Scope#$watch "AngularJS api: $watch")).

```js
// When the data changes, drawPlot() is executed
scope.$watch("data", function () {
  drawPlot();
}, true);
```

* `$apply(exp)`

  Execute an expression in angular from outside of the angular framework. For example from browser DOM events, timeouts, XHR or third party libraries ([docs](https://docs.angularjs.org/api/ng/type/$rootScope.Scope#$apply "AngularJS api: $apply")).

```js
scope.$apply(function () {
  scope.data = [];
});
```
