---
title: "A directive to manage file upload in an AngularJS application"
preview: "I've wrote a custom AngularJS directive to handle file upload."
date: 2013-06-25T09:00:00+01:00
meta_description: "AngularJS directive to handle file upload"
categories: "AngularJS"
layout: "post"
changefreq: "yearly"
lastmod: 2021-01-01T09:00:00+01:00
priority: 0.7
---

This week I needed to add the functionality of file upload to an AngularJS web application. Since the project already uses jQuery, I found that the best solution to build an asynchronous file uploader was to rely on the well known (and wonderful) jQuery plugin [jquery.form](http://www.malsup.com/jquery/form/ 'jQuery.form plugin, by M. Alsup'), created by M. Alsup.

At the end I wrote an AngularJS directive to have a component, that I can reuse in my next projects. I will share it in this post.

## Getting started

In order to get started using the directive, we had to include in the project jQuery, and the jquery.form plugin. There are no further preliminary operations.

```html
<script type="text/javascript" src="jquery.2.0.2.js"></script>
<script type="text/javascript" src="jquery.form.js"></script>
```

Cool, let's procede to the code of the directive.

## The uploader directive

Lately, I really like create new HTML elements... and in an effort of fantasy, I simply called the directive to upload file: `uploader`. It's possible to use it almost everywhere, but in a form. It's easy as:

```html
<form enctype="multipart/form-data">
  <uploader action="uploader.php"></uploader>
</form>
```

You may ask why I setted the action attribute on the uploader element, instead that on the form. This is due to the fact that, when an action attribute is defined for a form, by default AngularJS reloads the page when the form is submitted. I really don't want this behaviour (and nobody wants it more in 2013), so I will use the action attribute just for the time in which I will really need it.

## Inside the uploader

It's time to look inside the `uploader` element.

I defined its body into a separated HTML file (that with an effort of fantasy I called uploader.html), that then I will reference as template from the directive definition object. This is its content:

```html
<!-- uploader.html template -->
<div class='uploader'>

  <!-- the real input[type=file] is hidden -->
  <input type='file' name='uploader' style='display:none;'
     onchange='angular.element(this).scope().sendFile(this);'/>

  <!-- input field, used to open the real input[type=file]  -->
  <div class='fake-uploader'>
    <label for='uploader'></label>
    <input type='text' readonly='readonly' ng-model='avatar'/>
  </div>

  <!-- progress bar -->
  <div class='progress' ng-show='progress!=0'>
    <div class='bar' style='width:{{ '{{ progress ' }}}}%;'></div>
  </div>

</div>

<!-- preview -->
<div ng-if='avatar != ""' style='margin: 50px 0 0;'>
  <img ng-src='upload/{{ '{{ avatar ' }}}}'/>
</div>
```

Two things to note here; the first is that I'm hiding the real file input element (I really don't like how it looks)... I replaced it with a classic text input file, in readonly mode, that I will also use to trigger a click on the hidden input file.
The second thing is the way I bound the change event on the input file:

```js
// retrive the scope of 'element'
angular.element(element).scope();
```

Since I used the old classic `onchange` attribute, I need to get the current scope... once this is done, it's possible to use all the method defined in the current scope.

## The directive definition

Finally, it's time to give a sight to the directive's definition. To maintain the code as compact as possible, I will start showing the backbone of the directive, then I will go deeper to each section.

```js
var dir = angular.module("app.directives", []);
dir.directive("uploader", [function () {

  return {
    restrict: "E",
    scope: {

      // scope
      // define a new isolate scope

    },
    controller: ["$scope", function ($scope) {

      // controller:
      // here you should define properties and methods
      // used in the directive's scope

    }],
    link: function (scope, elem, attrs, ctrl) {

      // link function
      // here you should register listeners

    },
    replace: false,
    templateUrl: "uploader.html"
  };

}]);
```

I used the `scope` property to create a new isolated scope for the directive. In this isolated scope I defined the `action` property, that takes its value from the DOM, exactly from the action attribute, that I previously setted on the uploader element.

```js
scope: {
  action: "@"
}
```

If you can't understand this step, you'll find useful the AngularJS doc about the [directive definition object](https://docs.angularjs.org/guide/directive#directivedefinitionobject 'AngularJS Docs: Directive Definition Object').

As I anticipated, since the input file is hidden, I need to trigger a click on it via javascript... the link function is the right place where to place the event listeners:

```js
link: function (scope, elem, attrs, ctrl) {
  elem.find(".fake-uploader").click(function () {
    elem.find("input[type='file']").click();
  });
}
```

Finally, in the `controller` property, I defined the `sendFile` method, that wraps the `ajaxSubmit` api of the jquery.form plugin.

```js
controller: ["$scope", function ($scope) {

  $scope.progress = 0;
  $scope.avatar = "";

  $scope.sendFile = function (el) {

    var $form = $(el).parents("form");

    if ($(el).val() == "") {
      return false;
    }

    $form.attr("action", $scope.action);

    $scope.$apply(function () {
      $scope.progress = 0;
    });       

    $form.ajaxSubmit({
      type: "POST",
      uploadProgress: function (evt, pos, tot, percComplete) {

        $scope.$apply(function () {
          // upload the progress bar during the upload
          $scope.progress = percentComplete;
        });

      },
      error: function (evt, statusText, response, form) {

        // remove the action attribute from the form
        $form.removeAttr("action");

        /*
          handle the error ...
        */

      },
      success: function (response, status, xhr, form) {

        var ar = $(el).val().split("\\"),
          filename =  ar[ar.length-1];

        // remove the action attribute from the form
        $form.removeAttr("action");

        $scope.$apply(function () {
          $scope.avatar = filename;
        });

      },
    });

  }

}]
```

More information about the ajaxSubmit api can be found in the documentation pages, [api](http://malsup.com/jquery/form/#api 'jQuery Form plugin api') and [options](http://malsup.com/jquery/form/#options-object 'jQuery Form plugin options'), that I strongly recommend.

In conclusion, I just want to invite you to note (again, if you read also my previous posts) the use of the [$apply](https://docs.angularjs.org/api/ng/type/$rootScope.Scope#$apply 'AngularJS api: $apply') method, needed to reflect in AngularJS all the operations, which come from outside the framework.

## The backend

For the sake of completeness this is the content of the uploader.php, that I used to upload the files.

```php
move_uploaded_file($_FILES["uploader"]["tmp_name"],
  "upload/" . $_FILES["uploader"]["name"]);
```

To be sincere there is a little more inside my original uploader.php, but this will be enough to a basic uploader.
