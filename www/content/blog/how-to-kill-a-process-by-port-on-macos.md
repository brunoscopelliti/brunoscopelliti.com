---
title: "How to kill a process by port on MacOS"
preview: "A quick memo post for when you need to kill a process, knowing its port."
date: 2021-04-25T15:18:21+01:00
meta_description: "How to kill a process on MacOS, Unix-like"
categories: ["Tools", "memo"]
changefreq: "yearly"
lastmod: 2021-04-25T15:18:21+01:00
priority: 0.7
layout: post
---

Every now and then I find myself in need to kill a process, knowing only the port it's using.

Below you can read the *magic spell* to kill a process in Unix-like system, running on a 
specific port.

```bash
lsof -nti: | xargs kill -9
```

Copy, and replace `<PORT>` with the port number.

## Kill a process programatically

There are numerous npm modules that allow to kill a process programatically;
[fkill](https://www.npmjs.com/package/fkill) is my favorite.
