---
title: "Notes on “Docker for Note.js Projects …”"
preview: "This post collects my notes while following “Docker for Note.js Projects from a Docker Captain” course, by Bret Fisher on Udemy."
date: 2023-02-25T07:00:00+01:00
meta_description: "My notes on Udemy Course: “Docker for Note.js Projects from a Docker Captain”"
categories: ["memo", "docker", "node.js"]
changefreq: "yearly"
lastmod: 2023-02-25T07:00:00+01:00
priority: 0.7
layout: post
---

Reference to the course: [Docker for Note.js Projects from a Docker Captain](https://www.udemy.com/course/docker-mastery-for-nodejs/)

I will update this post while continuing advance through the course.<br/>
Last updated: 25 February 2023.

## Docker Compose basics

Docker Compose is made of two things: the **Compose CLI**, and **Compose file**.

[Docker Compose CLI](https://www.udemy.com/course/docker-mastery-for-nodejs/learn/lecture/12624156) is mostly a substitute for Docker CLI.<br/>
It is most useful in development environment.

Docker Compose file is usually named _docker-compose.yml_:

```docker
services:
    web:
        image: sample-01
        build: .
        ports:
            - "3000:3000"
```

A service in this context is a container based on a single image.

### Tips

Get inside the container, and inspect things from inside it.

```bash
docker compose exec <service name> sh
```

## Node Dockerfile best practice basics

- Prefer `COPY`, over `ADD`.
  `ADD` is much more powerfull, but to put something inside our image `COPY` is usually enough.

- `npm config list && npm ci`
  Print debug info about node/npm environment before installing node dependencies.

- `npm ci && npm cache clean --force`
  Always clear cache after installing dependencies, in order to reduce image size.

- `CMD node`, not `npm`.

- Use `WORKDIR`, not `RUN mkdir`.

- Add node_modules/.bin to PATH

```docker
# Dockerfile
ENV PATH=/path/to/node_modules/.bin:$PATH
```

### Base Images

Alpine is small, and security focused.
Debian/Ubuntu are small now too (~100MB space savings isn't significant).

### Non-root user

Official node image comes already with a predefined _node_ user.
Change user from root to node:

```docker
USER node
```

## Multi-stage Dockerfile

It solves one, major complexity as your complexity grows in your Dockerfiles.
That is, how do we take a single Dockerfile, with a single FROM, and single CMD. How do we use that in all the different places.

[Lecture reference](https://www.udemy.com/course/docker-mastery-for-nodejs/learn/lecture/13325066)

```docker
FROM node:10-slim as prod
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production \
    && npm cache clean --force
COPY . .
CMD ["node", "./bin/www"]

FROM prod as dev
ENV NODE_ENV=development
RUN npm install --only=development
CMD ["node_modules/nodemon/bin/nodemon.js",  "./bin/www", "--inspect=0.0.0.0:9229"]

FROM dev as test
ENV NODE_ENV=development
CMD ["npm", "test"]
```

Note: this example uses `npm install`, but it would be better to use `npm ci` ([ref](https://docs.npmjs.com/cli/v9/commands/npm-ci)) that strictly respects the dependencies version listed in the lock file.
`npm ci` uses the `NODE_ENV` variable to determine whether it should install dev dependencies.

In `docker-compose.yml`, use `target` to target a specific stage; eg.

```docker
services:
  my-service:
    build:
      context: .
      target: dev

    ...
```

A more complex example:

```docker
## Stage 1 (production base)
# This gets our prod dependencies installed and out of the way
FROM node:10-alpine as base

EXPOSE 3000

ENV NODE_ENV=production

WORKDIR /opt

COPY package*.json ./

# we use npm ci here so only the package-lock.json file is used
RUN npm config list \
    && npm ci \
    && npm cache clean --force


## Stage 2 (development)
# we don't COPY in this stage because for dev you'll bind-mount anyway
# this saves time when building locally for dev via docker-compose
FROM base as dev

ENV NODE_ENV=development

ENV PATH=/opt/node_modules/.bin:$PATH

WORKDIR /opt

RUN npm install --only=development

WORKDIR /opt/app

CMD ["nodemon", "./bin/www", "--inspect=0.0.0.0:9229"]


## Stage 3 (copy in source)
# This gets our source code into builder for use in next two stages
# It gets its own stage so we don't have to copy twice
# this stage starts from the first one and skips the last two
FROM base as source

WORKDIR /opt/app

COPY . .


## Stage 4 (testing)
# use this in automated CI
# it has prod and dev npm dependencies
# In 18.09 or older builder, this will always run
# In BuildKit, this will be skipped by default
FROM source as test

ENV NODE_ENV=development
ENV PATH=/opt/node_modules/.bin:$PATH

# this copies all dependencies (prod+dev)
COPY --from=dev /opt/node_modules /opt/node_modules

# run linters as part of build
# be sure they are installed with devDependencies
RUN eslint .

# run unit tests as part of build
RUN npm test

# run integration testing with docker-compose later
CMD ["npm", "run", "int-test"]


## Stage 5 (default, production)
# this will run by default if you don't include a target
# it has prod-only dependencies
# In BuildKit, this is skipped for dev and test stages
FROM source as prod

CMD ["node", "./bin/www"]
```

## The Twelve-Factor App

[Reference](https://12factor.net/).

## .dockerignore

Prevent bloat and unneeded files in the image.

```docker
.DS_Store
.git/
node_modules/
npm-debug
docker-compose*.yml
```

## Docker Compose

### Bind-Mounting Code

- Don't use host file paths
- Don't bind mount databases

```docker
# same as
# docker container run -p 80:4000 -v $(pwd):/site bretfisher/jekyll-serve

services:
  jekyll:
    image: bretfisher/jekyll-serve
  volumes:
    - .:/site
  ports:
    - "80:4000"
```

Run with: `docker compose up`.

### Node Modules in Bind-Mounts

When we bind mount our source in Docker we end up with node_modules from host inside the container. This is not desiderable, especially on MacOS/Windows cause it's a different architecture than Linux.

There are two ways to avoid this:

#### Solution 1

Never use `npm i` on host, run `npm i` in compose.

Then when there's the bind mount to your host, it will then put those Node modules on the host OS.

```bash
# Run install command within the container
# 'express' is the service name from the compose file
docker compose run express npm install
```

This means that you can't do Node development natively on your host anymore because those Node modules are designed for Linux.

#### Solution 2

Move node_modules in image, hide node_modules from host.

- Dockerfile:

```docker
FROM node:10.15-slim

ENV NODE_ENV=production

WORKDIR /node

COPY package.json package-lock*.json ./

RUN npm install && npm cache clean --force

WORKDIR /node/app

COPY . .

CMD ["node", "./bin/www"]
```

node_modules will be installed in `/node` folder, the source will be in `/node/app`

- docker-compose.yml

```docker
version: '2.4'

services:
  express:
    build: .
    ports:
      - 3000:3000
    volumes:
      - .:/node/app
      - /node/app/node_modules # make the node_modules directory empty
    environment:
      - DEBUG=sample-express:*
```

### Run various tools inside the container

- run

```bash
# Start a new container and run command/shell
docker compose run <service> bash
docker compose run <service> npm install
```

- exec

```bash
# Run additional command/shell in a currently running container
docker compose exec <service> bash
docker compose exec <service> npm install
```

### Node Auto Restarts

- Override startup command from docker-compose.yml
- Use [nodemon](https://www.npmjs.com/package/nodemon)

```docker
version: '2.4'

services:
  express:
    build: .
    command: /app/node_modules/.bin/nodemon ./bin/www
    ports:
      - 3000:3000
    volumes:
      - .:/node/app
      - /node/app/node_modules # make the node_modules directory empty
    environment:
      - DEBUG=sample-express:*
      - NODE_ENV=development
```

### Startup Order and Dependencies

Multi-container apps need:

- Dependency awareness, `depends_on`
- Name resolution (DNS)
- Connection failure handling, `restart: on-failure`

`depends_on` allow to have an healthcheck.

```docker
version: '2.4'

services:

  frontend:
    image: nginx
    depends_on:
      api:
        # this requires a compose file version => 2.3 and < 3.0,
        # and to define a healthcheck test for the `api` service
        condition: service_healthy

  api:
    image: node:alpine
    healthcheck:
      test: curl -f http://127.0.0.1
```
