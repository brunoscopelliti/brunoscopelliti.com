---
title: "jQuery custom build"
preview: "jQuery is a great library, but sometimes its almost 100 Kb of sweetness are a price we cannot pay. Using a custom build of jQuery might be a good trade-off."
date: 2013-04-09T12:27:05+01:00
meta_description: "How to produce a jQuery custom build"
categories: "jQuery"
layout: "post"
changefreq: "yearly"
lastmod: 2021-01-01T09:00:00+01:00
priority: 0.7
---

Ok, jQuery doesn't need any presentation.

I really like it; it has simplified a lot my work... BUT sometimes its almost 100Kb of sweetness are a price we can not pay.

If this is the case a good trade-off between light weight pages and all the goodness of jQuery, is to use a custom build of jQuery.

Custom builds allow to choose what features of jQuery are to be included in the minified file, and which not; perhaps you are working on a project and you are sure you'll never have to do an asynchronous request? Well you could absolutely renounce at the AJAX module of jQuery. Renounce at the unused features allows an important saving in terms of jQuery's weight. So, now the question is: "How could I made my custom build?".

## Setup operations

Before you can start there are a few things you have to install in your system.

* [NodeJS](http://nodejs.org/download/ "Download NodeJS page")
* [Git](http://git-scm.com/ "Git")
* [Grunt](http://gruntjs.com/ "GruntJS")

You can install Grunt also via npm, typing in your system shell:

```bash
npm install -g grunt-cli
```

## Get jQuery

Now that you've installed Git, you could use it to clone a copy of jQuery from its repository on GitHub. So in the Git shell, you have to type the following commands:

```bash
cd C:/path/to/your/repo
git clone git://github.com/jquery/jquery.git
```

## Build jQuery

Now that you've the code from the jQuery repository on your hard disk, open the shell in the root folder of jQuery and run the following command to install the Node dependencies.

```bash
npm install
```

If everything works fine, now you should be able to build jQuery from your machine. Take the Git shell in the jquery source folder and run the simple command:

```bash
grunt
```

If everything is ok, a new folder *dist* will be created, and inside this folder you can find the jQuery source code. What you've gotten is the official jQuery release. To customize your jQuery build you need a final step.

## Customize jQuery

Make a custom build of jQuery is not much different from build jQuery; we've still to use the grunt command, but we've also to specify some optional parameters. In particular we need to set the custom option:

```bash
grunt custom:-ajax
```

In particular this command allows to build jQuery without its ajax module, that normally allows to make asynchronous requests. Moreover, the system is smart enough that it won't include others modules which depend from the ajax module.

Currently jQuery consists of the following modules:

* ajax
* ajax/xhr
* ajax/script
* ajax/jsonp
* css
* deprecated
* dimensions
* effects
* event-alias
* offset
* sizzle

And all can be stripped away from our custom builds.
