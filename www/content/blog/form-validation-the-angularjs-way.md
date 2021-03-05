---
title: "Form validation, The AngularJS Way"
preview: "An overview of form validation in an AngularJS web application."
date: 2013-03-12T09:00:00+01:00
meta_description: "Client side form validation in an AngularJS web application."
categories: "AngularJS"
layout: "post"
changefreq: "yearly"
lastmod: 2021-01-01T09:00:00+01:00
priority: 0.7
---

Recently I started to develop my first real AngularJS web app; it shouldn't be anything complicated... I'm planning to replace my old excel for family budget with a brand new AngularJS app. This gave me the opportunity to learn a lot of things about AngularJS, and in particular how AngularJS handles client side form validation (one of the topic generally less appreciated).

In this post I will show how to perform client side data validation with AngularJS. I will use both built-in directives, both custom directives.

## Client and Server side validation

Before we start, just a question for you: how many times have you heard that client side validation is useless without server side validation? A lot, I guess... and that's cause client side validation could be easily bypassed.

However it is still very important when used as an help for the user to complete with success the submission of a form. For data validation and sanitization, we should rely on server side validation.

## AngularJS directives for form validation

AngularJS has many directives to run form validation. The following are only those usable on a classic input field:

```html
<input type="text"
  ng-model="{string}"
  [name="{string}"]
  [required]
  [ng-required="{string}"]
  [ng-minlength="{number}"]
  [ng-maxlength="{number}"]
  [ng-pattern="{string}"]
  [ng-change="{string}"]>
```

Some of these (like `required`, `pattern`, etc.) repeat the behavior of the new HTML5 attributes. The advantage of using AngularJS directives instead of classic HTML5 attributes, is that the AngularJS way allows to mantain the two way data binding between model and view.

## The simplest example


{{% codepen hash=Efzqm %}}

In the above pen I wrote the code of the most simple case of form validation I could imagine. This simple scenario allows us to note some very important things about form validation with AngularJS. 

One of the most important things is the way I declared the form in the HTML code:

```html
<form name="myForm" novalidate ng-submit="submitForm();">
  <!-- ... -->
</form>
```

As you can see, I didn't specify an action property for the form. That's because AngularJS prevents the default action (form submission to the server) unless the form element has an action attribute specified. I used the [ngSubmit](https://docs.angularjs.org/api/ng/directive/ngSubmit 'AngularJS api: ngSubmit') directive to specify a behavior to apply when the form is submitted. Moreover, on the form is used the `novalidate` attribute, in order to disable browser's native form validation.

I used the [ngShow](https://docs.angularjs.org/api/ng/directive/ngShow 'AngularJS api: ngShow') directive that allow to show a portion of the DOM tree conditionally. I also used the [ngDisabled](https://docs.angularjs.org/api/ng/directive/ngDisabled 'AngularJS api: ngDisabled') directive to conditionally disable the submit button. To write the condition I used several property of the form object that AngularJS makes available. These properties are the following:

```js
//[formName].[inputFieldName].property

myForm.email1.$pristine;
// Boolean. True if the user has not yet modified the form.

myForm.email1.$dirty
// Boolean. True if the user has already modified the form.

myForm.email1.$valid
// Boolean.True if the the form passes the validation.

myForm.email1.$invalid
// Boolean. True if the the form doesn't pass the validation.

myForm.email1.$error
// Object. Could be something like this:
// { required: false, pattern:true }
// or { required: false, email:true }
```

The properties are true or false, on the basis of the fact that, the particular validation expressed by that property has failed or not. Setting of these properties is a task of the correspondent directive. So at this point you have already understood that the `required` directive used on the username1 input field will set:

```js
myForm.username1.$error.required === true;
// Only if the username1 field is left blank.
```

... and in the same way the email directive will set:

```js
myForm.email1.$error.email === true
// When email1 field does not contain a real email.
```

## Customize form look with the CSS classes of AngularJS

AngularJS makes available also numerous CSS classes to allow to customize the style of the form. This is good because different styles could be used to better communicate with the users. To better understand what I mean, take a look at the following example.

{{% codepen hash=zHwat %}}

In the previous demo, I used only the most common classes:

```css
.ng-pristine {}
.ng-dirty {}
.ng-invalid {}
.ng-valid {}
```

The meaning of these classes is the same of that of the properties seen in the previous section. For example you could find the `ng-pristine` class only if you don't have already used the input field, vice versa the `ng-dirty` class is present only if you have modified the default value, etc.

Styling a form using these classes is simple as use your custom class. Take a look at the CSS tab of the previous pen:

```css
.ng-pristine { border:1px solid Gold; }
.ng-dirty.ng-valid { border:1px solid Green; }
.ng-dirty.ng-invalid { border:1px solid Red; }
.ng-dirty.ng-valid ~ span.ok { color:green; display:inline; }
.ng-dirty.ng-invalid ~ span.ko { color:red; display:inline; }
```

## The power of the ngPattern directive

The `ngPattern` directive leads all the power of regular expression inside AngularJS. It allows to validate the content of a field on the basis of a custom [Regular Expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions 'Regular Expression MDN's reference').

```html
<input type="text" name="userId" ng-model="userId"
  required ng-pattern="/^id_[0-9]+$/"/>
```

In the above example, a string in order to be valid has to be in the format "id_numbers", otherwise the ngPattern directive will sets to true the pattern validation error key. See the [ngPattern directive in action](http://codepen.io/brunoscopelliti/pen/plFLI 'Form validation through ngPattern directive').

If you will play a lot with the previous demo, maybe you will note that also string like " id_123 ", "id_123 ", or " id_123″ are valid. This is due to the fact that `ngModel` automatically trims the value. To avoid this, the release 1.1.1 (still unstable) adds the new `ngTrim` directive.

## 100% Custom validation through custom directives

If this is not enough, we could even extend this set of directives, writing our custom directives for form validation. I already wrote about [custom directives]({{< relref path="use-cases-of-angularjs-directives" >}} 'Use Cases of AngularJS Directives'); and write custom directives to validate a form is not much different.

For example let's write a directive to validate the username chosen by the user during the registration; username has to be an alphanumerical string of at least 4 chars, and at most 10 chars... this could be already achieved through the ngPattern directive. Moreover the username has to be unique on the database (or in a generic list of data). So our custom `ngUnique` directive will call asynchronously the server to check if the username chosen is already used, or not.

Here you could play with the codepen demo:

{{% codepen hash=plFLI %}}

Let's break this directive:

```html
<input type="text" name="username" ng-model="username"
  ng-pattern="/^[a-zA-Z0-9]{4,10}$/"
  ng-unique="tableDB.userDBField" />
```

The ngUnique accepts as parameter the names of the field and of the table, where the username has to be unique.

```js
.directive("ngUnique", ["$http", function ($http) {
  return {
    require: "ngModel",
    link: function (scope, elem, attrs, ctrl) {
      elem.on("blur", function (evt) {
        scope.$apply(function () {
          $http({
            method: "POST",
            url: "backendServices/checkUsername.php",
            data: {
              username:elem.val(),
              dbField:attrs.ngUnique
            }
          }).success(function (data, status, headers, config) {
            ctrl.$setValidity("unique", data.status);
          });
        });
      }
    }
  }
]);
```

The validation process begins when the username field fires the blur event.

At this point, an AJAX request starts. The objective is to check against the database if the value in the username field already exists. The response is false if the value already exists, otherwise true. The response is available in the callback, where it's used as parameter of the AngularJS `$setValidity` api. [$setValidity](https://docs.angularjs.org/api/ng/type/ngModel.NgModelController 'AngularJS api: $setValidity') changes the validity state, and notifies the form when the control changes validity.

This allow us to use our custom `unique` error key, to improve usability of the form, as seen in the previous examples:

```html
<div class="invalid"
  ng-show="myForm.username.$dirty && myForm.username.$invalid">
  <span ng-show="myForm.username.$error.pattern">
    Pattern validation fails
  </span>
  <span ng-show="myForm.username.$error.unique">
    Username already exists.
  </span>
</div>
```

## A little Extra

I summerized all the demo of this post in this [jsFiddle](http://jsfiddle.net/bruscopelliti/3vRXy/embedded/result/ 'Form Validation').
