---
title: "Investigating a Promise bug"
preview: "... more than with Promise, it has to do with core-js Promise polyfill, MutationObserver and IE11. No more spoilers."
date: 2021-03-27T08:39:10+01:00
meta_description: "Investigating a Promise bug"
categories: ["JavaScript", "Bugs", "Promise"]
changefreq: "yearly"
lastmod: 2021-03-27T08:39:10+01:00
priority: 0.7
layout: post
---

As most people do nowadays, I write code using modern JavaScript... then serve the
transpiled version, also adding the polyfills where needed. It mostly works fine,
except when it doesn't 🙃.
<br/>
In fact, recently we got this bug report:

> *When the user clicks the menu button, the menu doesn't appear.*

The problem was easily reproducible on IE11 - and only on IE11.

## First guesses

One interesting thing about this menu is that its content is fetched asyncronously 
only after the user clicks on a particular button.

So, my first guess was there had to be something wrong with this request;
except the Network panel showed the request was completed perfectly fine, and still
the menu was not rendered.

Then I looked at the Console panel, cause I imagined there had to be an error happening
somewhere before the menu could be rendered. But again, no luck: the console was
almost perfectly clean, except for one exception happening in a completely unrelated
third party script.
<br/>
This particular error was happening also on different browsers, and didn't seem to affect
the functionality of the third party script. I thought I could safely ignore it for now.

It didn't require much time to understand that the menu was not the only component
that had problems; in fact, at this point almost nothing was working properly - and
in the end all the problems could be reconducted to the fact that also a simple snippet
like the one below failed the general expectations.

```js
Promise.resolve()
  .then(
    function () {
      // Never runs; weird, isn't it?!
      console.log("Promise fulfilled");
    }
  )
```

Well, that's quite surprising, isn't it?!

At this point I was hooked - I really enjoy investigating this kind of issues.
<br/>
Also - since IE11 doesn't support `Promise` natively, ... and I learned two, or three things
about `Promise`'s polyfills when I wrote [my own Promise polyfill]({{< relref path=lets-write-a-promise-polyfill.md" >}} "Let's write a Promise polyfill")
a couple of years ago - I felt confident I could understand the problem, and eventually fix the bug.

## Debugging core-js Promise polyfill

At this point I thought the only way to figure out why the `Promise`'s handlers
had not been executed was to dive deep into the polyfill implementation.
<br/>
Using IE11 devtools is frustrating to say the least - and doing it through the great 
BrowserStack doesn't really help... so I forced Chrome to use the Promise
polyfill implementation.

```js
// Add this just before you load the polyfill.
window.Promise = void 0;
```

I've used this approach a couple of time in the past, with great satisfaction.
<br/>
My hope was this trick could permit to reproduce the issue also in Chrome. Sadly,
this was not the case.

Even if this attempt didn't work they way I hoped, it permitted to learn another thing
about the problem I was investigating: counterintuitively, even if the problem manifests itself
as a `Promise` issue, it doesn't depends by the `Promise` implementation.
<br/>
I got further confirmation of this thesis by replacing the polyfill with a different one ...
The problem was still there.

This sure is interesting, but doesn't help much moving the investigation forward;
rather makes pointless the effort of debugging a specific implementation.

So, at this point I was a bit lost.
<br/>
I had already spent a couple of hours into investigating the issue, but didn't advance much
into the understanding of the problem.
<br/>
That was when I thought back at the error caused by the third party script, I noticed
at the very beginning. It was a pretty weak lead to follow, but I didn't have many other ideas 
back then; so it was worth at least taking a closer look.

## Reproducing the IE11 bug

This is how I discovered the error was happening in the handler passed to a `MutationObserver`
registered by this third party script.

This isn't *something bad* per se; but this little detail immediately ringed a bell.
<br/>
Most `Promise` polyfills use `MutationObserver` under the hood to emulate
the scheduling of a microtask.

Could this be a simple coincidence?

Well, there was a quick way to find out.
<br/>
This third party script is not fundamental for the page - I removed it, and at this point
everything was working perfectly fine.

At this point my job was pretty much done ... contact the third party, file a bug,
provide a *repro* ... the usual stuff at the end; except I still wanted to understand
how it was possible for this third party script to break so badly our website.

At this point I already knew few things. The problem - for mysterious reasons - is related to 
`Promise` polyfill and `MutationObserver`.
<br/>
So, I came out with a new strategy: in the `Promise` polyfill, replace the microtask
implementation based on `MutationObserver`, with another one that doesn't rely on `MutationObserver`.
It looks like a lot of work, but in the end is very simple:

```js
// node_modules/core-js/internals/microtask.js

module.exports = function (fn) {
  setTimeout(fn, 0);
}
```

Now the implementation above is not the best one, but it's *Good Enough* &trade;, in fact
is usually the last fallback in environments which do not provide any other means to
schedule microtasks.

With this change in place, the menu - and everything else - was working again, despite the error
in the third party script.

Well, I couldn't ship this *fix* of course; but this time I learned something very important,
that in the end permitted me to understand the root of the issue: the problem is to be 
searched in the `MutationObserver`.
<br/>
That's how I came out to understand that Internet Explorer 11 has a bug, that when an
unhandled exception occurs in a `MutationObserver` handler, it ignores all the other handlers 
that should have been eventually executed during that same microtask.
<br/>
Lovely. Here's the simple repro:

```js
var obs1 = new MutationObserver(
  function handler1 () {
    console.log("handler1 running");
  }
);

var obs2 = new MutationObserver(
  function handler2 () {
    console.log("handler2 running");
  }
);

obs1.observe(document.body, { childList: true });

obs2.observe(document.body, { childList: true });

function notify () {
  document.body.appendChild(document.createElement("div"));
}
```

When `notify` is executed, we expect to read two messages in console.

Let's say now, `handler1` for some reasons throw an exception:

```js
var obs1 = new MutationObserver(
  function handler1 () {
    throw new Error("Ops.");
  }
);
```

I still expect to see the message from the second observer. 
<br/>
At least this is what I experience when I run this code in Chrome, Firefox, Safari, etc.

Ok, so IE11 has a bug ... *who could have ever imagined!?* 
<br/>
Jokes aside, I still didn't understand how this IE11 bug was affecting the `Promise` polyfill.

## Finally, the light

At this point, it looked clear to me that, to understand the cause of the problem,
I should have looked at the microtask implementation in the core-js polyfill.

To make things easier to follow, I'm writing here the important bits.
The full version could be seen on [GitHub](https://github.com/zloirock/core-js/blob/master/packages/core-js/internals/microtask.js).

```js
var flush, head, last, notify, toggle, node;

// Bruno: I've removed the large `if` here, 
// and kept only the relevant block.

flush = function () {
  var parent, fn;
  if (IS_NODE && (parent = process.domain)) parent.exit();
  while (head) {
    fn = head.fn;
    head = head.next;
    try {
      fn();
    } catch (error) {
      if (head) notify();
      else last = undefined;
      throw error;
    }
  } last = undefined;
  if (parent) parent.enter();
};

toggle = true;
node = document.createTextNode('');
new MutationObserver(flush).observe(node, { characterData: true });
notify = function () {
  node.data = toggle = !toggle;
};

module.exports = function (fn) {
  var task = { fn: fn, next: undefined };
  if (last) last.next = task;
  if (!head) {
    head = task;
    notify();
  } last = task;
};
```

The `head` variable is a *single linked list*; it references the unit of work to be processed.

The `flush` function serves as the `MutationObserver` handler ... it walks the linked list,
processing the work, until it becomes empty.

The `notify` function encapsulates the ability to trigger the `MutationObserver` - it is
not too much different from my example above.

Finally the module exports a function, that wraps `notify`, and takes care of updating
the job list. Here, there's a very important thing to notice:

```js
module.exports = function (fn) {
  var task = { fn: fn, next: undefined };
  if (last) last.next = task;
  if (!head) {
    head = task;
    notify();
  } last = task;
};
```

The `notify` function is executed only when there isn't any job currently processed - `head` 
points to nothing. This usually works fine, cause as we said the `flush` function takes care 
of traversing the job list, and executing the jobs one by one ... so that when everything 
is done `head` points back to nothing, or `undefined`.

Except we discovered `flush` gets not executed at all, if an error happens in a
`MutationObserver` handler scheduled for execution in that same microtask. 
<br/>
That's very unfortunate! Now `head` points to the last job planned - a job that won't ever
be executed, leaving `head` pointing it for ever, so that further call to the microtask 
scheduler will never reach the line where `notify` is executed.

This finally explains why even the most simple of `Promise` seems to never be fullfilled.

```js
Promise.resolve()
  .then(
    function () {
      // Never runs; weird, isn't it?!
      console.log("Promise fulfilled");
    }
  )
```

## One mistery remains

Going through all this was interesting, and being able to understand the cause
of the problem extremely rewarding.
But even after all of this, one mistery remains - one destined to remain covered
in mist for ever - why the cookie law script (our third party script) needed to register 
a `MutationObserver` in the first place ?!
