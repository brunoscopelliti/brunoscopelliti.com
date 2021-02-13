---
title: "A simple Babel optimization I recently learned"
aliases:
  - /a-simple-babel-optimization-i-recently-learned/
preview: "I've started to use Babel when it was still called 6to5, but just recently I learned that it permits to optimize its generated output."
date: 2018-05-08T09:00:00+01:00
meta_description: "Optimize Babel's output payload with babel-runtime plugin."
categories: ["Tools", "Babel"]
layout: "post"
changefreq: "yearly"
lastmod: 2021-01-01T09:00:00+01:00
priority: 0.7
---

Babel relies on a few internal functions to generate the transpiled code.

These functions, when needed, are placed at the top of the generated code, so they are not inlined multiple times across a single file.

For example, a class declaration `class Foo {}` gets transpiled as:

```js
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Foo = function Foo () {
  _classCallCheck(this, Foo);
};
```

Since Babel performs transpilation on single file basis, there's still the risk that these functions get duplicated across different files.
Of course this is not an optimal solution.

Recently I've learned that it's possible to instruct Babel to do not place any declaration at the top of a file, and instead point them to a reference declared in a single shared module.

In this post we'll learn how to achieve this goal, and what are the caveats.
I've published a [working example](https://github.com/blog-brunoscopelliti/optimized-babel-setup) on GitHub.

## Babel's runtime to the rescue

The easiest solution comes under the name of the [@babel/plugin-transform-runtime plugin](https://www.npmjs.com/package/@babel/plugin-transform-runtime).

We have to install the plugin, and [@babel/runtime](https://www.npmjs.com/package/@babel/runtime) standalone module.
Then configure Babel to use it.

```json
{
  "presets": [
    "@babel/preset-es2015"
  ],
  "plugins": [
    "@babel/transform-runtime"
  ]
}
```

With this configuration in place, Babel's output becomes:

```js
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

module.exports = function Foo () {
  (0, _classCallCheck2.default)(this, Foo);
};
```

Babel's helpers implementation is not duplicated; each module only `require`s what
it needs.

In the next session we'll go even further.
Let's forget about `@babel/runtime`, and its companion plugin; we're going to remove also those initial `require`s.

## Generate Babel's helpers

First thing we've to do is to generate the helpers functions for our personal use.

To build the helpers, we'll need [@babel/cli](https://www.npmjs.com/package/@babel/cli).
When we install it, it adds `babel-external-helpers` into `node_modules/.bin`.

The executable comes with a couple of useful options, which permit to customize the module format of the generated output, or filter out the list of the generated helpers.

Below the formal cli reference, and a few examples you might would like to try yourself.

* -t, --output-type [type]
  Set output format: global (default choice), umd or var

* -l, --whitelist
  Whitelist of helpers to ONLY include

```bash
babel-external-helpers -t umd > ./helpers.js

babel-external-helpers -t umd -l createClass,classCallCheck > ./helpers.js
```

## Use the helpers

Once we've the helpers into our working directory, we have to tell Babel to do not include those helpers in the transpiled code.

This is done using the [@babel/plugin-external-helpers plugin](https://www.npmjs.com/package/@babel/plugin-external-helpers).
You may have to install it, and reference it in the .babelrc file.

```json
{
  "presets": [
    "@babel/preset-es2015"
  ],
  "plugins": [
    "@babel/external-helpers"
  ]
}
```

With this configuration, the generated output of the initial example becomes:

```js
"use strict";

var Foo = function Foo () {
  babelHelpers.classCallCheck(this, Foo);
};
```

In which `babelHelpers` is a global reference to Babel's internal helpers.

Sadly, the [proposal to have a configurable namespace](https://github.com/babel/babel/issues/5217) didn't gain traction so far.

Anyway, when we run `new Foo` we get a `ReferenceError`, because `babelHelpers` isn't defined.

If we target only browsers, the solution is straightforward; we've to include the helpers before application code.

```html
<script type="text/javascript" src="path/to/babel-helpers.js"></script>
<script type="text/javascript" src="app.js"></script>
```

In node we could follow a similar strategy, introducing a middleware that pollutes
the global scope with the `babelHelpers`, and then launch the main application.

Alternatively, in case you already rely on WebPack, you can use [webpack-provide-plugin](https://webpack.js.org/plugins/provide-plugin/) to inject the helpers where needed.

```js
module.exports = {
  ...
  plugins: [
    new webpack.ProvidePlugin({
      babelHelpers: [path.resolve(__dirname, "dist", "helpers.js")],
    }),
  ],
```
