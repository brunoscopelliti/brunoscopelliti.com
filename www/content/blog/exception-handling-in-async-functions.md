---
title: "Exception handling in async functions"
aliases:
  - /exception-handling-in-async-functions
preview: "One aspect in which async/await really shine is error handling, but there's a caveat you'd be better be aware of."
date: 2017-11-08T09:00:00+01:00
meta_description: "Dealing with exceptions. Error handling in Async functions."
categories: ["JavaScript", "Promise"]
layout: "post"
changefreq: "yearly"
lastmod: 2021-01-01T09:00:00+01:00
priority: 0.7
---

*Async functions* is one of the most welcomed new feature of JavaScript in recent years.

One aspect in which async functions really shine when compared to traditional approach is error handling. Error handling is based on another beloved, and more ancient construct, `try... catch`.

However `try... catch` is able to catch only exeptions thrown in functions which are explicitly `await`ed. In retrospective, it makes perfectly sense... but I never fully realized it, until I met my first uncaught exception:

```txt
invalid json response body at [omissis] reason: Unexpected token I in JSON at position 0
```

The following is a *repro* of the issue:

```js
function whateverReturnsAPromise () {
  return Promise.reject("Ops.");
}

async function example () {
  try {
    return whateverReturnsAPromise();
  } catch (error) {
    // execution never reaches this block
    console.log("Caught exception");
    console.log(error);
  }
}
```

Let's look at a more common example:

```js
async function getCharacter (characterId) {
  try {
    const response = await fetch(`https://swapi.co/api/people/${characterId}`);
    return response.json();
  } catch (error) {
    console.log("Caught exception:", error.message);
    console.log(error);
  }
}
```

In the above snippet we have an uncought exception if the api does not return a valid JSON response. That's bad. The solution is straightforward.

```js
return await response.json();
```