---
draft: true
title: "Add external link"
date: 2021-01-18T17:44:31+01:00
meta_description: ""
categories: ["Meta", "Hugo"]
layout: "post"
changefreq: "yearly"
lastmod: 2021-01-01T09:00:00+01:00
priority: 0.7
---

To have an external link in the menu, in `config.toml` add something like below:

```toml
[[menu.main]]
  name = "GitHub"
  identifier = "GitHub"
  url = "http://github.com/"
  weight = 100
```
