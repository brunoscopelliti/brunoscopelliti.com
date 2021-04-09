---
title: "Building a RESTful service with AngularJS (and PHP)"
preview: "This is a two parts post about how to integrate an AngularJS application with a RESTful service."
date: 2013-09-03T09:00:00+01:00
meta_description: "Implementation of a RESTful service"
categories: "AngularJS"
layout: "post"
changefreq: "yearly"
lastmod: 2021-01-01T09:00:00+01:00
priority: 0.7
---

This is a two parts post about how to make [RESTful](http://en.wikipedia.org/wiki/Representational_State_Transfer "Wiki: Representational state transfer (REST)")
requests through an AngularJS web application.

The index of this brief series of posts is quite simple.

* **Backend setup** is the first post in the series. As the subtitle, its main focus is
(at least this time) on the backend domain. It will tackle how to setup a RESTful web service.
I used PHP for all the examples; however at least the basic concepts beyond a RESTful service
are language agnostic.

* [**More power with $resource**]({{< relref path=building-a-restful-web-service-with-angularjs-and-php-more-power-with-resource.md" >}} "More power with $resource") is focused on AngularJS. This post will tackle how to handle RESTful
requests through a web application specifically powered by AngularJS. The publication
of this post is scheduled for 5 September.

## A simple RESTful web service

A RESTful web service uses HTTP requests to create, read, update and delete data.

This post will guide you through the creation of a web service that manages the data
about a library. The web service makes possible to access the data about a specific book,
or retrieve the list of all the books of the library.

```text
GET book/42
// Retrieve the book with ID = 42

GET book
// Retrieve all the books
```

It also makes possible to save a new book, or to update the information about an existing book.

```text
POST book
// Create a new book entry.
// Information about the new entry are in the POST data.

PUT book/42
// Update the data of the book with ID = 42
```

`PUT`, and `POST` are basically interchangeable; the norm is to use PUT when in
the request is specified the URL of the resource.

Finally the web service should also allow to delete a book.

```text
DELETE book/42
// Delete the book with ID = 42
```

How can you see the URLs are really similar, or completely equals... but they are
supposed to do different operations and send different responses. In the following
of this post I will introduce the code to create a such type of web service.

## Redirect of the requests

First thing to do is to make possible that each request is managed by the same file.
In order to obtain that each request is managed with the same process, it is necessary
to add the following rule to the .htaccess file of the web server.

```text
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteBase /book/
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /handlers/libraryManager.php [L]
</IfModule>
```

In this way each request towards an url starting with */book/* is redirected to
the */handlers/libraryManager.php* file.

## Handle the different requests

We just saw how to centralize the management of the requests.

To complete the web service it is necessary to add to our *libraryManager* the logic
to handle different type of requests in different manners. To achieve this,
it is important to understand that the different kind of requests are different
essentially for three factors:

* **Request method**.

  The method can be anyone of the HTTP methods (`GET`, `POST`, `PUT` or `DELETE`).

  Assuming PHP as server side language, the method used for a particular request
  is available in the variable `$_SERVER['REQUEST_METHOD']`.

```php
// The behaviour has to be different on the basis
// of the request method.

switch ($_SERVER["REQUEST_METHOD"]) {
  case "GET":
    // get stuff
    break;
  case "DELETE":
    // delete stuff
    break;
}
```

* **Requested url**.

  The URL is available as `$_SERVER["REQUEST_URI"]`.

```php
// It is possible to explode the requested URL.
explode("/", $_SERVER["REQUEST_URI"]);
```

* **Additional data**, optional.

```php
// For GET, or POST
// PHP makes available the $_GET, and $_POST arrays.

$id = $_GET["id"];
$title = $_POST["title"];

// Also PUT (and DELETE) request can be accompanied by
// additional information.
// Unlike the GET, or POST method, there is not a built in way  
// to reference these data.
// But in this case it is necessary the following code:

$data = json_decode(file_get_contents("php://input"), false);
```

Basing on this, I wrote the web service as follows. Please note how the implementation
of each action is hidden inside the Library object.

```php
require_once "../classes/Library.php";

$obj = new Library();

switch ($_SERVER["REQUEST_METHOD"]) {

  case "GET":

    $id = explode("book/", $_SERVER["REQUEST_URI"]);

    if (isset($id[1])){

      /*
       Query the database to get the information
       about the book with ID = $id[1]
      */

      $result = $obj->get_book_by_id($id[1]);

    }
    else {

      /*
       Query the database to get the information
       about all the books
      */

      $result = $obj->get_books();

    }

    break;

  case "POST":

    // Save a new record in the database

    $result = $obj->register_new_book($_POST);

    break;

  case "PUT":

    // Retrieve additional data
    $d = json_decode(file_get_contents("php://input"), false);

    $result = $obj->loan_book($d);

    break;

  case "DELETE":

    $id = explode("book/", $_SERVER["REQUEST_URI"]);

    if (isset($id[1])){
      $result = $obj->delete_book($id[1]);
    }

    break;

}

$json = json_encode($result);
echo $json;
```

## HTTP Status Code

The web service written in the previous section is 100% working. However it can't be
considered yet a RESTful service, because it still does not use appropriate
[HTTP status codes](http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html "HTTP Status Code")
for the responses.

This is really bad, even worse because PHP offers a really easy way to set HTTP code through
the [header](http://php.net/manual/en/function.header.php "PHP api: header") function.

For example, if the web service should be accessible only to logged users, it has to respond
with a 401 error message to users who are not logged to the system.

```php
session_start();
if (!isset($_SESSION["user"])) {
  header("HTTP/1.1 401 Unauthorized");
  return;
}
```

Or, just to make another example, if the web service is just for reading operations,
it is possible to respond with the **405** error message to all the methods, but the GET.

```php
if ($_SERVER["REQUEST_METHOD"] == "GET") {
  // read stuff
}
else {
  header("HTTP/1.1 405 Method Not Allowed");
}
```

## Conclusion

Great! Now, our RESTful web service is ready, and it is just waiting of requests.

In a few days will be published also the second (and last) part of this mini series,
and I'll cover how to send requests to this web service through a web application built
with AngularJS.
