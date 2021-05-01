---
title: "How to disable ESLint rule via JavaScript comment"
aliases:
  - /how-to-disable-eslint-rule-via-javascript-comment
preview: "I hope writing it down helps me remember how to disable an ESLint rule via comment."
date: 2016-09-16T09:00:00+01:00
meta_description: "Disable ESLint rule via JavaScript comment"
categories: ["Tools", "ESLint", "memo"]
layout: "post"
changefreq: "yearly"
lastmod: 2021-04-26T21:10:00+01:00
priority: 0.7
---

Having recently switched to [ESLint](http://eslint.org/), I often find myself googling
for how to disable a rule on a particular occurrence via JavaScript comment.

Hope writing this will help me to memorize the syntax, I'll bookmark this page otherwise 😅.

```js
// eslint-disable-next-line no-alert
alert("foo");

alert("foo"); // eslint-disable-line no-alert
```

It's also possible to omit the name of the rule, and in this case lint is turned off for
the entire line.
