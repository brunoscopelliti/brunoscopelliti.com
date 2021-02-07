---
title: "DRY and strawberries"
aliases:
  - /dry-and-strawberries
preview: "Code reuse is important, but if you're not careful it can make more damage than good. In this post I explore one of a such cases, and provide a still DRY-compliant alternative. The strawberries? Just read the post."
date: 2017-05-12T09:00:00+01:00
meta_description: "Don't Repeat Yourself - code reuse best practices"
categories: "Programming"
layout: "post"
changefreq: "yearly"
lastmod: 2021-01-01T09:00:00+01:00
priority: 0.7
---

DRY stands for *Don't Repeat Yourself*, and it is an ancient motto in programming circles. It favors code reuse, that is a good thing on its own for several reasons; however it can be done in the wrong way, or, better to say in this case, in the wrong direction.

Recently, while explaining this concept to a collegue of mine, I came out with this funny metaphor, that helped mark my point. I want to share here for future reference.

Let's say that you've desire to eat strawberries. You live just above a pastry shop; you go downstairs, and order a cake with strawberries. Then you eat all the strawberries, and leave there the cake (you just wanted strawberry).

That's hardly normal!

A much more natural approach would have been to reach a greengrocery, and buy only the strawberries.

Now let's say you want to make a strawberries cake, and you've already bought all the ingredients, but the strawberries. Again you go out, reach the greengrocery, and buy the strawberries.

That's much more reasonable.

Get out of the metaphor now, and let's say we've a method that returns information about order prices.

*I'm going to use TypeScript syntax in the following snippets.*

```ts
interface IOrderPrices {
  products : IProductPrice[],
  productsSubtotal : number,
  shippingCosts : number,
  paymentCosts : number
  tax : number
};

const computeOrderPrices : (orderId: string) => IOrderPrices =
  (orderId) => {
    // do "potentially" lots of stuff
  };
```

The `computeOrderPrices` method builds a model with price information... it potentially needs to send requests to different apis. It is a useful abstraction in case you need to display the customer a general recap of their order.

Let's say now we need only to render shipping costs. Since we already have `computeOrderPrices`, we could be tempted to do something like this:

```ts
const computeShippingCostPrices : (orderId: string) => number =
  (orderId) => computeOrderPrices(orderId).shippingCosts;
```

Naturally this is a nice one-liner! But beauty apart, here it's happening something really bad: we've bought a strawberry cake to eat only the strawberries. We're paying (computation, network, ...) for lots of data we don't really care, and just to be DRY-compliant.

But, we can still being DRY; we just have to change perspective, and rewrite `computeOrderPrices` so that it does reuse `computeShippingCostPrices`. It should be something like this:

```ts
const computeShippingCostPrices : (orderId: string) => number =
  (orderId) => {
    // only computes shipping cost
  };

const computeOrderPrices : (orderId: string) => IOrderPrices =
  (orderId) => {
    const orderPrice = new OrderPrice();

    // ...
    orderPrice.shippingCosts = computeShippingCostPrices(orderId);

    return orderPrice;
  };
```
