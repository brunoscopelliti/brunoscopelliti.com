---
title: "Squash commits with git rebase"
aliases:
  - /squash-commits-with-git-rebase
preview: "Until recently I watched at those people able to squash git commits as magicians. I've probably overestimated them a bit, and now that I've finally learned the trick, I want to celebrate, and share the process with this post."
date: 2017-01-23T09:00:00+01:00
meta_description: "git rebase, how to forge git history to your wants"
categories: ["Tools", "git", "memo"]
layout: "post"
changefreq: "yearly"
lastmod: 2021-01-01T09:00:00+01:00
priority: 0.7
---

That's one thing I've just recently learned, and I'm writing down here for future reference.

Git's `rebase` command permits to change the history of a git repository.
<br/>
Note that this is safe to do only for commits that haven't already been shared
to the team you are working with.

## Why is it useful?

Consider the following scenario:

```bash
bruno ~/git/hello-git
$ git hist
# git hist is a custom alias for "git log --pretty=format:'%h %ad | %s%d [%an]' --graph --date=short"
* 8a3a015 2016-10-26 | The most perfect commit in the history of the Universe (HEAD -> master) [brunoscopelliti]
* a48ca6d 2016-10-26 | Init repo [brunoscopelliti]
```

I'm so proud of myself... I've just pushed the best commit in the whole history of the Universe!

I should absolutely show someone else my greatness, so it's time for a code review...
and it turns out that the commit was not so perfect as I thought. 
However the fix is easy, and so we arrive here:

```bash
bruno ~/git/hello-git
$ git hist
* bd2b8f4 2016-10-26 | Ops, I've forgot something... Fixed now (HEAD -> master) [brunoscopelliti]
* 8a3a015 2016-10-26 | The most perfect commit in the history of the Universe [brunoscopelliti]
* a48ca6d 2016-10-26 | Init repo [brunoscopelliti]
```

It works, but the history is a bit messy, and going down this path, it won't get better!

Git gives the option to squash two, or more commits into a single one using the `rebase` command.

## How to squash commits?

Let's try to squash those commits into a single one.

```bash
bruno ~/git/hello-git
$ git rebase -i HEAD~2
```

This cause your default Git editor - on my macbook pro, it is *nano* - to show up
with the following content:

```bash
pick 5e170e0 The most perfect commit in the history of the Universe
pick bd2b8f4 Ops, I've forgot something... Fixed now
# Rebase a48ca6d..bd2b8f4 onto a48ca6d (2 commands)
#
# Commands:
# p, pick = use commit
# r, reword = use commit, but edit the commit message
# e, edit = use commit, but stop for amending
# s, squash = use commit, but meld into previous commit
# f, fixup = like "squash", but discard this commit log message
# x, exec = run command (the rest of the line) using shell
# d, drop = remove commit
#
# These lines can be re-ordered; they are executed from top to bottom.
#
# If you remove a line here THAT COMMIT WILL BE LOST.
#
# However, if you remove everything, the rebase will be aborted.
#
# Note that empty commits are commented out
```

We're seeing only the last two commits cause I expressly requested to rebase only
the last two (remember the `HEAD~2`).

The comments make pretty clear how to proceed; so I change the content.

```bash
pick 5e170e0 The most perfect commit in the history of the Universe
squash bd2b8f4 Ops, I've forgot something... Fixed now
```

Save, exit. Git will give you a reassuring successfull message at the end of the process.

```bash
bruno ~/git/hello-git
$ git rebase -i HEAD~2
[detached HEAD 7c442c5] The most perfect commit in the history of the Universe
 Date: Wed Oct 26 18:31:15 2016 +0200
 1 file changed, 10 insertions(+), 1 deletion(-)
Successfully rebased and updated refs/heads/master.
```

However let's check.

```bash
bruno ~/git/hello-git
$ git hist
* 7c442c5 2016-10-26 | The most perfect commit in the history of the Universe (HEAD -> master) [brunoscopelliti]
* a48ca6d 2016-10-26 | Init repo [brunoscopelliti]
```

You may have noted that in the process the hash of the commit with the message
*The most perfect commit in the history of the Universe* has changed.
That's because this process actually generates brand new commits with completely
different IDs than the old commits, and leaves the old commits where they were.

```bash
bruno ~/git/hello-git
$ git cat-file -t bd2b8f4
commit
```

## Common pitfalls

It's not possible to squash a commit without a previous commit. So if you try this one

```bash
squash 5e170e0 The most perfect commit in the history of the Universe

pick bd2b8f4 Ops, I've forgot something... Fixed now
```

Git will throw an error at you.

```bash
bruno ~/git/hello-git
$ git rebase -i HEAD~2
error: Cannot 'squash' without a previous commit
You can fix this with 'git rebase --edit-todo' and then run 'git rebase --continue'.
Or you can abort the rebase with 'git rebase --abort'.
```

However Git is also so kind that suggest how to solve the issue:
<br/>`git rebase --edit-todo` will reopen the editor and give you a chance to review,
then `git rebase --continue` will restart the rebase process.
