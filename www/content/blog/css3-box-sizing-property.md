---
title: "CSS3 box-sizing property"
preview: "I can't remember how box-sizing works; hope writing it down helps."
date: 2013-04-30T09:00:00+01:00
meta_description: "About new CSS3 box-sizing prop"
categories: "CSS"
layout: "post"
changefreq: "yearly"
lastmod: 2021-01-01T09:00:00+01:00
priority: 0.7
---

Recently I had to use the `box-sizing` property... and every time I needed to search on Internet for the correct usages. So, last time this happened I've decided to write a post about it, with the hope this help me memorize it - or at least next time I can google for myself 🙂

## box-sizing, why?

Until a few years ago, when you assigned an element a ruleset like the following, you got a square with size 120 pixel.

```css
.my-box {
  height: 100px;
  padding: 10px;
  width: 100px;
}
```

So, in case you absolutely want the padding, and a squared box of 100 pixel, the only solution was to change the css rules to something like:

```css
.my-box {
  height: 80px;
  padding: 10px;
  width: 80px;
}
```

## box-sizing to the rescue

To avoid this mess, CSS3 introduced the `box-sizing` property.

How does it work? Look at this demo:

{{% codepen hash=FDtzg %}}

Both the rectangles have the same CSS class box, to which are applied the following rules:

```css
.box {
  display: inline-block;
  height: 80px;
  padding: 20px;
  width: 180px;
}
```

The rectangles are different for the only fact that, at the second rectangle is applied the `box-sizing` CSS property.

```css
.box.severe {
  box-sizing: border-box;
}
```

This forces the browser to render the rectangle with the specified width and height, and place the border and padding inside the box.

## box-sizing property

Currently there are three possible values for the box-sizing property:

* `content-box`: the default behavior; the box has the width and height specified, and eventually the border and the padding are outside the specified width and height.

* `border-box`: force the browser to render border, and padding inside the specified width and height.

* `inherit`: the value is inherited from the parent node.

Are you thinking at the support of the browsers?

Having [Can I use...](http://caniuse.com/#feat=css3-boxsizing "Can I use box-sizing") as reference, I can say that the support of the browser is not too bad after all.
