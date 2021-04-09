---
title: "Authentication to a RESTful web service in an AngularJS web app"
preview: "How to authenticate to a RESTful web service."
date: 2013-09-09T09:00:00+01:00
meta_description: "How to authenticate to a RESTful web service"
categories: "AngularJS"
layout: "post"
changefreq: "yearly"
lastmod: 2021-01-01T09:00:00+01:00
priority: 0.7
---

Last week I wrote about how to contact a RESTful web service in an AngularJS web application
using the [$resource service]({{< relref path=building-a-restful-web-service-with-angularjs-and-php-more-power-with-resource.md" >}} "Building a RESTful web service with AngularJS").

This post is about how to deal with web services which require authentication.

## Why to use http headers

Since RESTful paradigm is *stateless* we cannot manage authentication through sessions,
and in general we won't save on the web server any data about the state of the client.
So, each requests have to carry with them the state of the client. For this reason
the state of the client is stored as an header of the request itself.

## Custom headers with $http

Since AngularJS `$resource` is built upon the `$http` service, I want to start the post
showing how to set a custom header using the simple $http service.

In this case there are two ways to proceed. When we want that our custom header is appended
to each ajax requests, which is made from the application, we can just add our new header
to the array of the default headers.

```js
// Define a new http header,
// that will be used for each new xhr request
$http.defaults.headers.common["auth-token"] = "C3PO-R2D2";
```

In a real world scenario the authentication token is returned from the server, so the previous
snippet probably should be used as callback of a login procedure. Time ago I wrote a more generic
post about [user authentication]({{< relref path=deal-with-users-authentication-in-an-angularjs-web-app.md" >}} "Authentication in an AngularJS web application"), and most of the information contained in
that post could be useful also in this case.

We can change really a few of the previous snippet, to have an header used only for a
particular type of xhr request.

```js
$http.defaults.headers.delete = {};
$http.defaults.headers.delete ['auth-token'] = 'C3PO-R2D2';
// It will be used for each new xhr 'delete' request
// Easy!
```

In this case since $resource (again) is built upon $http, and since we are writing inside
`$http.defaults`, the headers which we set will be used also in the xhr requests that we made
through the $resource service... and this is great!

Another possibility is that we need to set a custom header only for a particular xhr request
(and not for all). In this case the best way to proceed is to use the headers property
of the configuration object passed as parameter of the methods of the $http service.
Just to make a simple example:

```js
$http.get("books", {
  headers: { "auth-token": "C3PO-R2D2" },
  params: { bookId: 42 }
}).success(function () {
  // Strive for success
});
```

The header that I set in this way will affect just this xhr request, and won't be present
in all the others.

## Custom headers with $resource

In my opinion the best things about the $resource service is the possibility to define our custom
request methods. In my previous post I defined the `loan` method:

```js
return $resource("/book/:bookId",
  { bookId: "@bookId" }, {
    loan: {
      method: "PUT",
      params: { bookId: "@bookId" },
      isArray: false
    }
  });
```

Sadly I don't know a simple way to set a custom header only for a $resource custom xhr request,
using a version of AngularJS prior than 1.2rc1. If you are aware of it I will be happy to read
the explanation of your approach in the comments, or to link your explanation.

... However if you've already embraced the future, and ported your web application
to the last version of AngularJS, there is really a simple way to set the custom header of each
of your xhr requests. In this case the previous snippet will become:

```js
return $resource("/book/:bookId",
  { bookId: "@bookId" }, {
    loan: {
      method: "PUT",
      params: { bookId: "@bookId" },
      isArray: false,
      /* Note the headers property */
      headers: { "auth-token": "C3PO-R2D2" }
    }
  });
```

## Conclusion

In conclusion, as said there are many ways to set custom headers, and we have just to understand
which one is the better fit for the needs of the web application we are building.
