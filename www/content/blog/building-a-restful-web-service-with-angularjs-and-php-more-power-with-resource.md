---
title: "Building a RESTful web service with AngularJS $resource"
preview: "This is a two parts post about how to integrate an AngularJS application with a RESTful service."
date: 2013-09-05T09:00:00+01:00
meta_description: "Advantages of using AngularJS's $resource, over the built-in $http service"
categories: "AngularJS"
layout: "post"
changefreq: "yearly"
lastmod: 2021-01-01T09:00:00+01:00
priority: 0.7
---

This is a two parts post about how to make [RESTful](http://en.wikipedia.org/wiki/Representational_State_Transfer "Wiki: Representational state transfer (REST)")
requests through an AngularJS web application.

The index of this brief series of posts is quite simple.

* [**Backend setup**]({{< relref path=building-a-restful-service-with-angularjs-and-php-backend-setup.md" >}} "Setup a RESTful api") is the first post in the series. As the subtitle, its main focus
is (at least this time) on the backend domain. It will tackle how to setup a RESTful web service.
I used PHP for all the examples; however at least the basic concepts beyond a RESTful service
are language agnostic.

* **More power with $resource** is focused on AngularJS. This post will tackle how to handle RESTful
requests through a web application specifically powered by AngularJS. The publication of this post
is scheduled for 5 September.

## $http or $resource?

In all the posts about AngularJS that I wrote until now, every time that it was necessary
to make an asynchronous request to the server I used the [$http](https://docs.angularjs.org/api/ng/service/$http "AngularJS api: $http") service. So now, probably you're asking yourself where do
[$resource](https://docs.angularjs.org/api/ngResource/service/$resource "AngularJS api: $resource")
come from.

`$resource` is a separate, optional module of AngularJS, built over `$http`.
It allows to create a javascript object that represents the data model. In this way each operation
computed on the object created through it, is performed also on the server.
$resource should be used instead of $http each time the web application has to deal with a RESTful
web service.

```js
var r = $resource(url, [defaultParameters], [customActions]);

/*
 - url: parameterized url template.
   Parameters are prefixed by ":"
   for example /book/:bookId
 - defaultParameters: object containing default values
    for url's parameter
   for example { bookId: 42 }
 - customActions: allows to extend the resource object with
   custom actions
   for example:

   {actionName: {
     method: '',
     params: {},
     isArray: true/false }}

   - method: HTTP request method
   - params: additional parameters
   - isArray: true if the expected returned object is an array
*/

console.info(r);

// r expones the methods for the default set of
// resource actions

// for example:
// r.get({bookId: 42}) sends a GET request to /book/42
```

## Start using $resource

As I said previously $resource is a separate module of AngularJS; it is defined
in the angular-resource.js file, often downloaded with angular.js.

To use $resource there are three easy things to do:

* Include the source file, immediately after the source of angular.js, and ideally
just before the end of the body.

```html
<script src="angular.js"></script>
<script src="angular-resource.js"></script>

<!-- ... more javascript ... -->

</body>
```

* Include `ngResource` in the declaration of your web application module.

```js
var myApp = angular.module("myApp", ["ngResource"]);
```

* Inject $resource everywhere it will be used. The best choice is to wrap the JavaScript
model object into an AngularJS service, in this way we'll get each of the advantages of
using services:

```js
myApp.factory("Books", ["$resource", function ($resource) {
  return $resource( "/book/:bookId",
    { bookId: "@bookId" }, {
      loan: {
        method: "PUT",
        params: { bookId: "@bookId" },
        isArray: false
      }
      /* , method2: { ... } */
    } );
}]);
```

At this point it is really simple to send requests to the web service, that we build
in the previous post.

Everywhere it is possible to inject the `Books` service it is possible to write:

```js
postData = {
  "id": 42,
  "title": "The Hitchhiker's Guide to the Galaxy",
  "authors": ["Douglas Adams"]
}

Books.save({}, postData);
// It sends a POST request to /book.
// postData are the additional post data

Books.get({ bookId: 42 });
// Get data about the book with id = 42

Books.query();
// It is still a GET request, but it points to /book,
// so it is used to get the data about all the books

Books.loan({ bookId: 42 });
// It is a custom action.
// Update the data of the book with id = 42

Books.delete({ bookId: 42 });
// Delete data about the book with id = 42
```
