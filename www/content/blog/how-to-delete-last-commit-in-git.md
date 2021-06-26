---
title: "How to delete last commit in git"
preview: "I always struggle to remember how to delete last commit in git."
date: 2021-06-26T15:12:42+01:00
meta_description: "Delete last commit git"
categories: ["Tools", "git", "memo"]
changefreq: "yearly"
lastmod: 2021-06-26T15:12:42+01:00
priority: 0.7
layout: post
---

I always struggle to remember how to delete last commit in git - not that I've to do it often btw 😝

The [git reset](https://git-scm.com/docs/git-reset) command permits to reset current HEAD to the
specified state.\
We can use the syntax `HEAD~1` to specify the desired state; it means one commit back from 
current `HEAD`.\
Putting everything together:

```bash
git reset --soft HEAD~1
```

The `--soft` flag assures the changes are preserved in the working copy.\
If this is not what you want - better be sure this is the case - replace `--soft` with `--hard`.

```bash
git reset --hard HEAD~1
```

Looking forward deleting my next commit - or maybe not.