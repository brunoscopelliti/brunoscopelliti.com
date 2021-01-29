# brunoscopelliti.com

My website (2021 edition).

## Operations

Root directory is `./www`.

Create new post.

```
hugo new blog/my-first-post.md
```

Launch dev server on port 3000.

```
hugo server -D -p 3000
```

Expone the dev webserver on a publicly accessible web domain.

```
ngrok http 3000
```

Build production ready website.

```
hugo
```
