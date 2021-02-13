---
title: "Let's write a Promise polyfill"
aliases:
  - /lets-write-a-promise-polyfill
preview: "Everybody in this industry know the ancient wisdom for which it's better avoid reinventing the wheel. Anyway, that's often necessary to really understand how things work."
date: 2018-02-26T09:00:00+01:00
meta_description: "JavaScript Promise shim, polyfill built from scratch"
categories: ["JavaScript", "Promise"]
layout: "post"
changefreq: "yearly"
lastmod: 2021-01-01T09:00:00+01:00
priority: 0.7
---

TL:DR; You can watch me live coding a promise's polyfill on YouTube.
Watch [Let's build a promise polyfill](https://www.youtube.com/watch?v=E_p-PVNqhZE&list=PLZYZ2RjeQoPiJcbCzArwMQXr3gr8tXCLC) playlist.

<br/>

We're going to build a Promise polyfill; it's the best way to understand how things work under the hood, after all.

My goal is not to have the most performant, or feature rich, implementation, but I'll try to optimize for ease of readability.

A brief disclaimer before we even start: you might have heard that Promise are going to disappear soon, cause `async function` permit to further improve how we handle asynchronous code.
That's only partially true, because async functions are built on top of Promise, having a solid understanding of how Promise works is important as never before.

So let's start from the very beginning: **What's a Promise?**

A promise represents the result of an operation (usually an asynchronous operation), it is a wrapper around a value, that may, or may not be available sometimes in the future. We stop to care about this.
It's useful because it permits developers to more easily work with a future value, as it was already available.

We create a new promise using the `new` operator.

```js
new Promise((resolve, reject) => {
  resolve(42);
});
```

Despite being a `function` under the hood, `class` in JavaScript can't be executed without the `new` operator.
So it does make sense to model our shim as a class.

```js
class Promifill {
  constructor () {}
}
```

A promise is characterized by its `value` and `state`.

A promise could have as value, whatever existing JavaScript value. It makes sense to consider `undefined` as initial value.

```js
class Promifill {
  constructor () {
    this.value = void 0;
  }
}
```

Differently the state could assume only three possibile *values*:

* **FULFILLED**, when the operation represented by the promise has been successfully completed, and its result has been used to define promise's value.

* **REJECTED**, when the operation represented by the promise has been completed, but it failed. In this case, the reason for the failure is used to define promise's value.

* **PENDING**, when the operation represented by the promise has not yet been completed.

Also, very important to remind is that once a promise is fulfilled, or rejected, there's no way its value, and state could be further modified.

Domenic Denicola has written very clearly about [the nomenclature](https://github.com/domenic/promises-unwrapping/blob/4a1c72c0fc4f9e47dbc7ae866970caf261aa46ab/docs/states-and-fates.md).

```js
const [
  FULFILLED,
  REJECTED,
  PENDING
] = [true, false, void 0];

class Promifill {
  constructor () {
    this.state = PENDING;
    this.value = void 0;
  }
}
```

Let's now add to the `constructor` signature the `executor` parameter.
It is a mandatory parameter, and it must be enforced as such.

```js
constructor (executor) {
  if (typeof executor != "function") {
    throw new TypeError(`Promise resolver must be a function`);
  }
}
```

The `executor` is sinchronously executed, receiving as arguments two functions, `resolve`
and `reject`, which have the power to settle the fate of the promise.

```js
constructor (executor) {
  if (typeof executor != "function") {
    throw new TypeError(`Promise resolver must be a function`);
  }

  this.state = PENDING;
  this.value = void 0;

  executor(resolve, reject);
}
```

`resolve` takes as argument the value that should be used to define value of the promise. For now, let's consider the state of the promise as fulfilled. That's not correct... but we'll fix this later.

```js
const resolve =
  (value) => {
    this.value = value;
    this.state = FULFILLED; // #FIXME
  };
```

Also `reject` takes as input parameter the value, that should be used to define the value of the promise; for a rejected promise, the reason for the rejection is considered as the value.
The state in this case could be safely assumed as always rejected.

```js
const reject =
  (reason) => {
    this.value = reason;
    this.state = REJECTED;
  };
```

The biggest flaw in current implementation is that it gives everybody free access to promise's internal state and value. Native promises keep this data into *internal slots*.

It's not possible to replicate internal slots in userland, but we can go pretty close.

Let's start by replacing the instance's fields with readonly accessors on the class prototype.

```js
class Promifill {
  get state () {
    return PENDING;
  }

  get value () {
    return void 0;
  }

  constructor (executor) {
    if (typeof executor != "function") {
      throw new TypeError(`Promise resolver must be a function`);
    }

    const resolve =
      (value) => {
        this.value = value;
        this.state = FULFILLED; // #FIXME
      };

    const reject =
      (reason) => {
        this.value = reason;
        this.state = REJECTED;
      };

    executor(resolve, reject);
  }
}
```

`resolve` and `reject` are going to shadow those fields when executing, by creating instance fields, which are not enumerable, not configurable, and not writable.

Let's create a simple utility for this job:

```js
const defineProperty =
  (target, propName, propValue) => {
    Object.defineProperty(target, propName, { value: propValue });
  };
```

With this in place we can rewrite `resolve` and `reject` as:

```js
const resolve =
  (value) => {
    defineProperty(this, "value", value);
    defineProperty(this, "state", FULFILLED); // #FIXME
  };

const reject =
  (reason) => {
    defineProperty(this, "value", reason);
    defineProperty(this, "state", REJECTED);
  };
```

Finally let's also add a check to exit early in case the state of the promise has already
been settled.

```js
class Promifill {
  get state () {
    return PENDING;
  }

  get value () {
    return void 0;
  }

  get settled () {
    return false;
  }

  constructor (executor) {
    if (typeof executor != "function") {
      throw new TypeError(`Promise resolver must be a function`);
    }

    const resolve =
      (value) => {
        if (this.settled) {
          return;
        }

        defineProperty(this, "settled", true);

        defineProperty(this, "value", value);
        defineProperty(this, "state", FULFILLED); // #FIXME
      };

    const reject =
      (reason) => {
        if (this.settled) {
          return;
        }

        defineProperty(this, "settled", true);

        defineProperty(this, "value", reason);
        defineProperty(this, "state", REJECTED);
      };

    executor(resolve, reject);
  }
}
```

Looking at the code written so far, we can see how the `executor` is immediately invoked.
We can't know, nor should we care, about the kind of code we're running...
It might throw, and we should be ready for this possibility.

When `executor` throws an exception, we still get back a promise, that is rejected, with the error been thrown as value.
Implementing this behaviour in our shim is pretty straightforward.

```js
try {
  executor(resolve, reject);
} catch (error) {
  reject(error);
}
```

If we take a look at code from a certain distance, there's a thing that certainly will
stand out. I mean that *#FIXME* comment we've left earlier.
It's quite time to fix it... but just before that, what's wrong there?

We've assumed so far, that `reject` always set promise's state to `REJECTED`, but also
that `resolve` always set promise's state to `FULFILLED`; but this is not always the case.
There's an important exception indeed.
In case `resolve` receives as input, a value, that is itself a promise, the new promise
should be resolved with state, and value of this promise (once its fate is set).

So, how to know when a promise becomes fulfilled, or gets rejected?
*It's possible to be somehow notified* of a promise changing its state using the `then`
method, that each promise shares on the class' prototype.

`then` accepts as arguments two functions: `onfulfill` and `onreject`; the first is
executed when the promise becomes fulfilled, the latter when it gets rejected.
`then` itself returns a new promise, that is settled with the value `onfulfill`, or
`onreject` will return.

```js
class Promifill {
  constructor (executor) {}

  then (onfulfill, onreject) {
    return new this.constructor((resolve, reject) => {
      // ?
    });
  }
}
```

However `onfulfill`, and `onreject` are not synchronously executed after promise's state changes.
Their execution is asynchronous; the JavaScript engine schedules their execution as a microtask. This should guarantee that they're executed asynchronously, but anyway before any other task.

[Jake Archibald has a great post on this topic](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/), and more recently [he has also spoken about JavaScript event loop at JSConf.Asia 2018](https://www.youtube.com/watch?v=cCOL7MC4Pl0). I absolutely recommend these resources.

We'll see later how to mock this behaviour in our polyfill; for now the take away is that since `onfulfill`, and `onreject` are not immediately executed, we need a place to store them for when the right moment arrives.
Let's prepare a such place:

```js
class Promifill {
  constructor (executor) {
    if (typeof executor != "function") {
      throw new TypeError(`Promise resolver must be a function`);
    }

    defineProperty(this, "observers", []);
  }
}
```

So, it's time to implement `then`.

```js
then (onfulfill, onreject) {
  return new this.constructor((resolve, reject) => {
    const internalOnfulfill =
      (value) => {
        resolve(onfulfill(value));
      }

    const internalOnreject =
      (reason) => {
        resolve(onreject(reason));
      };

    this.observers.push({
      onfulfill: internalOnfulfill,
      onreject: internalOnreject
    });
  });
}
```

The above implementation is still incomplete, but it's a good starting point to understand
what's going on.

We've wrapped the `onfulfill`, `onreject` functions (arguments of `then`) into another couple of functions, which capture in the closure `resolve`, and `reject`, and doing so, also the capability to resolve, reject the returned promise.
These functions are then stored into `observers` field, so that later we can reference, and execute them.

`internalOnfulfill`, and `internalOnreject` are mostly incomplete at this point.

For instance `internalOnfulfill` should also put into account the fact that `onfulfill` may not be provided, or that it may throw an exception.
So it's better written as:

```js
const internalOnfulfill =
  (value) => {
    try {
      resolve(
        typeof onfulfill == "function"
          ? onfulfill(value)
          : value
      );
    } catch (error) {
      reject(error);
    }
  };
```

And almost the same consideration could be done about `internalOnreject`, so that it could be rewritten as:

```js
const internalOnreject =
  (reason) => {
    try {
      if (typeof onreject == "function") {
        resolve(onreject(reason));
      } else {
        reject(reason);
      }
    } catch (error) {
      reject(error);
    }
  };
```

So, let's have a look at `then` in its completeness:

```js
then (onfulfill, onreject) {
  return new this.constructor((resolve, reject) => {
    const internalOnfulfill =
      (value) => {
        try {
          resolve(
            typeof onfulfill == "function"
              ? onfulfill(value)
              : value
          );
        } catch (error) {
          reject(error);
        }
      };

    const internalOnreject =
      (reason) => {
        try {
          if (typeof onreject == "function") {
            resolve(onreject(reason));
          } else {
            reject(reason);
          }
        } catch (error) {
          reject(error);
        }
      };

    this.observers.push({
      onfulfill: internalOnfulfill,
      onreject: internalOnreject
    });
  });
}
```

Having completed `then`, we can now use it to fix `resolve`.
Do you remember the problem?

```js
const resolve =
  (value) => {
    if (this.settled) {
      return;
    }

    defineProperty(this, "settled", true);

    defineProperty(this, "value", value);
    defineProperty(this, "state", FULFILLED); // #FIXME
  };
```

We had assumed that `resolve` always produce a fulfilled promise, but this doesn't always hold true: that's not the case when the value `resolve` receives as argument is itself a promise.

So, first step is to determine whether a value is a promise (or better a *thenable*), or not.
I use *duck checking* for this purpose:

> If it looks like a duck, swims like a duck, and quacks like a duck, then it probably is a duck.

I consider a value to be a *thenable* when it has a `then` method attached to it.
Let's write an utility to detect this kind of objects.

```js
const isThenable =
  (subject) => subject && typeof subject.then == "function";
```

Being a thenable is not a big deal on its own.
We're much more interested into distinguish *unsettled thenable* from whatever else.
That's cause we can easily access state, and value of promises created by our shim.

```js
const resolve =
  (value) => {
    if (this.settled) {
      return;
    }

    defineProperty(this, "settled", true);

    const thenable = isThenable(value);

    if (thenable && value.state === PENDING) {
      // ?
    } else {
      defineProperty(this, "value",
        thenable
          ? value.value
          : value);
      defineProperty(this, "state",
        thenable
          ? value.state
          : FULFILLED);
    }
  };
```

So, what can we do when the thenable is not yet settled?
We're going to register an observer on it, in order to be notified when its state changes.
However we can't simply write it like this:

```js
value.then(resolve, reject);
```

Otherwise the guard on `this.settled`, that we've put in place earlier to protect the value/state from unlegitimate changes, won't permit us to proceed further.
We need to put in place a mechanism to bypass that safety guard.

Sure there are different ways to make this...
I'm going to setup a bypass mechanism based on a key that simply is not possible to have
from outside the class' constructor.

```js
const secret = [];

const resolve =
  (value, bypassKey) => {
    if (this.settled && bypassKey !== secret) {
      return;
    }

    defineProperty(this, "settled", true);

    const thenable = isThenable(value);

    if (thenable && value.state === PENDING) {
      value.then(
        (v) =>
          resolve(v, secret),
        (r) =>
          reject(r, secret)
      );
    } else {
      defineProperty(this, "value",
        thenable
          ? value.value
          : value);
      defineProperty(this, "state",
        thenable
          ? value.state
          : FULFILLED);
    }
  };
```

Current implementation works, but triggers `then`'s getter twice: first time is for the
type check `typeof obj.then == "function"`, and the second for the execution.
It's required that `then`'s getter gets invoked only once per use.
Let's fix this:

```js
const resolve =
  (value, bypassKey) => {
    if (this.settled && bypassKey !== secret) {
      return;
    }

    defineProperty(this, "settled", true);

    const then_ = value && value.then;
    const thenable = typeof then_ == "function";

    if (thenable && value.state === PENDING) {
      then_.call(
        value,
        (v) =>
          resolve(v, secret),
        (r) =>
          reject(r, secret)
      );
    } else {
      defineProperty(this, "value",
        thenable
          ? value.value
          : value);
      defineProperty(this, "state",
        thenable
          ? value.state
          : FULFILLED);
    }
  };
```

On the other hand, `reject` was already pretty fine.
At the point it's executed, is already pretty clear that we're going to end up with a new rejected promise, so there's no reason to wait:

```js
const lateRejection = new Promise((_, reject) => {
  setTimeout(reject, 60000, "A minute late rejection.");
});

const promise = new Promise((resolve) => {
  resolve(lateRejection);
});

promise.catch(() => console.log("Immediate, instead!"));
```

It should simply be extended to recognize the secret key, when provided.
So it ends up being as below:

```js
const reject =
  (reason, bypassKey) => {
    if (this.settled && bypassKey !== secret) {
      return;
    }

    defineProperty(this, "settled", true);

    defineProperty(this, "value", reason);
    defineProperty(this, "state", REJECTED);
  };
```

Having fixed the `constructor`, let's recap what we've done till this point.

We've in place a reliable mechanism to mark an object representing a promise as fulfilled, or rejected. We've also a way to register an handler that should be invoked as microtask - that is before any other task - when promise's fate is set.

What is still missing is something that triggers the execution of all the registered observers when a promise changes its state.

But, at this point is not hard to find where promise's fate is defined: in the `resolve`, and `reject` functions, which are declared in the `constructor`.
That's the best place to schedule the observers as microtask.

```js
const resolve =
  (value, bypassKey) => {
    if (this.settled && bypassKey !== secret) {
      return;
    }

    defineProperty(this, "settled", true);

    const then_ = value && value.then;
    const thenable = typeof then_ == "function";

    if (thenable && value.state === PENDING) {
      then_.call(
        value,
        (v) =>
          resolve(v, secret),
        (r) =>
          reject(r, secret)
      );
    } else {
      defineProperty(this, "value",
        thenable
          ? value.value
          : value);
      defineProperty(this, "state",
        thenable
          ? value.state
          : FULFILLED);

      schedule(this.observers);
    }
  };

const reject =
  (reason, bypassKey) => {
    if (this.settled && bypassKey !== secret) {
      return;
    }

    defineProperty(this, "settled", true);

    defineProperty(this, "value", reason);
    defineProperty(this, "state", REJECTED);

    schedule(this.observers);
  };
```

Let for a moment `schedule` not implemented.
The instance's `observers` field is an `array` of `object`s, each containing an `onfulfill`, and `onreject` handler... but only one of these is effectively executed, on the basis of the promise's state.
When `schedule` is executed the promise's state is already known, so that we can pass to `schedule` the correct handler, together with the promise's value.

```js
schedule(
  this.observers.map((observer) => ({
    handler: this.state === FULFILLED
      ? observer.onfulfilled
      : observer.onrejected,
    value: this.value
  }))
);
```

Before moving on, it's important to consider that, `then` may happen to be called on a promise, that is already fulfilled, or rejected.
To determine whether that's the case we can check promise's state, and consequently registering, or scheduling the observers.

```js
if (this.state === PENDING) {
  this.observers.push({
    onfulfill: internalOnfulfill,
    onreject: internalOnreject
  });
} else {
  schedule([{
    handler: this.state === FULFILLED
      ? internalOnfulfill
      : internalOnreject,
    value: this.value
  }]);
}
```

It's quite time to implement `schedule`.
The problem we're going to solve could be summerized as:

> How can we mock in a pre-promise environment the execution of a microtask?

Let's consider for now only browsers as target environment of our shim.
Later we're going to extend it, to be environment-independent, but let's keep it simple for now.

Since we're just considering browsers, we can exploit the fact that the handler passed to a [mutation observer](https://developer.mozilla.org/it/docs/Web/API/MutationObserver) is scheduled as a microtask.

```js
const func =
  () => console.log("A microtask");

const observer = new MutationObserver(func);
const node = document.createTextNode("");

observer.observe(node, { characterData: true });

setTimeout(() => console.log("A task"), 0);
node.data = 1;
```

In the above snippet, `func` is scheduled as microtask when `node`'s data changes, and it's invoked before the handler passed to `setTimeout`.

```js
const schedule =
  (() => {
    let microtasks = [];

    const run =
      () => {
        let handler, value;
        while (microtask.length > 0 &&
          ({ handler, value } = microtasks.shift())) {
          handler(value);
        }
      };

    const observer = new MutationObserver(run);
    const node = document.createTextNode("");

    observer.observe(node, { characterData: true });

    return (observers) => {
      if (observers.length === 0) {
        return;
      }

      microtasks = microtasks.concat(observers);
      observers.length = 0;

      node.data = node.data === 1
        ? 0
        : 1;
    };
  })();
```

This code is not super beautiful; we'll improve it later, anyway.
Let's look better at the `while` loop:

```js
while (queue.length > 0 && ({ handler, value } = queue.shift())) {
  handler(value);
}
```

What do you think should happen in case `handler` throws an exception?

We've sprinkled a few `try... catch`es around, which helps create rejected promises whenever an otherwise uncaught exception occurs.
But they are somehow overprotective.
In fact what would have been an uncaught exception using the native built-in, is always caught somewhere in our shim.

We’ve to re-throw the exception, immediately (not synchronously) after having marked the promise rejected.

The only condition is that the promise's rejection remains uncaught, that is there's at least a promise's chain branch that is not recovered with `then(*, onreject)`.

In order to know whether that's the case we need to know the whole promises' chain.
So, let's start by adding to our class another field, to track the chain.

```js
class Promifill {
  constructor (executor) {
    // ...

    defineProperty(this, "chain", []);
    defineProperty(this, "observers", []);

    // ...
  }

  then (onfulfill, onreject) {
    const chainedPromise = new this.contructor((resolve, reject) => {
      // ...
    });

    this.chain.push(chainedPromise);
    return chainedPromise;
  }
}
```

Let's now consider the following utilities, `defer`:

```js
const defer =
  (handler) =>
    (...args) => {
      setTimeout(handler, 0, ...args);
    }
```

and, `thrower`:

```js
const thrower =
  (error) => {
    throw error instanceof Error
      ? error
      : new Error(error);
  };
```

so that, we can write `raiseUnhandledPromiseRejectionException` as:

```js
const raiseUnhandledPromiseRejectionException =
  defer((error, promise) => {
    if (promise.chain.length > 0) {
      return;
    }
    thrower(error);
  });
```

We can now use `raiseUnhandledPromiseRejectionException` to schedule the throwing of an exception when a promise gets rejected.

So it should be used in `reject` of course:

```js
const reject =
  (reason, bypassKey) => {
    if (this.settled && bypassKey !== secret) {
      return;
    }

    defineProperty(this, "settled", true);

    defineProperty(this, "value", reason);
    defineProperty(this, "state", REJECTED);

    schedule(
      this.observers.map((observer) => ({
        handler: observer.onrejected,
        value: this.value
      }))
    );

    raiseUnhandledPromiseRejectionException(this.value, this);
  };
```

... but also in `resolve`:

```js
const resolve =
  (value, bypassKey) => {
    if (this.settled && bypassKey !== secret) {
      return;
    }

    defineProperty(this, "settled", true);

    const then_ = value && value.then;
    const thenable = typeof then_ == "function";

    if (thenable && value.state === PENDING) {
      then_.call(
        value,
        (v) =>
          resolve(v, secret),
        (r) =>
          reject(r, secret)
      );
    } else {
      defineProperty(this, "value",
        thenable
          ? value.value
          : value);
      defineProperty(this, "state",
        thenable
          ? value.state
          : FULFILLED);

      schedule(
        this.observers.map((observer) => ({
          handler: this.state === FULFILLED
            ? observer.onfulfilled
            : observer.onrejected,
          value: this.value
        }))
      );

      if (this.state === REJECTED) {
        raiseUnhandledPromiseRejectionException(this.value, this);
      }
    }
  };
```

Current implementation works quite well; but it has still a few problems in some edge cases, in which it ends up throwing more than what's due. As example:

```js
const immediateRejection = new Promise((_, reject) => {
  reject("Boom");
});

const promise = new Promise((resolve) => {
  resolve(immediateRejection);
});
```

When a promise is resolved to a rejected promise, there should be only one throw after the promise is resolved.

```js
const resolve =
  (value, bypassKey) => {
    // ...

    const then_ = value && value.then;
    const thenable = typeof then_ == "function";

    if (thenable) {
      defineProperty(value, "preventThrow", true);
    }

    // ...
  };
```

This information is gold, and permits `raiseUnhandledPromiseRejectionException` to further restrict the condition on which it throws:

```js
const raiseUnhandledPromiseRejectionException =
  defer((error, promise) => {
    if (promise.preventThrow || promise.chain.length > 0) {
      return;
    }
    thrower(error);
  });
```

Our scheduler works now pretty well on every browsers supporting `MutationObservers`; but it throws pretty fast when executed as Node.js module. That's cause there's no such a thing as mutation observers in node.
Let's now try to extend `schedule`, so that it works indifferently both on browsers, both in Node.js.

```js
const schedule =
  (() => {
    let microtasks = [];

    const run =
      () => {
        let handler, value;
        while (microtask.length > 0 &&
          ({ handler, value } = microtasks.shift())) {
          handler(value);
        }
      };

    const observer = new MutationObserver(run);
    const node = document.createTextNode("");

    observer.observe(node, { characterData: true });

    return (observers) => {
      if (observers.length === 0) {
        return;
      }

      microtasks = microtasks.concat(observers);
      observers.length = 0;

      node.data = node.data === 1
        ? 0
        : 1;
    };
  })();
```

In our `schedule`'s implementation we can recognize two environment specific operations.
Initially it setups the `MutationObserver`:

```js
const observer = new MutationObserver(run);
const node = document.createTextNode("");

observer.observe(node, { characterData: true });
```

... and later, it triggers a mutation on the observed element:

```js
node.data = node.data === 1
  ? 0
  : 1;
```

Let's extract these operations outside our scheduler.

```js
class MutationObserverStrategy {
  constructor (handler) {
    const node = this.node =
      document.createTextNode("");
    const observer = new MutationObserver(handler);
    observer.observe(node, { characterData: true });
  }

  trigger () {
    this.node = this.node.data === 1
      ? 0
      : 1;
  }
}
```

So that now the `schedule` can be written as:

```js
const schedule =
  (() => {
    let microtasks = [];

    const run =
      () => {
        let handler, value;
        while (microtask.length > 0 &&
          ({ handler, value } = microtasks.shift())) {
          handler(value);
        }
      };

    const ctrl = new MutationObserverStrategy(run);

    return (observers) => {
      if (observers.length === 0) {
        return;
      }

      microtasks = microtasks.concat(observers);
      observers.length = 0;

      ctrl.trigger();
    };
  })();
```

Current version works exactly how the previous implementation, but it's far easier to extend; we only need to provide a different *strategy* for Node.js, or for browsers which don't support `MutationObserver`; and that's exactly what we're going to do now.

The only requirement we've is that all the strategies match the same unwritten interface, that is implement the `trigger` method.

We can use the built-in `process.nextTick` to schedule a microtask in Node.js.
I would have preferred `setImmediate`, [but it appears to not be completely reliable yet](https://github.com/nodejs/node/issues/7145).

```js
class NextTickStrategy {
  constructor (handler) {
    this.scheduleNextTick =
      () => process.nextTick(handler);
  }

  trigger () {
    this.scheduleNextTick();
  }
}
```

Finally in a browser that does not support `MutationObserver`, there's no way I am aware of to schedule a microtask. For such cases we can still provide a strategy that mostly works, despite not being 100% spec compliant.

```js
class BetterThanNothingStrategy {
  constructor (handler) {
    this.scheduleAsap =
      () => setTimeout(handler, 0);
  }

  trigger () {
    this.scheduleAsap();
  }
}
```

Now that we've a lib of possible strategies, what's missing is an orchestrator, that picks the most appropriate strategy, given the current environment. Despite this sounding as a really smart move, it's as simple as writing a function, with a couple of `if`s inside.

```js
const getStrategy =
  () => {
    if (typeof window != "undefined" &&
      typeof window.MutationObserver == "function") {
      return MutationObserverStrategy;
    }

    if (typeof process != "undefined" &&
      typeof process.nextTick == "function") {
      return NextTickStrategy;
    }

    return BetterThanNothingStrategy;
  }
```

At this point, making the scheduler isomorphic (or universal, or whatever it's used these days) it's just a matter of replacing the hardcoded use of `MutationObserverStrategy` with the code below:

```js
const Strategy = getStrategy();
const ctrl = new Strategy(run);
```

At this point our shim works pretty well, both on browsers, both in Node.js.
What's still missing is to complete its public interface, with both the *instance*, and *static* methods.

Beyond `then` (that is already completed), each promise instance has two other methods, `catch` and `finally`.

`catch` takes as argument a function, `onreject`, that is invoked in case the promise on which `catch` is called gets rejected. It returns a new promise that is fulfilled with the value `onreject` will return.
This description might sound familiar... and for good reasons.
It's pretty much what `then(*, onreject)` does.
In fact we can think of `catch` as a shortcut for `then(null, onreject)`, and we can also implement it as such:

```js
class Promifill {
  constructor (executor) {
  }

  catch (onreject) {
    return this.then(null, onreject);
  }

  then (onfulfill, onreject) {
  }
}
```

`finally` is a recent addition; it is introduced with ES2018, mostly to make Promise's public api match the historic `try {} catch (error) {} finally {}` block.

You might need `finally` in the same scenarios you would have used the `finally` clause of a `try {} catch (error) {}` block, that is when you want the same instruction to be executed indipendently from the fact the code has thrown an exception or not.

`finally` receives as input parameter a function, `oncomplete`, that is executed when the promise on which it's called becomes fulfilled, or gets rejected. `oncomplete` does not receive anything as input parameter, neither its return value is used for something; in fact `finally` returns a new promise, that has the exact same state, and value of the promise on which `finally` has been called.
The only case in which `finally` can produce a promise with different state, and value is when `oncomplete` throws an exception.

So let's implement this behaviour:

```js
class Promifill {
  constructor (executor) {
  }

  catch (onreject) {
  }

  finally (oncomplete) {
    const chainedPromise = new this.contructor((resolve, reject) => {
      const internalOncomplete =
        () => {
          try {
            oncomplete();
            if (this.state === FULFILLED) {
              resolve(this.value);
            } else {
              reject(this.value);
            }
          } catch (error) {
            reject(error);
          }
        };

        if (this.state === PENDING) {
          this.observers.push({
            onfulfill: internalOncomplete,
            onreject: internalOncomplete
          });
        } else {
          schedule([{
            handler: internalOncomplete
          }]);
        }
    });

    this.chain.push(chainedPromise);
    return chainedPromise;
  }

  then (onfulfill, onreject) {
  }
}
```

To complete our implementation of Promise built-in at this point we're only missing a couple of static methods.

`Promise.resolve`, and `Promise.reject` despite some important difference are quite similar, at least for what concern the scope of usability.
They are pretty useful in case you're not sure about a value you need to work with, and want to be sure it's a promise, or in case you know it's a promise built with a different library, and want to cast it to a genuine `Promifill` promise.

Let's talk about `Promise.resolve`.
In case the provided value is already an original Promifill's promise it returns it unchanged. Otherwise it creates a new promise that is resolved with the provided value, following - in case it's a thenable - its `then` method.

```js
class Promifill {
  static resolve (value) {
    return value.constructor === Promifill
      ? value
      : new Promifill((resolve) => {
        resolve(value);
      });
  }
}
```

Since we've implemented `Promise.resolve` on the basis of our internal `resolve` function, we've got for free the correct behaviour in case the value passed to `Promise.resolve` is a generic *thenable*.

`Promise.reject` creates always a new promise that is immediately rejected with the given reason. So it's pretty straightforward to implement.

```js
class Promifill {
  static reject (reason) {
    return new Promifill((_, reject) => {
      reject(reason);
    });
  }
}
```

Finally the other two functions `Promise.all`, and `Promise.race` are more the kind of utilities you could find in other libraries.

`Promise.all` receives as input an *iterable*, such as an array, and returns a new promise that is fulfilled only when all the values in the iterable are fulfilled. In this case the value of the promise is an array containing the fulfilled values of each element of the iterable. In case at least one of the element in the iterable gets rejected, the new promise is rejected as well, with the reason of the first element in the iterable been rejected.

Let's implement this behaviour.

We start by validating the input parameters: it's required that it is an `iterable`.
Let's create a couple of utility for this task; let's have an `isIterable`:

```js
const isIterable =
  (subject) => subject != null &&
    typeof subject[Symbol.iterator] == "function";
```

that's used by `validateIterable`:

```js
const validateIterable =
  (subject) => {
    if (isIterable(subject)) {
      return;
    }

    throw new TypeError(`Cannot read property 'Symbol(Symbol.iterator)' of ${Object.prototype.toString.call(subject)}.`);
  };
```

We can now use `validateIterable` to validate the input parameter `Promise.all` receives.

```js
class Promifill {
  static all (iterable) {
    return new Promifill((resolve, reject) => {
      validateIterable(iterable);

      // ?
    });
  }
}
```

To implement `Promise.all` behaviour, we'll need an array where to store the fulfilled value of all the element in the iterable. It starts empty, and we'll add element to it as soon as each one become fulfilled.

So we start iterating on all the element in the iterable.
We use `Promifill.resolve` to normalize each entry to a genuine `Promifill` object.

```js
class Promifill {
  static all (iterable) {
    return new Promifill((resolve, reject) => {
      validateIterable(iterable);

      let iterableSize = 0;
      const values = [];

      for (let item of iterable) {
        ((entry, index) => {
          Promifill.resolve(entry)
            .then(
              (value) =>
                add(value, index),
              reject
            );
        })(item, iterableSize++);
      }
    });
  }
}
```

The internal `add` method should also check that all the elements in the iterable have been fulfilled, hence resolve the new promise.

```js
const add =
  (value, index) => {
    values[index] = value;
    if (values.length === iterableSize) {
      resolve(values);
    }
  };
```

Current `add`'s implementation might result bugged; in fact in case the last element in the iterable is not the last element to be fulfilled/rejected `values.length === iterableSize` results `true` (`values` becomes a sparse array) and the promise becomes fulfilled too early.
That's could be fixed by remembering that `Array#filter` skips array's hole; so that the check becomes something like:

```js
const add =
  (value, index) => {
    values[index] = value;
    if (values.filter(() => true).length === iterableSize) {
      resolve(values);
    }
  };
```

To complete `Promise.all` we need to cover a last edge case.
What would happen in case the iterable is empty?
Current implementation returns a promise that never gets settled; but that's not what it's supposed to do.
In this case it should return a promise that's fulfilled, and has as value an empty array.

So first task is to determine whether an iterable is empty.
So let's add `isEmptyIterable` in our lib:

```js
const isEmptyIterable =
  (subject) => {
    for (let _ of subject) {
      return false;
    }
    return true;
  };
```

So that in the end we can write our complete `Promise.all` as:

```js
class Promifill {
  static all (iterable) {
    return new Promifill((resolve, reject) => {
      validateIterable(iterable);

      let iterableSize = 0;
      const values = [];

      if (isEmptyIterable(iterable)) {
        return resolve(values);
      }

      const add =
        (value, index) => {
          values[index] = value;
          if (values.filter(() => true).length === iterableSize) {
            resolve(values);
          }
        };

      for (let item of iterable) {
        ((entry, index) => {
          Promifill.resolve(entry)
            .then(
              (value) =>
                add(value, index),
              reject
            );
        })(item, iterableSize++);
      }
    });
  }
}
```

Finally `Promise.race`.
It accepts an iterable as input parameter, and returns a new promise, that is fulfilled, or gets rejected as soon the first element in the iterable is fulfilled, or gets rejected with that value, or reason.

Strange enough, in case it receives an empty iterable, the promise it returns, never gets settled.

```js
class Promifill {
  static race (iterable) {
    return new Promifill((resolve, reject) => {
      validateIterable(iterable);

      if (isEmptyIterable(iterable)) {
        return;
      }

      for (let entry of iterable) {
        Promifill.resolve(entry)
          .then(resolve, reject);
      }
    });
  }
}
```
