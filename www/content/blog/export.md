---
title: "Default vs Named exports"
preview: "TL:DR it doesn't matter, as long as the file is not a giant mess."
date: 2021-06-14T21:08:24+01:00
meta_description: "JavaScript modules: default export, named export"
categories: ["Opinions", "JavaScript"]
layout: "post"
changefreq: "yearly"
lastmod: 2021-06-14T21:08:24+01:00
priority: 0.7
---

I'm always been on *default export* team.\
I cannot find the link now - but I remember this being what TC39 recommended at some point.

I kept using almost exclusively default export even after
[Nicholas Zakas](https://twitter.com/slicknet) - a person in the tech space I really admire,
and respect - wrote his [motivation for not using default export](https://humanwhocodes.com/blog/2019/01/stop-using-default-exports-javascript-module/) anymore.

Lately I've been working more with *named exports* (not my choice, btw) and came to realize
that to me it's really not important the export format - both have their own specific
pros - as long as the file is not a mess.\
The only problem I have with named exports is that this syntax *seems to encourage* developer
creating a mess. Consider the module below as an example:

```js
const something = "";
const somethingElse = "";

export const function a () {}

export const function b () {}

export const function c () {}

export const function d () {}
```

Who really is using `something`? Does `a` depends on `b`, or `c` - or viceversa, maybe?
Hard to say without looking carefully at the code.

I find easier maintain modules that exports a single value (exceptions might occur 
when it makes sense) no matter the specific syntax is used to export this file.
So, I would write the previous snippet as:

```js
// a.js

export const function a () {}
```

```js
// b.js

import { a } from "./a";

const something = "";

export const function b () {}
```

This makes way simpler to understand each function, and its dependencies at a quick glance - and
it's independent from the export syntax we adopt.

One common complaint I receive at this point is that related things should stay together.
For example, you might want to have a `utils/array.js` file that contains all the utilities
functions to work with array.\
I agree with the principle, and suggest to keep all these utilities under the same folder,
eg. `utils/array/[map,filter].js`.
