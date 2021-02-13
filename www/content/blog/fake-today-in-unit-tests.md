---
title: "Fake today in unit tests"
preview: "In this post I share my approach I share my approach to have a \"fake today\" in unit tests."
date: 2015-03-25T09:00:00+01:00
meta_description: "Unit tests mock date"
categories: ["Tests", "JavaScript"]
layout: "post"
changefreq: "yearly"
lastmod: 2021-01-01T09:00:00+01:00
priority: 0.7
---

If the app which you are working on is strongly influenced by the date, you definitely need a simple and consistent way to create a *fake today*, to have significant unit tests.

I do not want to make you wait... this is the way I mock the `Date` constructor.

```js
function fakeDate (fakeToday) {
  var BuiltinDate = Date;

  spyOn(window, "Date").and.callFake(function () {
    var args = Array.prototype.slice.call(arguments);
    if (args.length === 0) {
      return new BuiltinDate(fakeToday);
    }

    var _factoryFn = Function.prototype.bind.apply(BuiltinDate, [null].concat(args));
    return new _factoryFn();
  });
}
```

## What's happening there?

Let's try to understand that code.

First of all I made a copy of the original `Date` function, and through the *jasmine*'s framework `spyOn` method, I created a spy on it.

```js
var BuiltinDate = Date;
spyOn(window, "Date").and.callFake(function () {
  // This is executed everytime Date is called
});
```

Now there are two cases:

* `Date` was called without any parameter.

  In this case it is supposed to return the date of today; so in this case we have to use the `fakeToday` variable in the closure scope, to create a fake today date. In order to create the date it's not possible to use the `Date` constructor, but we can use its copy, previously saved in the `BuiltinDate` variable.

```js
if (args.length === 0) {
  return new BuiltinDate(fakeToday);
}
```

* `Date` was called with some parameters; it accepts one argument, or a comma-separated list of arguments.

  I used the function's `bind` method on the `BuiltinDate` constructor, called via the `apply` method, that permits to pass the parameters as an array.

```js
var tmp = [null].concat(args);
var _bind = Function.prototype.bind;

var _factoryFn = _bind.apply(BuiltinDate, tmp);
return new _factoryFn();

// ECMAScript 6 will make this even simpler via spread syntax
return new BuiltinDate(...args);
```

## Usage

Let's take a look now at how to use our `fakeDate` function.

```js
function Calendar() {
  this.today = this.selectedDay = new Date();

  on("NextWeekSelected", function () {
    // addDaysToDate add x days to the date passed as first parameter
    this.selectedDay = addDaysToDate(this.today, days);
  }.bind(this));
}
```

Then the unit test for the `addDaysToDate` method looks like:

```js
describe("addDaysToDate", function () {
  it("should be aware that February sometimes has 29 days", function () {
    // Create the fake date
    fakeDate("2016-02-26");

    var instance = new Calendar();
    // now: instance.today is February 26 2016

    trigger("NextWeekSelected");

    // since 29 February exists:
    // selectedDay is 4 March 2016;
    // set the expectations!

    expect(this.selectedDay.getDate()).toBe(4);
    expect(this.selectedDay.getMonth()).toBe(2);
  });
});
```
