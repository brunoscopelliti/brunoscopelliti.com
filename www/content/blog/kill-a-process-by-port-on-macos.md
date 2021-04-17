---
draft: true
title: "Kill a process by port on MacOS"
preview: ""
date: 2021-02-25T15:28:21+01:00
meta_description: ""
categories: ["Tools", "memo"]
changefreq: "yearly"
lastmod: 2021-02-25T15:28:21+01:00
priority: 0.7
layout: post
---

Kill a process by port on MacOS

```bash
lsof -nti:<PORT> | xargs kill -9
```

https://ss64.com/osx/lsof.html


There're also various npm module, in particular

[fkill-cli](https://www.npmjs.com/package/fkill-cli)

claims to work cross platform

```bash
npx fkill-cli :3000
```