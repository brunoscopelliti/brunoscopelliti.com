---
title: "Blog re-style (+ bonus: three WordPress tricks)"
preview: "Three WordPress tricks I learned when I restyled my blog."
date: 2013-05-30T09:00:00+01:00
meta_description: "Three WordPress tricks I learned"
categories: ["Meta", "WordPress"]
layout: "post"
changefreq: "yearly"
lastmod: 2021-01-01T09:00:00+01:00
priority: 0.7
---

Some weekends ago, I saved few of my free time to work on my blog.

The most evident change is that now for my blog, I'm using the
[Ryu](http://theme.wordpress.com/themes/ryu/ "WordPress Ryu theme") theme, by
the guys of Automattic.

It had been a long time since the last time I had worked with WordPress, and I really
appreciated it. So today I want to share three useful tricks to customize your
WordPress implementation.

One of the characteristics of this blog even before the restyle, was that, even if
you are logged in WordPress, the top toolbar is not displayed. There are several
possible hacks to achieve this behaviour, but my favorite is the following:

## Don't render WordPress toolbar

```php
/* Remove WordPress topbar */
add_filter("show_admin_bar", "__return_false");
```

The previous code snippet (and even the following) are meant to be added to the theme
function file, that is the function.php file.

## Change excerpt length

Wordpress allows to define custom length (length is expressed in number of words) for the excerpt.

```php
/* Set the length of the post excerpt */
function set_excerpt_length($length) {
  return 100;
}

add_filter("excerpt_length", "set_excerpt_length");
```

## Customize "Read more" text

Finally, it's even possible to customize the text that is showed after the excerpt.

```php
/* Customize excerpt "read more" label after the excerpt */
function set_excerpt_read_more($more) {
  return " ...";
}

add_filter("excerpt_more", "set_excerpt_read_more");
```

As you can see all the example of this post are using the `add_filter` function;
if you want to know more about it, check out the [filter documentation](http://codex.wordpress.org/Plugin_API/Filter_Reference "WordPress docs: Filters").
