---
title: "How to cherry-pick a branch using git"
preview: "In this post I put together a couple of git commands to cherry-pick all commits from a given branch."
date: 2021-10-24T07:31:35+01:00
meta_description: "How to git cherry-pick a branch"
categories: ["Tools", "git", "memo"]
layout: "post"
changefreq: "yearly"
lastmod: 2021-10-13T22:10:45+01:00
priority: 0.7
---

Git has a command called [cherry-pick](https://git-scm.com/docs/git-cherry-pick), it permits to *copy* an existing commit to a different branch - it's very useful.

Lately, I needed to cherry-pick all the commits existing on a certain branch - merging or rebasing the branch was not an option.\
Surprisingly, this use case is not supported.

It is possible to cherry-pick a range of commits, though.

```bash
git cherry-pick start..end
```

So we can split the problem into smaller pieces.

## Find the first commit of a branch

Here, I am assuming the branch started from `master`, but it works with other branches as well.

```bash
git merge-base master <branch>
```

## Find last commit of a branch

In this case, `git log` does already a pretty good job:

```bash
git log -n 1 <branch> --pretty=format:"%H"
```

## Put it all together

Once we now the first, and last commit of the branch, we can use cherry-pick to re-apply all the commits in this range.

```bash
git cherry-pick $(git merge-base master <branch>)..$(git log -n 1 <branch> --pretty=format:"%H")
```
