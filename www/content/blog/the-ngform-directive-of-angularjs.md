---
title: "The ngForm directive of AngularJS"
preview: "I use ngForm directive to validate a dinamically generated form."
date: 2013-05-09T09:00:00+01:00
meta_description: "Client side validation dinamically generated form in AngularJS"
categories: "AngularJS"
layout: "post"
changefreq: "yearly"
lastmod: 2021-01-01T09:00:00+01:00
priority: 0.7
---

I'm back writing about client side validation in an AngularJS application.

Lately, I had to work with a form created dynamically on the basis of a JSON response, that I received from the server. In this case the approach is a bit different from the one I discussed in my first post about [form validation with AngularJS]({{< relref path=form-validation-the-angularjs-way.md" >}} 'Form Validation: The AngularJS Way').

Consider this markup:

```html
<form name="sf" ng-controller="FormController" novalidate>
  <div ng-repeat="f in fields">
    <input name="{{ "{{ f.name " }}}}" ng-required="f.isRequired"/>
    <div ng-show="sf[f.name].$dirty && sf[f.name].$invalid">
      <span ng-show="sf[f.name].$error.required">Required field</span>
    </div>
  </div>
</form>
```

Where `fields` is defined in the controller.

```js
function FormController(scope) {
  scope.fields = [
    { name: "username", isRequired: true},
    { name: "password", isRequired: true },
    { name: "email", isRequired: false}
  ];
}
FormController.$inject = ["$scope"];
```

But sadly the validation didn't work.

The reason of this failure, is that currently it's not possible to dynamically generate a name of an input.

To work around this issue there are two different alternatives: write a custom directive or use the builtin [ngForm](https://docs.angularjs.org/api/ng/directive/ngForm 'AngularJS api: ngForm') directive, to create an inner form; I chose this last one:

```html
<form name="sf" ng-controller="FormController" novalidate>
  <div ng-repeat="f in fields">
    <ng-form name="sfIn">
      <input name="tb" ng-required="f.isRequired"/>
      <div ng-show="sfIn.tb.$dirty && sfIn.tb.$invalid">
        <span ng-show="sfIn.tb.$error.required">Required</span>
      </div>
    </ng-form>
  </div>
</form>
```
