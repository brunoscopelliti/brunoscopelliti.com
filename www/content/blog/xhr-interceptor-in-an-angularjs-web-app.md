---
title: "XHR interceptor in an AngularJS web app"
preview: "AngularJS allows to intercept the response coming from the server."
date: 2013-11-19T09:00:00+01:00
meta_description: "XHR Interceptor in an AngularJS application"
categories: "AngularJS"
layout: "post"
changefreq: "yearly"
lastmod: 2021-01-01T09:00:00+01:00
priority: 0.7
---

I already wrote about [intercepting XHR responses in an AngularJS web app]({{< relref path=http-response-interceptors.md" >}} "$http response interceptors"). 

In the meanwhile, the method I described has been deprecated, and  *AngularJS 1.2 timely-delivery* was delivered - I really admire the guy who choose names for AngularJS releases - and we now have a stable and better way to intercept XHR requests and responses in our web app. We'll start by looking at how to define a new interceptor, using this new best practice.

The following code has to be placed inside the config section of the web app (the only place of your app where the *service providers* are accessible).

```js
$httpProvider.interceptors.push(["$q", function ($q) {
  return {

    // All the following methods are optional

    request: function (config) {
      // Called before send a new XHR request.
      // This is a good place where manipulate the
      // request parameters.

      return config || $q.when(config);
    },

    requestError: function (rejection) {
      // Called when another request fails.

      // I am still searching a good use case for this.
      // If you are aware of it, please write a comment

      return $q.reject(rejection);
    },

    response: function (response) {
      // Called before a promise is resolved.

      return response || $q.when(response);
    },

    responseError: function (rejection) {
      // Called when another XHR request returns with
      // an error status code.

      return $q.reject(rejection);
    }

  }

}]);
```

Now that it's clear how to create XHR interceptor, let's take a look at why we should use XHR interceptor in a web application.

## XHR request interceptor

It may surprise some readers, but by default in AngularJS the payload of a POST request is always in JSON format. This means that, for example, if PHP is your backend language, you won't find any data in your `$_POST` array. Instead, you can use the PHP function `file_get_contents` to read the payload.

```php
if(stripos($_SERVER["CONTENT_TYPE"],"application/json")==0){
  $data = json_decode(file_get_contents("php://input"), true);
}
```

All this pain can be avoided with the savvy use of request interceptors. To achieve this, first change the default content-type header used by AngularJS (need more info about [request header]({{< relref path=authentication-to-a-restful-web-service-in-an-angularjs-web-app.md" >}} "Set xhr http header in an AngularJS web application")?). This should do the trick:

```js
$http.defaults.headers.post["Content-Type"] = 
  "application/x-www-form-urlencoded; charset=UTF-8;";
// You could place this everywhere; the only condition is
// that the $http service is in that scope.
```

We can then use the request interceptor to encode the payload:

```js
$httpProvider.interceptors.push(["$q", function ($q) {
  return {
    request: function (config) {
      if (config.data && typeof config.data == "object") {

        // Before the request starts,
        // the interceptor serializes the data object
        // as a string.

        config.data = serialize(config.data);
        // Check
        // https://gist.github.com/brunoscopelliti/7492579
        // for a possible implementation of serialize.

      }
      return config || $q.when(config);
    }
  };
}]);
```

## XHR response interceptor

In my experience response interceptors are particularly helpful to handle specific error case.

In my previous post about XHR interceptors, I wrote about how to intercept a 401 (Unauthorized) error response. Let's rewrite that example with this new approach.

```js
$httpProvider.interceptors.push(["$q", function ($q) {
  return {
    response: function (response) {
      // response.status === 200
      return response || $q.when(response);
    },
    responseError: function (rejection) {
      // Executed only when the XHR response
      // has an error status code

      if (rejection.status == 401) {

        // The interceptor "blocks" the error;
        // and the success callback will be executed.

        rejection.data = {stauts: 401, descr: "unauthorized"}
        return rejection.data;
      }

      // $q.reject creates a promise that is resolved as
      // rejected with the specified reason.
      // In this case the error callback will be executed.

      return $q.reject(rejection);
    }
  }
}]);
```
