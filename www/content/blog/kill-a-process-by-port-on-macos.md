---
draft: true
title: "Kill a process by port on MacOS"
preview: ""
date: 2021-02-25T15:28:21+01:00
meta_description: ""
categories: ""
changefreq: "yearly"
lastmod: 2021-02-25T15:28:21+01:00
priority: 0.7
layout: post
---

Kill a Process by Port on MacOS

```bash
lsof -nti:<PORT> | xargs kill -9
```

https://ss64.com/osx/lsof.html