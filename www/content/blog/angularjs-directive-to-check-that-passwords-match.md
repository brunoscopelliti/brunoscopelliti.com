---
title: "AngularJS directive to check that passwords match"
preview: "I'm implementing an AngularJS directive to validate that two passwords match."
date: 2013-04-16T09:00:00+01:00
meta_description: "AngularJS directive validate form password match"
categories: "AngularJS"
layout: "post"
changefreq: "yearly"
lastmod: 2021-01-01T09:00:00+01:00
priority: 0.7
---

I already wrote about [form validation]({{< relref path=form-validation-the-angularjs-way.md" >}} 'Form Validation in AngularJS') some time ago.

In that occasion I had the opportunity to show you how much powerful is the native form validation system of AngularJS. But no matter how powerful, of course, it can not cover all possible scenarios. For example we all are used to fill two times the password fields during the registration on a new website.

Currently AngularJS has not a native method to check, during the form validation, if the user entered two different passwords.

If you've read the previous article, you also know that validation system of AngularJS could even be extended with custom directives.

In this post I will show the AngularJS directive that I realized to check if the passwords typed by the user have the same value.

## Live demo

The next demo will show you what I want to achieve:

{{% codepen hash=CctvH %}}

## The code

The first thing to note is in the markup the use of the `pwCheck` directive:

```html
<input type="password" id="pw1" name="pw1" ng-model="pw1" ng-required />
<input type="password" id="pw2" name="pw2" ng-model="pw2" ng-required pw-check="pw1" />
```

It expects to have as parameter the id of another input of type password, with which compare the value of the field to which is applied. The comparison is specified inside the code of the directive:

```js
angular.module("myApp.directives", [])
  .directive("pwCheck", [function () {
    return {
      require: "ngModel",
      link: function (scope, elem, attrs, ctrl) {
        var firstPassword = "#" + attrs.pwCheck;
        elem.add(firstPassword).on("keyup", function () {
          scope.$apply(function () {
            ctrl.$setValidity("pwmatch", elem.val() === $(firstPassword).val());
          });
        });
      }
    }
  }]);
```

On the basis of the result of the comparison, the api method [$setValidity()](https://docs.angularjs.org/api/ng/type/ngModel.NgModelController#$setValidity 'AngularJS api: $setValidity') is used to set the validation form status as passed or failed.

This step allows to use the new custom error key `pwmatch` to show/hide a custom error message:

```html
<div class="msg-block" ng-show="myForm.$error">
  <span class="msg-error" ng-show="myForm.pw2.$error.pwmatch">
    Passwords don't match.
  </span>
</div>
```
