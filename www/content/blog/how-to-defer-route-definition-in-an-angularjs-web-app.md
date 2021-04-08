---
title: "Defer routes definition in an AngularJS web app"
preview: "Recently, for a project built on AngularJS, I found myself in front of an unusual requirement: I needed to define dynamically the routes of the web application, on the basis of a response from the server."
date: 2013-06-04T09:00:00+01:00
meta_description: "How to defer routes definition in an AngularJS application"
categories: "AngularJS"
layout: "post"
changefreq: "yearly"
lastmod: 2021-01-01T09:00:00+01:00
priority: 0.7
---

Recently, for a project built on AngularJS, I found myself in front of an unusual requirement:
I needed to define dynamically the routes of the web application, on the basis of a response
from the server.

## Server response

For the sake of simplicity, I assume to have the following backend service, that when called,
sends a JSON containing the data about the routes.

```php
$result = array(
  "routes" => array(
    array("name" => "/home",
      "templateUrl" => "partials/home.html",
      "controller" => "HomeCtrl",
      "isFree" => true),
    array("name" => "/contact",
      "templateUrl" => "partials/contact.html",
      "controller" => "ContactCtrl",
      "isFree" => true),
    array("name" => "/about",
      "templateUrl" => "partials/about.html",
      "controller" => "AboutCtrl",
      "isFree" => true)
  ),
  "default" => "/home"
);

$json = json_encode($result);
echo $json;
```

## Deferred Routes Definition

Normally routes are defined in the configuration block, because the
[$routeProvider](https://docs.angularjs.org/api/ng/provider/$routeProvider "AngularJS api: $routeProvider")
can be used only there.

Unfortunately when the configuration block is executed all the most important services
of AngularJS are still `undefined`; for this reason it's not possible to use `$http`
to query the server for the route list. So in the configuration block I just created a global
reference to `$routeProvider`, which can be used practically everywhere to configure
the routes of the web application.

```js
"use strict";

var $routeProviderReference;
var app = angular.module("myApp", ["myApp.controllers"]);

app.config(["$routeProvider", function ($routeProvider) {
  $routeProviderReference = $routeProvider;
}]);
```

Now, to get the other routes, the first step is to query the server to get the data.

This should be done as soon as possible; and for this reason the best solution is to usethe `run`
method to register a callback that is executed when the injector is done loading all modules.

```js
app.run(["$rootScope", "$http", "$route",
  function ($rootScope, $http, $route) {
    $http.get("get-routes.php").success(function (data) {   
      var j, currentRoute;
      var def = data.default;
      for (j = 0; j < data.routes.length; j++) {
        currentRoute = data.routes[j];
        $routeProviderReference.when(currentRoute.name, {
          templateUrl: currentRoute.templateUrl,
          controller: currentRoute.controller,
          isFree: currentRoute.isFree
        });
      }

      $routeProviderReference.otherwise({ redirectTo: def });

      $route.reload();
    });
  }]);
```

## A word on possible applications

Last week I wrote a post about an approach to [user authentication in AngularJS web app]({{< relref path=deal-with-users-authentication-in-an-angularjs-web-app.md" >}} "Deal with users authentication in an AngularJS web app"); and in this occasion I already wrote about how to keep reserved
the reserved content of a web application. Of course deferring the definition of the routes,
and differentiating the available routes for a logged user, from those available to a simple
visitor, can help to achieve this purpose.
