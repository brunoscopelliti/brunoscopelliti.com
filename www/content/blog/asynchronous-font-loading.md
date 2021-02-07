---
title: "Asynchronous Font Loading"
aliases:
  - /asynchronous-font-loading
preview: "Recently I've changed how fonts are loaded on my personal blog."
date: 2017-03-25T09:00:00+01:00
meta_description: "How to load fonts asyncronously with typekit/webfontloader"
categories: "Web Perf"
layout: "post"
changefreq: "yearly"
lastmod: 2021-01-01T09:00:00+01:00
priority: 0.7
---

The characters you're reading right now are rendered in a font called [Ubuntu](https://fonts.google.com/specimen/Ubuntu). It's a pretty populare one. I'm also using the [Merriweather](https://fonts.google.com/specimen/Merriweather) font, in the homepage, right under my face, and in a few other places. Aren't they nice? Hardly not!

However fonts are generally heavy resources to load... and having to load more of them may negatively affect loading performance of a website. In particular, there are two different problems:

* Increase loading time.

* Browsers handle differently the interval of time in which the font has not yet been loaded.

## typekit/webfontloader to the rescue

Using a font loader can help to solve both the issues. At the end, I opted for [typekit/webfontloader](https://github.com/typekit/webfontloader), mostly because it's developed by Google (and Typekit), and it's super easy to integrate with [Google Fonts](https://fonts.google.com/).

Loading fonts asyncronously, immediately resolves the first issue. But, what about the second problem? It turns out that using typekit/webfontloader, it's pretty easy to work around also browsers' inconsistencies. Indeed, it sets a series of class on the `html` element, through which we can easily control what the browser should do during, and after the font loading time.

## My setup

First things, first.

In order to have this css class, I started by including the typekit/webfontloader library. It registers a new global variable, `WebFont`, that I could use to load the fonts. In my case this is something like:

```html
<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"></script>
<script type="text/javascript">
  WebFont.load({
    google: {
      families: [
        "Ubuntu:300,500,700",
        "Merriweather:300i"
      ]
    }
  });
</script>
```

Then, with CSS I could define browsers behaviour during the fonts loading interval.

```css
body {
  font-family: 'Arial', sans-serif;
}

.wf-ubuntu-n3-active body,
.wf-ubuntu-n5-active body,
.wf-ubuntu-n7-active body {
  font-family: 'Ubuntu', sans-serif;
}
```

## Results

Ok, so at this point you may be wondering whether doing all this stuff is worth the hassle.

Let's check the facts. The following are network recordings of my website homepage during its first loading.

{{% image src="perf-pre-font-async-loading.png" caption="Network recordings with synchronous loading of the fonts. Home wifi. Loading Time 2.15s." zoom=true %}}

{{% image src="perf-post-font-async-loading.png" caption="Network recordings with typekit/webfontloader. Home wifi. Loading Time 1.48s." zoom=true %}}

Having repeated this test multiple time, I always got consistent results. That's an improvement of about 30%.

However repeating the test simulating a good 3g connection, revealed that in my particular case the optimization does not result in faster loading, cause loading time is *dominated* by the time needed to download the big jpg image that is used as background.

{{% image src="perf-pre-font-async-loading-mobile-3g.png" caption="Network recordings with synchronous loading of the fonts. Good 3g. Loading Time 4.75s." zoom=true %}}

{{% image src="perf-post-font-async-loading-mobile-3g.png" caption="Network recordings with typekit/webfontloader. Good 3g. Loading Time 4.82s." zoom=true %}}
