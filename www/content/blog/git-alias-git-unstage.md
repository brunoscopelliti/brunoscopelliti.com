---
title: "Git alias: git unstage"
aliases:
  - /git-alias-git-unstage
preview: "One of the hidden gems of git is the possibility for the developer to define their own alias for common commands."
date: 2017-05-05T09:00:00+01:00
meta_description: "How to configure git alias"
categories: "git"
layout: "post"
changefreq: "yearly"
lastmod: 2021-01-01T09:00:00+01:00
priority: 0.7
---

Git, between the others, has a powerful feature called *alias*.

It's pretty straightforward...
Is there a command you always fail to remember? Add a more friendly shortcut! Is there a command you use frequently, that requires too much keystrokes? Create a shorter alias for it... or perhaps, you think that a fundamental command is missing from git? Then you can create it yourself using existing commands.

My favourite alias is `git unstage`.

```bash
git config --global alias.unstage "reset HEAD --"
```

It permits to remove one, or more files from the staging area.

```bash
git unstage path/to/file.png
```

It's equivalent to:

```bash
git reset HEAD -- path/to/file.png
```

As you can see there's not a great saving in terms of keystrokes, but, at least form me, it is so much more easy to remember.

*I think, the first place where I read of this trick is [Pro Git](https://git-scm.com/book/en/v2) book, by by Scott Chacon and Ben Straub.*

## A last tip

If you start setting lots of aliases, chances are that you need to review them from time to time.

The following command prints the aliases you've set so far.

```bash
git config --list | grep alias
```

As always, it can be combined with configuration access modifiers, `--system`, `--global`, and `--local`, to specify the configuration file from which read the aliases.
