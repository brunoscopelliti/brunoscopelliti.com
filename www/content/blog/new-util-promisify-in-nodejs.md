---
title: "New util.promisify in Node.js"
aliases:
  - /new-util-promisify-in-nodejs
preview: "This probably isn't a ground breaking news, but surely relevant if you work with Node.js."
date: 2017-05-16T09:00:00+01:00
meta_description: "How to use util.promisify in Node.js"
categories: ["node.js", "Promise"]
layout: "post"
changefreq: "yearly"
lastmod: 2021-01-01T09:00:00+01:00
priority: 0.7
---

A quick search on [npmjs](https://www.npmjs.com/search?q=promisify) reveals how
this topic is at the center of JavaScript developer's hearts. I used to have too
my personal utility to convert Node.js callback-based internals methods into returning-promise ones.

So I guess this is a big, great news for everyone who's working with node: Node.js
is adding a new utility that does just this at its core, `util.promisify`.

If you have ever used one of those *promisify* modules, you won't be too much surprised
by `util.promisify`; they work almost in the same way.

`util.promisify` takes a function following the Node.js callback style, i.e. taking
an error-first `(err, value) => ...` callback as last argument, and returns a version
that returns promises.
<br/>
But you know, *a code snippet is worth a thousand words*.

Let's say I want to read the content of a file.
[fs.readFile](https://nodejs.org/dist/latest-v7.x/docs/api/fs.html#fs_fs_readfile_file_options_callback)
is the tool for this job, but its implementation currently only works with callbacks:

```js
const fs = require("fs");

fs.readFile("./notes.txt", (err, txt) => {
  if (err) {
    throw new Error(err.message);
  }
  console.log(txt);
});
```

If I wanted a Promise-based `fs.readFile`, I had two choices; pick one of those modules
from npm, or manually code my promise aware `fs.readFile`. Here, I'm going for the second option,
just for the sake of showing what's going on under the nice abstraction of a *promisifier function*.

```js
const fs = require("fs");

exports = module.exports = 
  (file, options) => 
    new Promise((res, rej) => {
      fs.readFile(file, options, (err, txt) => {
        if (err) {
          return rej(err.message);
        }
        res(txt);
      });
    });
```

That's pretty straightforward, but it does not scale very well... I won't use a such approach
if I need more functions working with promises.

We can think to extract the capacity of promisifying a given function into a proper utility;
and that's exactly what the authors of those packages did... and what now we have in the core,
exposed as `util.promisify`.

```js
const fs = require("fs");
const util = require("util");

const readFile = util.promisify(fs.readFile);

readFile("./notes.txt")
  .then(txt => console.log(txt));
```

`util.promisify` could eventually work even with methods which do not take an
error-first `(err, value) => ...` callback as last argument. Let's consider
as example `fs.exists` (that it is now deprecated).

```js
fs.exists("/etc/passwd", (exists) => {
  console.log(exists ? "it\'s there" : "no passwd!");
});
```

Using the `util.promisify.custom` symbol it is possible to override the return
value of `util.promisify`.

```js
const fs = require("fs");

const exists = (file) =>
  new Promise((res, rej) => {
    fs.access(file, (err) => {
      if (err) {
        if (err.code === "ENOENT") {
          return res(false);
        }

        return rej(err);
      }

      res(true);
    });
  });

fs.exists[util.promisify.custom] = exists;

util.promisify(fs.exists) === exists; // true
```

Having the possibility to use native Promise these days is particularly exciting,
cause the support for `async/await` is starting to spread.

```js
(async () => {
  const fs = require("fs");
  const util = require("util");

  const readFile = util.promisify(fs.readFile);

  const txt = await readFile("./notes.txt");
  console.log(txt);
})();
```

`util.promisify` is planned to be released for the first time as part of first
Release Candidate for Node.js 8.0.0; [here](https://github.com/nodejs/node/pull/12442)
you can watch the pull request progress, that is now merged.
