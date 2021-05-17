---
title: "What's the difference between undefined and void in TypeScript?"
preview: "I didn't know, but I learned it - and you could learn it too ..."
date: 2021-05-17T21:42:46+01:00
meta_description: "TypeScript difference undefined vs void"
categories: "TypeScript"
layout: "post"
changefreq: "yearly"
lastmod: 2021-05-17T21:42:46+01:00
priority: 0.7
---

If I have to describe my relationship with TypeScript in one word, I'll say it is *complicated*.

To put it shortly, I think most of the time it's not worth the additional work, and headaches it causes -
especially considering that in my usual setup I've unit test with high coverage,
and meaningful JSDoc annotations.\
If you disagree - don't worry, it's fine 🙂

Anyway, in recent years TypeScript has grown in popularity, and always more often I find it 
in my way.\
One thing that initially surprised me is that in TypeScript we have two keywords - `undefined` 
and `void` - for concept apparently very similar.

My misunderstanding of `undefined` and `void` in TypeScript was based on the meaning `undefined`
and `void` have in JavaScript.\
In JavaScript `void` is an operator that always produces `undefined` as result.
While, `undefined`, well, is a primitive value.

So, I initially thought that `void` was just an alias for `undefined`, and that the two could
be used interchangeably. Well, I was wrong.

In TypeScript `void` is used to signal a function's return value is not going to be used.
This doesn't necessarily mean it will be `undefined`.\
Why is this important? Consider an example.

```ts
const readFileTitle = (src : string, callback : (title : string) => undefined) {
};
```

The implementation is not important.\
Instead, it's important to note that the callback return's type is `undefined`.

Imagine now we're using this function to retrieve the titles of a series of file:

```js
const files = ["./file1.txt", "./file2.txt"];
const titles = [];
for (const file of files) {
    readTitle(file, (title) => titles.push(title));
}
```

In this case, TypeScript will throw a compilation error:

> Type 'number' is not assignable to type 'undefined'.

The error in this case makes sense.\
In fact we said that the callback should return `undefined`, but instead is returning
`number` - cause this is what `[].push` returns.

You - as I did too initially - may think that to fix this inconvenience is enough
to replace the implicit return in the arrow function definition - but no, it doesn't work.

```js
readTitle(file, (title) => { titles.push(title); });
```

Cause when we say a function returns `undefined`, the only way to make TypeScript happy is
to actually return `undefined`. On the other hand, when we use `void` we don't make any
assumption on the function's return value - we just state that we're not going to use
that value.

```ts
const readFileTitle = (src : string, callback : (title : string) => void) {
};
```