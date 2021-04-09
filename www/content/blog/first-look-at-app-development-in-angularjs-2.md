---
title: "First look at app development in AngularJS 2"
preview: "A couple of weeks ago David East gave a short introduction about application development in AngularJS; this is the video of the talk, and my notes from his talk."
date: 2015-02-26T09:00:00+01:00
meta_description: "AngularJS 2 features preview"
categories: "AngularJS"
layout: "post"
changefreq: "yearly"
lastmod: 2021-01-01T09:00:00+01:00
priority: 0.7
---

{{% youtube id="uD6Okha_Yj0" %}}

A couple of weeks ago David East
([@_davideast](https://twitter.com/_davideast "David East's Twitter profile"))
gave a talk about app development with AngularJS 2.

The presentation was followed by a really interesting QAs session, with the participation
of Miško Hevery, and Igor Minar.

This is what seemed most interesting to me:

* AngularJS 2 is built on top of web standards; so no more AngularJS module,
but ECMAScript 2015 module, web components and so on...

* There won't be anymore the configuration phase

* New routing system, with the possibility to lazyload dependencies (probably since AngularJS 1.4)

* Directives will undergo a real boost:

  + possibility to bind to native DOM element's properties; for example `ng-show`,
  `ng-hide` are replaced by binding directly to html element's `hidden` property.

  + web components (with fallback)

  + shadow DOM will replace transclusion
