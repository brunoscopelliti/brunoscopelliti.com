---
title: "Custom Assertions are my favourite QUnit feature"
aliases:
  - /qunit-custom-assertions
preview: "I think custom assertions are great, because in a concise manner, they make extremely clear what a test is for. You should definetely give them a try."
date: 2017-01-17T09:00:00+01:00
meta_description: "Explore QUnit custom assertion in JavaScript tests"
categories: ["Tests", "JavaScript"]
layout: "post"
changefreq: "yearly"
lastmod: 2021-01-01T09:00:00+01:00
priority: 0.7
---

This post is meant to share my favourite QUnit feature, *custom assertions*.

Compared to other library, QUnit has not a particularly rich assertions' library; however that's not a big deal, cause QUnit makes extremely simple to extend its core assertions collection.

```js
QUnit.assert.typeof = function (subject, expected) {

  // The current value of the expression
  const actual = typeof subject;

  // It's a boolean;
  // It expresses wheter the test has passed, or not.
  const result = actual == expected;

  // That's the message that will be displayed in case the assertion fails
  const message = `Type mismatch. Expecting ${ expected }, got ${ actual }.`

  this.pushResult({
    result,
    actual,
    expected,
    message
  });

};
```

The important bit here is that we're executing [QUnit internal `Assert#pushResult`](http://api.qunitjs.com/pushResult/) method.

The best part is that QUnit is 100% aware of this new assertion.

```js
QUnit.test("An example", function (assert) {
  assert.typeof(() => 42, "function");
  assert.expect(1);
});
```

That is, we receive `typeof` as member of the `assert` parameter, and it still increments QUnit internal assertion count.

Custom assertions are great cause make extremely clear what a test is for, and prevent code duplication. They usually are also more concise that their counterpart. Let's compare:

```js
assert.equal(typeof foo, "function", "foo must be a function");

// vs

assert.typeof(foo, "function");
```