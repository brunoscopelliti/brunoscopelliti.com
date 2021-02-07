---
title: "HTTP response interceptors"
preview: "Use HTTP response interceptors in an AngularJS web application."
date: 2013-07-10T09:00:00+01:00
meta_description: "HTTP response interceptors AngularJS application"
categories: "AngularJS"
layout: "post"
changefreq: "yearly"
lastmod: 2021-01-01T09:00:00+01:00
priority: 0.7
---

I've already wrote in the past about [asynchronous requests in AngularJS]({{< relref path=angularjs-promise-or-dealing-with-asynchronous-requests-in-angularjs.md" >}} "AngularJS promise"), showing how to assign a variable a value, synchronously, even when the value is retrieved asynchronously from the server.

One thing that I didn't wrote in that post, is that AngularJS allows to intercept the response coming from the server, before that the control of the execution is returned to the code that initiated the request. Have this possibility is useful for different reasons, but in general a response interceptor is needed every time the application needs to preprocess the response that it gets from the server.

## How to register Response Interceptor

Registering an http interceptor is not difficult, but requires the possibility to access the `$httpProvider` service provider, so generally this kind of operation is executed in the configuration section of the web application.

```js
var app = angular.module("demo", ["demo.controllers"]);

app.config(["$httpProvider", function ($httpProvider) {

  /*
   Response interceptors are stored inside the
   $httpProvider.responseInterceptors array.
   To register a new response interceptor is enough to add
   a new function to that array.
  */

  $httpProvider.responseInterceptors.push(["$q", function ($q) {

    // More info on $q: docs.angularjs.org/api/ng.$q
    // Of course it's possible to define more dependencies.

    return function (promise) {

      /*
       The promise is not resolved until the code defined
       in the interceptor has not finished its execution.
      */

      return promise.then(function (response) {

        // response.status >= 200 && response.status <= 299
        // The http request was completed successfully.

        /*
         Before to resolve the promise
         I can do whatever I want!
         For example: add a new property
         to the promise returned from the server.
        */

        response.data.extra = "Interceptor strikes back";

        // ... or even something smarter.

        /*
         Return the execution control to the
         code that initiated the request.
        */

        return response;

      }, function (response) {

        // The HTTP request was not successful.

        /*
         It's possible to use interceptors to handle
         specific errors. For example:
        */

        if (response.status === 401) {

          // HTTP 401 Error:
          // The request requires user authentication

          response.data = {
            status: false,
            description: "Authentication required!"
          };

          return response;

        }

        /*
         $q.reject creates a promise that is resolved as
         rejectedwith the specified reason.
         In this case the error callback will be executed.
        */

        return $q.reject(response);

      });

    }

  }]);

}]);
```

This is everything you need to start using response interceptor.

Now the response for each requests like the following will be preprocessed by the response interceptor.

```js
$http.get("/my/service")
  .success(function (data, status, headers, config) {

    // If the user is logged
    console.info(data.extra);
      // > "Interceptor strikes back"   

    // If the user is not logged
    console.info(data.description);
      // > "Authentication required!"

  })
  .error(function (data, status, headers, config) {

    // Executed if the server returns an HTTP error code != 401

  });
```
