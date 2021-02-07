---
title: "Show route only after all promises are resolved"
preview: "This post is about a trick I learned this summer while reading the book AngularJS, by Brad Green."
date: 2013-09-17T09:00:00+01:00
meta_description: "How to delay view rendering in AngularJS till all AJAX requests are completed"
categories: "AngularJS"
layout: "post"
changefreq: "yearly"
lastmod: 2021-01-01T09:00:00+01:00
priority: 0.7
---

When a new route is requested in an AngularJS application, it is often necessary to retrieve data from the server to fill the template. If the server request takes too long to complete, it is possible that an incomplete view is presented to the user.

## Digging into the code

Let's start taking a look at the most important pieces of code (however you can find the complete source of the demo on [Github](https://github.com/blog-brunoscopelliti/route-loading-delay-demo "Github Repository")).

In a regular AngularJS web app, the routes are configured via methods in the `$routeProvider` object, as below:

```js
$routeProvider.when("/library", {
  templateUrl: "partials/library.html",
  controller: "LibraryCtrl",
  resolve: {
    books: function (srvLibrary) {
      return srvLibrary.getBooks();
    },
    movies: function (srvLibrary) {
      return srvLibrary.getMovies();
    }
  }
});
```

From this code, we can see that a route information object is passed in as the second parameter to the `when` method. The above example also includes the `resolve` property, that indicates which routes we want to appear only after the promises have been resolved. Quoting from the official docs:

*[The resolve property is] an optional map of dependencies which should be injected into the controller. If any of these dependencies are promises, they will be resolved and converted to a value before the controller is instantiated and the $routeChangeSuccess event is fired.*

To use this with AngularJS promises, the following is a simple implementation of the methods exposed by the `srvLibrary` service:

```js
angular.module("myApp.services", [])
.factory("srvLibrary", ["$http", function ($http) {
  var sdo = {
    getBooks: function () {
      var promise = $http({
        method: "GET",
        url: "api/books.php"
      });
      promise.success(function (data, status, headers, conf) {
        return data;
      });
      return promise;
    },
    getMovies: function () {
      var promise = $http({
        method: "GET",
        url: "api/movies.php"
      });
      promise.success(function (data, status, headers, conf) {
        return data;
      });
      return promise;
    }
  }
  return sdo;
}]);
```

Finally, to be able to use the resolved promises data in the controller it is necessary to inject these data into the controller, and attach them to the `$scope` variable.

```js
angular.module("myApp.controllers", [])
  .controller("LibraryCtrl", ["$scope", "books", "movies",
    function ($scope, books, movies) {
      $scope.books = books.data;
      $scope.movies = movies.data;
  }]);
```

This is all that is required to delay the loading of a new route until the promises are resolved. As a result, however, a user could be surprised by the fact that nothing happens after they click a link. It is therefore a good idea to implement an immediate visual feedback.

```js
var app = angular.module("myApp",
  ["myApp.services", "myApp.controllers"]);

app.run(["$rootScope", function ($root) {
  $root.$on("$routeChangeStart", function (e, curr, prev) {
    if (curr.$$route && curr.$$route.resolve) {
      // Show a loading message until promises aren't resolved
      $root.loadingView = true;
    }
  });
  $root.$on("$routeChangeSuccess", function (e, curr, prev) {
    // Hide loading message
    $root.loadingView = false;
  });
}]);
```

The following is one possible way to implement a loading message while waiting for the new route to appear.

```html
<div class="modal" ng-show="loadingView">
  <!-- loadingView is a variable defined in the $rootScope -->

  <!-- The loading animation is inspired by
    http://codepen.io/joni/details/FiKsd -->
  <ul id="loading">
    <li ng-repeat="i in [0,1,2,3,4,5,6,7,8,9]"></li>
  </ul>
</div>
```

Then when a new route is requested, it is enough to set `loadingView = true` if the route itself has pending promises.
