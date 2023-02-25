---
title: "Notes on “Docker Mastery: ..”"
preview: "This post collects my notes while following “Docker Mastery: with Kubernetes +Swarm from a Docker Captain” course, by Bret Fisher on Udemy."
date: 2023-02-25T07:00:00+01:00
meta_description: "My notes on Udemy Course: 'Docker Mastery: with Kubernetes +Swarm from a Docker Captain'"
categories: ["memo", "docker"]
changefreq: "yearly"
lastmod: 2023-02-25T07:00:00+01:00
priority: 0.7
layout: post
---

Reference to the course: [Docker Mastery: with Kubernetes +Swarm from a Docker Captain](https://www.udemy.com/course/docker-mastery/)

I will update this post while continuing advance through the course.<br/>
Last updated: 25 February 2023.

## Image vs Container

- An Image is the application we want to run.
- A Container is an instance of that image running as a process.

We can have many containers running off the same image.

## Containers

### Run a container

```bash
docker container run --publish 80:80 --name my_server nginx
```

- `--publish` (short `-p`): Publish port 80 on local machines, and sends all traffic from it, to program running in container on port 80.

- `--name`: Set a name for the container; if not specificed a random name is generated and used.

### Run a container detached mode

```bash
docker container run --p 80:80 --detach nginx
```

- `--detach` (short `-d`): Run detached from CLI.

### List all containers

```bash
docker container ls -a
```

### Check logs for running container

```bash
docker container logs <container name>
```

### Run command from within container

```bash
docker container exec -it <container name> <command>
```

### Stop running container

```bash
docker container stop <container id>
```

### Delete container

```bash
docker container rm <container id> -f
```

- `-f`: Needed to delete a running container.

## Docker Networks

Relevant lectures:

- [Intro](https://www.udemy.com/course/docker-mastery/learn/lecture/6758364)
- [CLI Management](https://www.udemy.com/course/docker-mastery/learn/lecture/6762268)
- [How Containers find each other](https://www.udemy.com/course/docker-mastery/learn/lecture/6762270)

```bash
docker network create my_net
```

Create a new Docker network with the default bridge driver.

## Images

It's the application binaries and dependencies for your app and the metadata on how to run it.

Inside the image, there's not actually a complete OS. There's no kernel.
There's no kernel modules like drivers.
That's one of the distinct characteristics around containers that makes it different from a virtual machine; it's not booting up a full operating system.

### Pushing an Image to Docker Hub

Image don't have a name.

```bash
docker login
docker image push <image>:<tag>
```

### Dockerfile Basics

[Dockerfile reference](https://docs.docker.com/engine/reference/builder/)

```bash
docker image build --tag <name>:<tag> .
```

- `--tag` (short `-t`): Name and optionally a tag in the 'name:tag' format

## Volumes & Bind Mounts

Containers are usually immutable and ephemeral.
Docker has two solutions to persist data, known as **data volumes** and **bind mounts**.

- Data Volumes are a configuration option for a container that creates a special location outside of that container's union file system to store unique data. This preserves it across container removals and allows us to attach it to whatever container we want. The container just sees it like a local file path.

- Bind Mounts allows sharing or mounting a host directory, or file, into a container. Again, it will just look like a local file path, or a directory path, to the container.

### Data Volumes

`VOLUME` in Dockerfile.

```docker
VOLUME /var/lib/mysql
```

Any data we put here from the container, will outlive the container.

### Create named volume

```bash
docker container run -d --name mysql --volume my_db:/var/lib/mysql mysql
```

- `--volume` (short `-v`): Bind mount a named volume, at given location.

### View existing volumes

```bash
docker volume ls
```

### Bind Mounts

We can still user `-v` to create Bind Mounts, altough `--mounts` option exists ([see differences](https://docs.docker.com/storage/bind-mounts/#choose-the--v-or---mount-flag)).

```bash
docker container run -d --name ngnix -p 80:80 -v $(pwd):/usr/share/nginx/html nginx
```

We can use Bind Mounts to quickly edit code running in a container.

## Docker Compose

Allow to save Docker container run settings in a file, `docker-compose.yml`.

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

### Build image

Compose can also build custom images.

```docker
services:
  proxy:
    build:
      context: .
      dockerfile: nginx.Dockerfile
    image: my_nginx
    ports:
      - '80:80'
  web:
    image: httpd
    volumes:
      - ./html:/usr/local/apache2/htdocs/
```
