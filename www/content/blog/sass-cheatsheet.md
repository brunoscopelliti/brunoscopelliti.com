---
title: "SASS Cheatsheet"
preview: "In which I share with you my SASS cheatsheet."
date: 2013-03-20T09:00:00+01:00
meta_description: "My personal SASS cheatsheet"
categories: ["SASS", "CSS", "memo"]
layout: "post"
changefreq: "yearly"
lastmod: 2021-01-01T09:00:00+01:00
priority: 0.7
---

Few months ago, I started working with SASS - I use SCSS syntax cause I care about my mental health.

It's not particularly difficult, and if you learnt CSS, well, you could learn SASS.

One of the first thing I wanted was some kind of SASS cheatsheet - so I summarized
the main features of SASS in a SASS file.

## Variables

Sass allows you to declare variables that can be used through the stylesheet.

Variables begin with `$` and are declared just like properties.

They can have any value that's allowed for a CSS property, such as colors, numbers
(with units), or text.

```scss
$defaultWindowSize: 960px;
$defaultLinkColor: #46EAC2;

a {
  color: $defaultLinkColor;
}
```

## Nesting blocks

Often when writing CSS, you have several selectors that share a common ancestor.
SASS allows you to avoid duplication by nesting the child selectors within the ancestor.

The special character `&` references the parent selector.

```scss
a {
  text-decoration: none;

  &:hover { 
    text-decoration: underline; 
  }
}
```

## Operations and Functions

SASS has a number of [predefined functions](http://sass-lang.com/docs/yardoc/Sass/Script/Functions.html).

```scss
a {
  color: lighten($defaultLinkColor, 10%);
}
```

## Interpolation

Variables can be used for more than just property values. You can use `\#{variable}`
to insert them into property names or selectors.

```scss
$wk: -webkit-;

.rounded-box {
  #{$wk}border-radius: 4px;
}
```

## Mixins

Mixins allow re-use of styles without having to copy and paste them or move them
into a non-semantic class.

Mixins are defined using the `@mixin` directive, which takes a block of styles
that can then be included in another selector using the `@include` directive.

```scss
@mixin default-box {
  $borderColor: #333;
  /* $borderColor could be used only
    in the scope of the default-box block; */
  border: 1px solid $borderColor;
  clear: both;
  display: block;
  margin: 5px 0;
  padding: 5px 10px;
}

footer, header {
  @include default-box; 
}
```

## Arguments

The real power of mixins comes when you pass them arguments.
Arguments are declared as a parenthesized, comma-separated list of variables.
Each of those variables is assigned a value each time the mixin is used.

```scss
@mixin default-box($color, $boxModel, $padding) {
  border: 1px solid $color;
  clear: both;
  display: $boxModel;
  margin: 5px 0;
  padding: 5px $padding;
}

header{ @include default-box(#333, block, 10px); }
footer{ @include default-box(#999, inline-block, 5px); }
```

## Selector Inheritance

Sass, using the `@extend` directive, can tell one selector to inherit all the
styles of another without duplicating the CSS properties.

```scss
.error {
  border: 1px #f00;
  background: #fdd;
}

.bigError {
  @extend .error;
  font-size: 18px;
}
```

## Import stylesheet

CSS has an `@import` directive that allows you to break your styles up into
multiple stylesheets. Any style rule, variables or mixins defined in imported
files are available to the files that import them.

```scss
@import "partials/_vars";

body {
  color: $color;
}
```

## Operations

To compile the code simply use:

```bash
sass --watch style.scss:style.css
```

or to watch all the files in a directory:

```bash
sass --watch stylesheets/sass:stylesheets/compiled
```

If you don't want to mess your mind with this different style of writing CSS,
you could still continue to write your classic CSS rules in a .scss file and use
the SASS engine to get the correspondent CSS. Why?

Because, by setting the right options, you could use the SASS engine to minimize your CSS.

```bash
sass --style {nested | expanded | compact | compressed}
  --watch path/sass:path/compiled
```

I leave to you the test of how the use of these different keywords changes the output.
If you have not much time, you could find this answer, and much more, on the official
[reference page](http://sass-lang.com/documentation/file.SASS_REFERENCE.html "SASS Reference").
