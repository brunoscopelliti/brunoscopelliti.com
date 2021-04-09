---
title: "AngularJS directive to test the strength of a password"
preview: "I'm implementing an AngularJS directive to check real time the strength of a password."
date: 2013-04-24T09:00:00+01:00
meta_description: "AngularJS directive check password strength"
categories: "AngularJS"
layout: "post"
changefreq: "yearly"
lastmod: 2021-01-01T09:00:00+01:00
priority: 0.7
---

Recently I'm working a lot with AngularJS and validation of forms, and maybe
you have noticed this (see: [form validation in AngularJS]({{< relref path=form-validation-the-angularjs-way.md" >}} "Form Validation in AngularJS"), and [validate password in AngularJS]({{< relref path=angularjs-directive-to-check-that-passwords-match.md" >}} "AngularJS directive to check that passwords match")).

The topic of today is not strictly related to form validation, but, like also the form validation,
it could be useful to improve the form usability, and even the user's data security.
Always more frequently during the registration on a new website, I happen to see that
the password that I chose is judged, and I'm informed about its strength value.

In this post I will show how to code an AngularJS directive to measure the strength
of the password typed by the users.

## Live demo

{{% codepen hash=nFlvm %}}

## The code

Before start digging into the code, I need a short premise.

*The goal of this post is to show how you could write an AngularJS directive
to test the strength of a password, not to give the best algorithm to test the
strength of a password; indeed in my opinion the algorithm I implemented is really bad.
You could find a better solution [here](http://www.passwordmeter.com/ "Password Strenght meter").*

As always, let's start from the markup:

```html
<input type="password" ng-model="pw" name="pw" id="pw" />
<ul id="strength" check-strength="pw"></ul>
```

As you can see the directive `checkStrength` expects as parameter the id of the input field
that will contain the password typed by the user.
Inside the directive is positioned the most important part of the code.
I created the `strength` object, to manage the tasks:

* compute of strength of the password
* bind the level of strength to a color

How this code really looks like is not very important to understand the working
of the directive; for this reason I will show here only the backbone of the object.
However you could find the complete example on Codepen.

```js
var strength = {
  colors: ["#F00", "#F90", "#FF0", "#9F0", "#0F0"],
  mesureStrength: function (p) {
    // return the evaluated strength of the password
  },
  getColor: function (s) {
    /*
      return an object with the format:
      obj = { idx: strengthLevel, col: 'color' }
    */
  }
};
```

Finally the directive:

```js
angular.module("myApp.directives", [])
  .directive("checkStrength", function () {
    return {
      replace: false,
      restrict: "EACM",
      link: function (scope, iElement, iAttrs) {

        var strength = {
          .......
        };

        scope.$watch(iAttrs.checkStrength, function () {
          if (scope.pw === "") {
            iElement.css({ "display": "none"  });
          } else {
            var strength = strength.mesureStrength(scope.pw);
            var c = strength.getColor(strength);
            iElement.css({ "display": "inline" });
            iElement.children("li")
              .css({ "background": "#DDD" })
              .slice(0, c.idx)
              .css({ "background": c.col });
          }
        });

      },
      template: ""
    };
  });
```

In this case there are two important things to notice:

* In the directive definition object is defined the `template` property. This allows
to add additional elements to the DOM. In this specific case, five more list items are added.

* In the `link` function is used the api method [$watch](https://docs.angularjs.org/api/ng/type/$rootScope.Scope#$watch "AngularJS api: $watch") to register callback to be executed whenever
the password changes.
