---
draft: true
title: "My MacOS setup checklist"
preview: "This is my checklist for new MacOS installations."
date: 2021-02-22T23:36:17+01:00
meta_description: "List of programs, and configuration for new MacOS installations"
categories: ["Tools", "memo"]
changefreq: "yearly"
lastmod: 2021-02-22T23:36:17+01:00
priority: 0.7
layout: post
---

This week I formatted my macbook, and after many years of keeping sparse notes in too many different place I decided it is time to put everything together in one place for future reference... and what best place than my freshly restyled blog.

## General preference

- Dock: don't show recent applications.

- Mission control: set hot corners.

- Trackpad/Mouse: Secondary click, click in bottom right corner.

- Keyboard: Use F1, F2, etc. keys as standard function keys.

## OS settings

- Show hidden files/folders

```txt
defaults write com.apple.finder AppleShowAllFiles -boolean true; killall Finder
```

Recently learned a shortcut - `CMD + Shift + .` - to toggle quickly between two modes.

## Fundamentals

- Firefox (make default browsers)

- 1Password

- XCode

- [VSCode](https://code.visualstudio.com/)

  I usually install `code`command into the PATH directly from vscode.

  Recently had a problem that after exit vscode the command is removed from the PATH.

  To fix this issue:

  `xattr Code.app` check wether vscode is quarantined (app installed from Internet usually are).

  `sudo xattr -r -d com.apple.quarantine Code.app` remove the *quarantine* attribute.

- [Homebrew](https://brew.sh/)

## Terminal

ZSH is now default shell on MacOS.

- [Oh My ZSH!](https://ohmyz.sh/)

## Git

[Git](https://git-scm.com/) is usually already installed on MacOS.

There're a couple of things to have it properly configured.

### Config

```txt
# Committer
git config --global user.name "Bruno Scopelliti"
git config --global user.email "*****"

# Default editor
git config --global core.editor "code --wait"
```

### Alias

In `~/.zshrc` define alias for common commands.

```txt
alias ga="git add"
alias gaa="git add ."
alias gst="git status"
alias gb="git branch"
alias gbd="git branch --delete "
alias gc="git commit"
alias gcm="git commit --message"
alias gco="git checkout"
alias gcob="git checkout -b"
alias gcom="git checkout master"
alias gpl="git pull"
alias gps="git push"
```

### Configure SSH auth

GitHub is moving away from basic authentication.

1. [Generate SSH Key](https://docs.github.com/en/github/authenticating-to-github/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent)

2. [Add the SSH key in GitHub](https://docs.github.com/en/github/authenticating-to-github/adding-a-new-ssh-key-to-your-github-account)


### Configure GPG commit signin

Assure `gnupg` is installed - `brew install gnupg` otherwise.

1. [Generate GPG key](https://docs.github.com/en/github/authenticating-to-github/generating-a-new-gpg-key)

2. [Add GPG key in GitHub](https://docs.github.com/en/github/authenticating-to-github/telling-git-about-your-signing-key)

```txt
git config --global commit.gpgsign true
git config --global gpg.program gpg
git config --global user.signingkey *****
```

Recently I got the `gpg failed to write commit object` error on the first commit; as workaround, create and sign a file.

```txt
touch a.txt
gpg --sign a.txt
```

## Node.js

- [NVM](https://github.com/nvm-sh/nvm), to manage multiple Node.js version.

## Ruby

- [RVM](rvm.io), to manage multuple Ruby version.

## Other apps for software development

- Chrome

- [Postman](https://www.postman.com/)

- GIMP

- [Robo 3T](https://robomongo.org)

- [ImageOptim](https://imageoptim.com/)

## Other apps

- Google Drive

- Spotify

- VLC

- Stud.io, I am out of dark age

- Signal, Telegram, Slack, Whatsapp 😓
