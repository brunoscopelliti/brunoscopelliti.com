---
title: "Getting started with Grunt"
preview: "Recently I started learning/using Grunt; I am surprised by how easy is to get started. In this post I share what I learned."
date: 2013-05-28T09:00:00+01:00
meta_description: "Getting started with Grunt, the automatic task runner made in Node.js"
categories: "Grunt"
layout: "post"
changefreq: "yearly"
lastmod: 2021-01-01T09:00:00+01:00
priority: 0.7
---

Last weekend I finally found few time to give a try to `Grunt`.

I am surprised by how easy is to get started, and I am curious to experiment the benefits which its usage can bring in a real world app.

After some really trivial tests, my first serious attempt to create something useful with Grunt has been to create an automatic process to minify and then concatenate different javascript files; this post will collect a few notes about what I learned while I was trying to set up this process.

Note: the [docs on grunt](http://gruntjs.com/getting-started "Getting started with Grunt") are really the best resource from where to start your journey with Grunt. I'm writing this post to have a fast and more focused reference in the future.

## Prerequisites

The only prerequisite is to have installed at least the version 0.8.0 of [nodejs](http://nodejs.org/ "Nodejs"). When nodejs is installed, it's possible to install the grunt command line interface via npm:

```bash
$:> npm uninstall -g grunt
# Remove previous global installation of grunt

$:> npm install -g grunt-cli
# Install grunt-cli
```

## Setup the environment

Set up a project, to be ready to work with Grunt, just requires to add two files, `package.json` and `Gruntfile.js`, to the main root of the project itself.

## package.json

The package.json file should contain some data about the project (for example the name, the version etc.), and more important, the list of the Grunt plugins that will be used.

The following is my first package.json file:

```js
{
  "name": "the-next-big-thing",
  "version": "0.1.0",
  "author": "Bruno",
  "devDependencies": {
    "grunt": "~0.4.1",        
    "grunt-contrib-uglify": "~0.2.0",
    "grunt-contrib-concat": "~0.3.0"
    // '~' is a range specifier:
    // it means that the version must be at least
    // as high as the range, and less than
    // the next major revision above the range.
  }
}
```

Before the plugins can be used, it's necessary to install all the plugins which will be used by Grunt. This could be easily achieved by running the `npm install` command in the root folder of the project.

## Gruntfile.js

Gruntfile.js is used to configure or define tasks, and load Grunt plugins.
I write my first Gruntfile starting from this basic structure:

```js
module.exports = function (grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),

    uglify: {
      // uglify task configuration
    }
  });

  // load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks("grunt-contrib-uglify");

  // log something
  grunt.log.write("Hello world!\n");

  // define default task(s).
  grunt.registerTask("default", ["uglify"]);

  // define an alias for common tasks
  // grunt.registerTask("myTasks", ["t1", "t2:child", "t3"]);   

};
```

At this point is already possible to execute Grunt, but this will just produce an error because there are not configuration options specified for the uglify task.

## Task configuration

The following is the basic structure used to configure a task:

```js
uglify: {
  options: {
    banner: ""
  },      
  target_1: {

    /* source file */
    src: ["src/test.js"],

    /* destination file */
    dest: "build/test.min.js"     

  },
  target_2: {

    options: {
      banner: "/* Minified version of doc.js */"
    },

    src: ["src/doc.js"],
    dest: "build/doc.min.js"

  }
}
```

The structure is composed by an `options` property, and by one, or more, target properties.

* options: contains the settings valid at task level.<br/>Task level settings can be overwritten by target level settings.<br/>The available options depends on the specific grunt plugin.

* target(s): allows to run a task with different configuration.<br/>Each task can have more than a target.

## Run Grunt

Execute Grunt is a really straightforward operation; from the root folder of the project type in the shell:

```bash
$:> grunt
# execute grunt
```

In this case all the tasks registered as default will be executed.

It's possible even to execute only specific task or subgroup of tasks; even in this case the syntax is really simple:

```bash
$:> grunt uglify
# execute the uglify task.
# if there are more than a target,
# Grunt will iterate and procell all the targets

$:> grunt uglify:target_1
# execute the uglify task.
# only the specified target will be executed.

$:> grunt myTasks
# execute all the task associated to the myTasks alias.
```

## Conclusive notes

Learning all this was fun, pleasant (thanks to the documentation), and did not require more than a couples of hours: really a great investment, if you consider how time consuming are some repetitive tasks.

Grunt is definitely the way to go... and in the next weeks I will go deeper with its usage.
