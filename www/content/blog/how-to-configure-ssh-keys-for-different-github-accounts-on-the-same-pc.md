---
draft: true
title: "How to configure SSH keys for different GitHub accounts on the same pc"
preview: "Recently I fought - and in at the end succeded - to configure two different set of SSH keys for different GitHub account on the same computer."
date: 2021-02-16T15:19:43+01:00
meta_description: "Configure SSH keys for different GitHub accounts on the same pc"
categories: ["Tools", "git", "memo"]
changefreq: "yearly"
lastmod: 2021-02-16T15:19:43+01:00
priority: 0.7
layout: post
---

1. Create different [SSH key](https://docs.github.com/en/github/authenticating-to-github/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent).

2. Modify the SSH config

```txt
Host github.com
  HostName github.com
  User git
  AddKeysToAgent yes
  UseKeychain yes
  IdentitiesOnly yes
  IdentityFile ~/.ssh/id_ed25519

Host github.com-b
  HostName github.com
  User git
  AddKeysToAgent yes
  UseKeychain yes
  IdentitiesOnly yes
  IdentityFile ~/.ssh/id_ed25519_b
```

3. Open .git/config and update the host, so that it matches the hostname you precedently set in the SSH config.

```
[remote "origin"]
  url = git@github.com-b:<username>/<repo>.git
```