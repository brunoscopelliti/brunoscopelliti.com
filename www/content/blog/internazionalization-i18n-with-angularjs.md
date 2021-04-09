---
title: "Internazionalization (i18n) with AngularJS"
preview: "I am exploring Internationalization, and Pluralization capabilities of AngularJS."
date: 2013-05-07T09:00:00+01:00
meta_description: "Internationalization and Pluralization in AngularJS web application"
categories: "AngularJS"
layout: "post"
changefreq: "yearly"
lastmod: 2021-01-01T09:00:00+01:00
priority: 0.7
---

These days I am trying the internationalization (and pluralization) capabilities of AngularJS.

I just defined my personal approach to the internationalization of a web app based on AngularJS,
and I would like to share it, to have some feedback about it. My approach is based on
two main points:

* The use of technologies of backend (such as PHP) to detect the most probably
preferred language of the user.

* [AngularJS filters](https://docs.angularjs.org/api/ng/service/$filter "AngularJS api: $filter"),
to format the data that has to be shown to the users.

## Digging into the code

I will discuss my approach in relation to the demo available on the Github
[angularjs-i18n](https://github.com/blog-brunoscopelliti/angularjs-i18n "Github repo: angularjs-i18n")
public repository.

In this post I will highlight the more important aspects of my approach.

Everything starts guessing the user's preferred language.
<br/>
For this task I rely on server side technologies.
<br/>
In the context of the demo that I shared, I used the variable `$_SERVER["HTTP_ACCEPT_LANGUAGE"]`. Then, on the basis of the language that the user would probably prefer, the appropriate locale files are loaded.

```php
$supportedLanguage = array("en", "it");
$lang = substr($_SERVER["HTTP_ACCEPT_LANGUAGE"], 0, 2);

// ...

<?php if (in_array($lang, $supportedLanguage)): ?>
  <script src="l/ng-locale_<?php echo $lang; ?>.js"></script>
  <script src="l/i18n_<?php echo $lang; ?>.js"></script>
<?php else: ?>
  <script src="l/ng-locale_en.js"></script>
  <script src="l/i18n_en.js"></script>
<?php endif; ?>
```

What do contain the two javascript files that I just included?
<br/>
The first file contains the localization rules relative to one specific locale,
that is the default format for money, or date, the name of the months translated etc.
These files could be downloaded from [http://code.angularjs.org/1.0.5/i18n/](http://code.angularjs.org/1.0.5/i18n/ "AngularJS locale"), for others versions just change the piece of url relative 
to the version. Instead, the second file contains all the labels that are to be
translated in the web app.

I chose to put all the labels in a service, so that they could always be available
in every controllers. At the end the service is something like:

```js
angular.module("myApp.localeTranslation", []).
value("currentLocale", {
  WRITTENBY: "Written by",
  ...
  TOTOP: "Top",
  _getLocalizationKeys: function () {
    var keys = {};
    for (var k in this) {
      if (this.hasOwnProperty(k)) {
        keys[k] = k;
      }
    }
    return keys;
  }
});
```

As well as the labels, the object contains just one method, `_getLocalizationKeys`;
it returns an object that has as properties the same properties of the object to which it belongs,
and the value of each property is equal to the name of the property itself.
As I will show later this method will be useful for making sure that my approach will work
with AngularJS `ngPluralize` directive.

We've reached the second milestone on which this approach is based, the use of AngularJS filters.

As first thing I defined a custom filter to format the data that has to be shown to the users.
The following is the filter definition:

```js
var filters = angular.module("myApp.filters", []);
filters.filter("i18n", ["currentLocale", function (cl) {
  return function (key, p) {
    if (typeof cl[key] !== "undefined" && cl[key] !== "") {
      return (typeof p === "undefined") ?
        cl[key] : cl[key].replace("@{}@", p);
    }
  }
}]);
```

As you can see the `i18n` filter uses the label defined in the `currentLocale` service,
imported via dependency injection.
The functioning of the filter at this point is pretty easy: if the filter is applied to a string
corresponding to a property of the currentLocale object, the string itself is replaced with
the value of that property.

The i18n filter could be used as every others AngularJS filter; so in whatever HTML file I want,
I can write something like:

```html
<span class="author">{{ "{{ 'WRITTENBY' | i18n " }}}}  Bruno</span>
```

Moreover as for every others AngularJS filter, I could even pass a parameter (or even more
than one) at the i18n filter; what I've to do is just write the parameter after the filter name,
using a colon as separator.

```html
<span class="author">{{ "{{ 'LOCALIZATIONKEY' | i18n:parameter " }}}}</span>
```

In case, the parameter is used to replace the special string `@{}@` in the localized label
(see line 5 of the snippet in which the i18n filter is defined).

## Conclusion

In conclusion, my approach has two main benefits:

* **Chainable filters:**

  AngularJS filters are chainable; so I could chain my custom filter for internationalization
  with each others AngularJS filters:

```html
<div class='top'>
  <a href='#top'>{{ "{{ 'TOTOP' | i18n | uppercase " }}}}</a>
</div>
```

* **ngPluralize compatibility:**

  Another important strong point of this approach is that the i18n filter could be used
  in combination with the ngPluralize directive.

  In this case there is a need to only care of not use directly the name of the property
  inside the ngPluralize directive, but store the property name in some other variable,
  and use this in its place. For this reason, in the currentLocale service I defined the
  `_getLocalizationKeys` method.

  Ultimately, this is the way the ngPluralize directive should be used in combination
  with the i18n filter (the code is again extracted from the demo):


```html

<!--
  keys is a $scope property defined as:
  $scope.keys = locale._getLocalizationKeys();
-->

<ng-pluralize count="p.likes" when='{
  0: '{{ "{{ keys.NOLIKES | i18n " }}}}',
  one: '{{ "{{ keys.ONELIKE | i18n " }}}}',
  other: '{{ "{{ keys.MANYLIKES | i18n:this.p.likes " }}}}'>
</ng-pluralize>
```

Currently, I can see just one possible downside in this approach; indeed use `$_SERVER`
to detect the user preferred language is probably a not infallible way. This possible issue
could be overcome using more sophisticated ways to detect, from the server side, the user
preferred language; a possible way is to use the GeoIP extension, but neither this solution
is 100% error free (what happen when I accede to the web app from another country?).
However this approach could be easily improved using cookies to store the user's preferences
about languages, and the other locale stuff.
