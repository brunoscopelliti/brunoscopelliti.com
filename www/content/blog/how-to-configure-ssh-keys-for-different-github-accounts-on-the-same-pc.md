---
title: "How to configure SSH keys for different GitHub accounts on the same pc"
preview: "Recently I fought - and at the end succeded - to configure two different set of SSH keys for different GitHub account on the same computer."
date: 2021-04-09T23:26:00+01:00
meta_description: "Configure SSH keys for different GitHub accounts on the same pc"
categories: ["Tools", "git", "memo"]
changefreq: "yearly"
lastmod: 2021-04-09T23:26:00+01:00
priority: 0.7
layout: post
---

Recently I fought - and at the end succeded - to configure two different set of SSH keys
for different GitHub accounts on the same computer.
<br/>
I'm writing it down the procedure, so that I won't have to repeat this fight again.

1. Create two different SSH keys, and add both on GitHub.
  <br/>The [documentation on GitHub](https://docs.github.com/en/github/authenticating-to-github/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent) explains the details.

2. SSH config
  <br/>The SSH key config file is usually located at `~/.ssh/config`. Open it with your editor
  of choice and paste the text below.
  <br/>Note how `HostName` is in both case *github.com*,  but `Host`, and `IdentityFile` are different.

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

3. Finally, for each repository for which you want to use the key `id_ed25519_b`,
open its `.git/config` file and configure the remote, so that it matches the host
precedently set in the SSH config file.
<br/>
This last step is not needed when you clone directly from `git@github.com-b:<username>/<repo>.git`.

```txt
[remote "origin"]
  url = git@github.com-b:<username>/<repo>.git
```
