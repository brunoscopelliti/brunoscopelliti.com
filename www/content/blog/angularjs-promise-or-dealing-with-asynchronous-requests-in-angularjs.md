---
title: "AngularJS promise, or dealing with asynchronous requests in AngularJS"
preview: "In this post you'll discover the typical use cases of promise in AngularJS apps."
date: 2013-04-02T09:00:00+01:00
meta_description: "In this post you'll discover the typical use cases of promise in AngularJS apps."
categories: ["AngularJS", "Promise"]
layout: "post"
changefreq: "yearly"
lastmod: 2021-01-01T09:00:00+01:00
priority: 0.7
---

`Promise`'s support is one of my favorite features of AngularJS.

Promises help a lot by handling asynchronous return of data, and allow to assign properties synchronously even when the return is asynchronous.

This post will show you a typical use case for the promise in an AngularJS app.

It could be simplified as follows:

```js
function stageController(scope, p) {
  scope.revenues = [];

  scope.$watch("revenues", function () {
    p.drawPlot(scope.revenues);
  }, true);

  p.getData();
}

stageController.$inject = ["$scope", "plotterSrv"];
```

The `revenues` array is used by a service I wrote. It stores the data about my revenues across the months of the last year. I also defined a watcher for this variable, so every time it changes, a specific function is executed.

The service, `plotterSrv`, (in this simplified version) contains a method to make an asynchronous request to get the data, and another method to draw a plot using the data it gets back. So this is the backbone of the `plotterSrv` service:

```js
angular.module("myApp.services", [])
  .factory("plotterSrv", ["$http", function ($http) {
    return {
      getData: function () {
        // 1)
        // Asyncronous request to get the data.

        // ?
        // How could I update the revenues array?
      },
      drawPlot: function (d) {
        // 1)
        // Plot the data.
      }
    }
  }]);
```

To make all this work it is necessary to find a way to update the value of the `revenues` array defined in the controller.

AngularJS promises could solve this problem. So this is the `getData` method, written using AngularJS promises.

```js
getData: function () {
  var promise = $http({ method: "GET", url: "getData.php" })
    .success(function (data, status, headers, config) {
      return data;
    })
    .error(function (data, status, headers, config) {
      return {"status": false};
    });

  return promise;
}
```

Now `getData` returns a promise to the controller, and what remains to do is to handle the returned value in a callback function, using the [then()](https://docs.angularjs.org/api/ng/service/$q "AngularJS api: $q") AngularJS method. So in the controller I've to add the following code:

```js
p.getData().then(function (promise) {
  scope.revenues = promise;
});
```

Now when the service returns back the promise, its value is used to update the value of the revenues array. This will activate the watcher callback, that in this case is the `drawPlot` method, that has the task to create a plot. *Et voilà*.
