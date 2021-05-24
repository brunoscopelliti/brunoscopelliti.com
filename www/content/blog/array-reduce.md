---
title: "About array's reduce"
preview: "Let's use this week tech drama to discuss readability of code."
date: 2021-05-24T20:45:15+01:00
meta_description: "Array's reduce"
categories: ["Opinions", "JavaScript"]
layout: "post"
changefreq: "yearly"
lastmod: 2021-05-24T20:45:15+01:00
priority: 0.7
---

This week tech drama is courtesy of [@maxfmckay](https://twitter.com/maxfmckay).

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Simplify your .reduce calls by doing as much work as possible in .filter and .map instead. Compare these two snippets. Which is more readable? Notice that when map arranges data exactly how we want, our .reduce can be just Object.assign.<a href="https://twitter.com/hashtag/typescript?src=hash&amp;ref_src=twsrc%5Etfw">#typescript</a> <a href="https://twitter.com/hashtag/javascript?src=hash&amp;ref_src=twsrc%5Etfw">#javascript</a> <a href="https://t.co/3TW57kaCar">pic.twitter.com/3TW57kaCar</a></p>&mdash; Rupert Foggo McKay (@maxfmckay) <a href="https://twitter.com/maxfmckay/status/1396252890721918979?ref_src=twsrc%5Etfw">May 22, 2021</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

Let's for a moment forget the original snippet, and its flaws pointed out in the
thread on Twitter, and focus on the topic.

`[].reduce` has a long story of being criticized.\
In most cases the arguments fall in one, or both of these two categories:

* `[].reduce` makes code no - or *less* - readable.

* `[].reduce` is used by people to show off how smart they are.

I disagree with both these arguments.\
First one criticize the api - I respect this stance.\
The second one attacks people using reduce; it adds nothing to the discussion.
It's particularly sad I've seen this used also by people I respect, and admire for their work.

## Reduce is not perfect

Well, `[].reduce` is not perfect.

For example, I was surprised when first learned it throws an exception, when called on an empty
array, and no initial value is provided.

```js
[].reduce(() => {}); 
// Uncaught TypeError: Reduce of empty array with no initial value
```

Others api have other shenanigans - then you learn it, and they become just tools
in your belt, you can use when it makes sense.

## Readability of the code

I believe code readability is an intrinsic feature of the code when you look at the big picture.
There are techniques, and patterns to adopt that makes easier to a person to make sense of a
program, or a whole codebase; for example split functionalities in short functions, each with meaningful
name goes a long way.

But the more you restrict the area you look at, the more code readability becomes subjective,
arguably meaningless, like any other stylistic preference.\
First of all it depends by the ability of a person to read the code.\
I trust everyone who is criticizing `[].reduce` in this regard, know the api well;
but even assuming the same level of understanding of the api, readability remains subjective,
and depends, between the other things, by how much you've been exposed to a pattern.
Eg. if you're deliberately not using `[].reduce` - even when it would make sense to - you
can't expect to read it with same ease as someone who does.

For these reasons I prefer to talk in terms of intrinsic ability of an api to communicate
well developer's intention.

## What I usually do

I usually prefer array's built-in methods over loops, cause most of the time, they better 
communicate developer's intention.

For example, when I meet `[].filter` in the code, I know a new array containing only a subset
of the initial array's element is being created (even before looking at the function
implementation).

```js
const odds = numbers.filter(
  (number) => {
    return number % 2 > 0;
  }
)
```

When I see `[].map`, I know all the elements in the initial array are going to be transformed
into something else, and a new array is being returned.

```js
const squares = numbers.map(
  (number) => {
    return number ** 2;
  }
)
```

... and there're many more, `[].find`, `[].every`, `[].some`, etc.

These methods are generally slower than loops, but most people agree that the performance loss
is negligible compared to the clarity they bring.

Now, `[].reduce` is much more powerful of all these methods - in fact it can be used to implement
all of the previous methods, but the contrary is not true.\
The cost of this power is that it carries less intrinsic meaning respect the others.\
In fact with `[].reduce` you can't say anything about the result, without also looking at the
function implementation - and if you're having hard time there it is most likely cause
that specific function is a mess.

I agree that using `[].filter`, and `[].map`, as our friend suggests, brings more clarity here;
but it is so just because we're splitting a big function into smaller pieces - and this
always helps!

```js
const squaresOfOdds = numbers
  .filter(isOdd)
  .map(square);
```

In fact, we can use same approach to improve the `[].reduce`-based implementation
of the same functionality.

```js
const squaresOfOdds = numbers.reduce(
  (result, number) => {
    if (isOdd(number)) {
      result.push(
        square(number)
      );
    }

    return result;
  },
  []
)
```

In this particular case `[].filter`, then `[].map` looks acceptable alternative
to me - but it doesn't cover all the possible use cases `[].reduce` does.\
In particular, it looks pointless to me to move logic out of the reduce function, when
you still need to use `[].reduce` at the end of the chain.
