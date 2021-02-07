---
title: "Deal with users authentication in an AngularJS web app"
preview: "How to recognize, and maintain the auth state of an user between different routes of an AngularJS application."
date: 2013-05-21T09:00:00+01:00
meta_description: "Authentication in AngularJS application"
categories: "AngularJS"
layout: "post"
changefreq: "yearly"
lastmod: 2021-01-01T09:00:00+01:00
priority: 0.7
---

In this post I'm going to share few thoughts on the main issues related to users authentication in an AngularJS application.

I will talk about how to recognize, and maintain, the status of authentication of an user (that is, if they're logged in, or not) between the different routes of an AngularJS web application. Moreover I will also explain how to handle the case of a not authenticated user, who is trying to access a page, that requires the user to be logged in.

Before going into the details of my approach, it is very important to clarify that, because the user has full control of the browser, each control implemented with front-end technologies, **must** be repeated also in the backend.

## Recognize an authenticated user

There're probably several ways to recognize an authenticated user; indeed it's possible to set a global variable, or create a cookie... but my favorite way to reach the objective is to use an AngularJS service.

This approach give me several advantages.

* The first advantage is strictly related to the real nature of each AngularJS service; services are singletons, so there is only one instance of each service... and this allow to share data between different views, controller, directives, filters, and others services, without the need to overpopulate global scope.

* The second thing that I like about using a service, is that it's possible to use it also to store others informations about the user (when they're logged in).
Just as example this is a simplified version of the service that I used to recognize if the user is already authenticated.

```js
services.factory("UserService", [function () {
  return {
    isLogged: false,
    username: ""
  };
}]);
```

Are you wondering about how to use this service?

Well the first step is without any doubt to inject it, everywhere it is needed; for example in the controller of the login route:

```js
var ctrl = angular.module("myApp.controllers", []);

/* ... */

ctrl.controller("loginCtrl", ["$scope", "$http", "UserService",
  function (scope, $http, User) { /* ... */ }]);
```

In the `loginCtrl` controller, as you can see, it's defined the login function.

Here for the sake of simplicity I omitted a lot of superfluous code... indeed the most important thing to note is how I used the success, and error callback of the ajax request to set the properties of the `UserService` service.

```js
/* ... */

scope.login = function () {
  // configuration object
  var config = { /* ... */ }

  $http(config)
    .success(function (data, status, headers, config) {
      if (data.status) {
        // succefull login
        User.isLogged = true;
        User.username = data.username;
      }
      else {
        User.isLogged = false;
        User.username = "";
      }
    })
    .error(function (data, status, headers, config) {
      User.isLogged = false;
      User.username = "";
    });
}

/* ... */
```

In this way, everywhere I inject the `UserService` service, its `isLogged` property tells me if the user is already authenticated or not.

## Keep reserved content... reserved

Every not trivial website out there has different type of pages; there are pages that everybody, even a casual visitor should be able to see, and others pages, which require the user to be logged, or to have particular administrative grants. For a web application, and in particular for a web app powered by AngularJS, the concept applies equally, just replace the word "page", with the word "route".

So now, it's necessary a simple way to say who can see each route of our web app... at the end I come out with the following solution.

The `$routeProvider` is used to configure routes, and this is really simple with AngularJS:

```js
app.config(["$routeProvider", function ($routeProvider) {
  $routeProvider.when("/login", {
    templateUrl: "partials/login.html",
    controller: "loginCtrl"
  });
  $routeProvider.when("/main", {
    templateUrl: "partials/main.html",
    controller: "mainCtrl"
  });
  $routeProvider.otherwise({ redirectTo: "/main" });
}]);
```

The previous snippet uses the AngularJS [when()](http://docs.angularjs.org/api/ng.$routeProvider#when "AngularJS api: $when") function. It accepts two parameters: the first parameter is the path of the route; the second is an object containing the information to be assigned to the current route.

So, this object can be used to store the information about the level of accessibility of each route. As example, the following snippet shows how the definition of the login route looks like:

```js
$routeProvider.when("/login", {
  templateUrl: "partials/login.html",
  controller: "loginCtrl",
  access: {
    isFree: true
  }
});
```

Now, every time the user try to navigate to a new route, we have to check if they really can access that specific route. I wrote a directive for this purpose:

```js

directives.directive("checkUser", ["$rootScope", "$location", "userSrv",
  function ($root, $loc, userSrv) {
    return {
      link: function (scope, elem, attrs, ctrl) {
        $root.$on("$routeChangeStart", function (e, curr, prev){
          if (!prev.access.isFree && !userSrv.isLogged) {
            // reload the login route
          }
          /*
          * IMPORTANT:
          * It's not difficult to fool the previous control,
          * so it's really IMPORTANT to repeat server side
          * the same control before sending back reserved data.
          */
        });
      }
    }
  }]);
```

I omitted some details from the previous snippet; however the thing that is most worth to be noted is how I used the directive to register a callback in the `$rootScope`, for the `$routeChangeStart` event, fired before that the route changes.
