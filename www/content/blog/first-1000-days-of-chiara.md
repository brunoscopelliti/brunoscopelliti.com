---
title: "The Chiara's first thousand days task"
aliases:
  - /first-1000-days-of-chiara
preview: "TDD, and Functional Programming applied to accomplish a real world feature request."
date: 2016-09-28T09:00:00+01:00
meta_description: "TDD, and Functional Programming applied in JavaScript programming"
categories: ["JavaScript", "Personal"]
layout: "post"
changefreq: "yearly"
lastmod: 2021-01-01T09:00:00+01:00
priority: 0.7
---

I usually wake up early in the morning, before anyone else at my house.
<br/>
I use this time to maintain this blog, run some side projects, stay updated about latest hot trends
in our industry. In general I like to have some time to spend just with myself;
then in the evening, when I come from work, I'm even more happy to stay with my family,
and every device is off by default.

One of these mornings, I found something of unusual on my desk: my wife had left a reminder for me,
asking to calculate when our daughter Chiara would have crossed her first 1000 days of life.

I'm not that good when it's necessary to repair something at home, but this was
definitely something I could handle. Moreover, I like this kind of statistics.
So I put my programs aside for a moment, and decided to pursued the task.
I hadn't really choice anyway 😅.

## A user story

If you work following agile methodologies you sure are pretty familiar with what a user story is,
or maybe you, and your team call them feature requests... it doesn't really matter
too much the name. 
Generally a user story contains the description of small functionality, that
with other small functionalities, compose a bigger feature. 
It should define acceptance criteria, and test cases, so that also the developer
is able to pre-validate their work before the QAs deep dive.

However in this case, no surprise, all I had was a post-it, with a pretty straightforward request.

## Technical solution

In a real work situation, once a feature request is ready to be developed, we start thinking,
to find the best way to implement it. Usually this is not responsibility of
the single developer (that's why I used "we"), but most often more people contributes
with their experience in tracing the path to follow.

This is a critical moment; taking the right choice at this point helps to complete
even the tougher stories without too much hassle (and vice versa).

One of the major difficulties at this point is that of distinguish *the problem* we want to solve,
from the myriads of imaginary problems we sometimes create for ourself.
<br/>
Taking words from Nicholas Zakas:

> Imaginary problems are often described using phrases like, "what if one day someone wants to..." 
and tend to trigger software engineers' creative brain to try to plan for all possibilities. 
[...] You should only ever build solutions for clearly-defined problems because 
that's the only way you'll know if your solution works.
>
> Nicholas C. Zakas, ([source](https://www.nczonline.net/newsletter/archive/f0e1d724dd/))

After not too much thinking, I found that in order to have an answer for my wife,
I should only add a few days to an arbitrary date 😮, and that making those values
parametric could be somewhat beneficial both in terms of code readability, both in terms of
reusability (what if one day we have another child?!).

So this is the function we're going to write:

```js
/*
 * @function
 * @name computeDate
 * @description Compute the date that is `offsetDays` days before/after `startingDate`
 *
 * @param {Date} startingDate:
 *  The date from which start to count the passing days
 *
 * @param {Number} offsetDays:
 *  The number of days in the future
 *
 * @return {Date}
 */
function computeDate(startingDate, offsetDays) { }
```

## Start development

Even if we've not still implemented `computeDate`, we could well imagine that,
it for the same set of input parameters returns always the same result (so it doesn't rely
on any external state). Moreover it would be surprisingly if it does something else
than computing a new date from the input parameter, so we could assume our implementation won't have
any side effects.

Usually these two properties of a function characterized the so called *pure function*.
It turns out pure functions are great to deal with, essentially because they usually are pretty easy
to understand, and to test.

I am not a huge fan of Test Driven Development, however it applies very well on testing of
pure functions; so in this case we're going to start the development of the feature by writing
some tests.

### Unit tests

Ok, let's write some tests... I don't want to celebrate my daughter first 1000 days on the wrong
day after all.

So first thing to decide is what library should I use for unit testing. JavaScript
has the biggest module ecosystem in the world; so it's not a surprise that also
when it comes to testing there are lots of great packages from which pick one.

For this specific case two possibilities comes immediately to my mind:
expect](https://github.com/mjackson/expect) and [tape](https://github.com/substack/tape).

`expect` is essential, but still it has everything you may need, and fits really natural
into pure functions unit testing; it is ideal when all you want to do is verify the output
of a given function; `tape` is as well lightweight, and has a bigger ecosystem,
that permits to extends its core functionalities.

Both would be a great fit, but this time, I'll go for `tape` in order to take advantage
of its ecosystem.

```js
const tape = require("tape");
const computeDate = require("./path/to/computeDate");

const christmas = new Date("2016-12-25");

tape("check a week after Christmas", function(t) {
  const expectedResult = new Date("2017-01-01");
  const result = computeDate(christmas, 7);
  t.deepEqual(result, expectedResult);
  t.end();
});
```

Once you've written the first test, adding further tests is even easier...
it's just particularly important to be as clear as possible when writing the description.

```js
tape("check one year, and a week after Christmas", function(t) {
  const expectedResult = new Date("2018-01-01");
  const result = computeDate(christmas, 365+7);
  t.deepEqual(result, expectedResult);
  t.end();
});

tape("check one year, and a week after Christmas (leap year)", function(t) {
  const preLeapYearChristmas = new Date("2015-12-25");
  const expectedResult = new Date("2016-12-31");
  const result = computeDate(preLeapYearChristmas, 365+7);
  t.deepEqual(result, expectedResult);
  t.end();
});
```

Having defined the `christmas` constant outside the test body gives me a way
to implicitly test that `computeDate` does not change its input parameters.
However this is far from be a best practice! Unit test should be as explicit as they could be...
if it's so important for me that `computeDate` doesn't modify the date it gets as input,
I'd better write a specific test for this case.

```js
tape("does not modify input date", function(t){
  const christmas = new Date("2016-12-25");
  computeDate(startingDate, 1);
  t.equal(christmas.getDate(), 25);
  t.end();
});
```

... and then refactoring the previous tests, so that they do not share access
to the `christmas` constant.

The good old motto DRY, *don't repeat yourself*, does not apply to unit test.
Keeping the state of each unit test isolate from the others is definitely a good thing.
Code duplication is bad, unit tests which may interfere each other are worse.
<br/>
Moreover code duplication could be addressed following a different strategy.
For example, [tape-case](https://github.com/brunoscopelliti/tape-case) permits to test
the output of a pure function, against different input values, reducing the amount
of boilerplate code.

```js
const tapecase = require('tape-case');
const computeDate = require('./path/to/computeDate');

const cases = [
  { description: "Test cases for computeDate",
    args: [new Date("2016-12-25"), 7], expectedResult: new Date("2017-01-01") },
  { args: [new Date("2016-12-25"), 365+7], expectedResult: new Date("2018-01-01") },
  { args: [new Date("2015-12-25"), 365+7], expectedResult: new Date("2016-12-31") }
];

tapecase(cases, computeDate);
```

Now adding a new unit test costs just the adding of a new line on the `cases` array.

### Implementing the solution

Now that I've a bunch of unit tests, I've just to make all of them turn green.
I won't you let wait more, in this case the following implementation of `computeDate` just works.

```js
function computeDate (startingDate, offsetDays) {
  const date = new Date(startingDate);
  date.setDate(date.getDate() + offsetDays);
  return date;
}
```

However its usage is not really ergonomic; I mean, currently we have only one daughter, Chiara,
but every time I want to know *"what date will be after N days since her birthday?"*,
I still have to provide her birthday as parameter. It would be much more useful
if we could have something like `computeDateSinceChiaraBirthDay`. 
<br/>
*Partial Application* to the rescue!

Partial Application is a technique of which functional folks are particularly proud
(and for good reasons). You may have heard of *Currying* before; they're someway similar,
but definitely different things. If you search over the Internet you'll find that
lots of people have lots of different ideas about the difference between them;
for me the following definition will apply:

> Currying is the decomposition of a polyadic function into a chain of nested unary functions.
Thus decomposed, you can partially apply one or more arguments, although the curry operation
itself does not apply any arguments to the function.
>
> Partial application is the conversion of a polyadic function into a function taking
fewer arguments arguments by providing one or more arguments in advance.
>
> Reginald Braithwaite, [source](http://raganwald.com/2013/03/07/currying-and-partial-application.html)

So how exactly Partial Application is supposed to make my day?

All the functional programming libraries out there provide a way turn a normal function
into one that could accept its input parameter lazily, however here to produce
our `computeDateSinceChiaraBirthDay` function, I will be use the humble [Function#bind](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind) method.

```js
const chiaraBirthday = new Date("2014-02-20");
const computeDateSinceChiaraBirthDay = computeDate.bind(null, chiaraBirthday);
```

Just a final check to the tests in order to assure we've not destroyed our beautiful work of before:

```js
const tapecase = require("tape-case");
const computeDate = require("./path/to/computeDate");

const cases = [
  { description: "Test cases for computeDate",
    args: [7], expectedResult: new Date("2014-02-27") },
  { args: [365+7], expectedResult: new Date("2015-02-27") },
  { args: [3*365+7], expectedResult: new Date("2015-02-26") }
];

tapecase(cases, computeDateSinceChiaraBirthDay);
```

With a small refactoring they're still working. So it's time to get the answer for my wife:

```js
computeDateSinceChiaraBirthDay(1000);
```

and we're lucky, we're still on time for celebrations 😄.
