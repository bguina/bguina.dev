# syntax=docker/dockerfile:1

ARG NODE_VERSION=21.6.0

FROM node:${NODE_VERSION}-alpine

RUN apk add --no-cache \
    msttcorefonts-installer font-noto fontconfig \
    freetype ttf-dejavu ttf-droid ttf-freefont ttf-liberation \
    chromium \
  && rm -rf /var/cache/apk/* /tmp/*

RUN update-ms-fonts && fc-cache -f

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Use production node environment by default.
ENV NODE_ENV production
ENV PORT 8080

WORKDIR /usr/src/bgcv

# Install Python, required for yarn dependencies
RUN apk add --update --no-cache python3 build-base gcc && ln -sf /usr/bin/python3 /usr/bin/python

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a bind mounts to package.json and yarn.lock to avoid having to copy them into this layer.
# Leverage a cache mount to /root/.yarn to speed up subsequent builds.
RUN \
    --mount=type=bind,source=.yarnrc,target=.yarnrc \
    --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=yarn.lock,target=yarn.lock \
    --mount=type=bind,source=app/resources/.yarnrc,target=app/resources/.yarnrc \
    --mount=type=bind,source=app/resources/package.json,target=app/resources/package.json \
    --mount=type=bind,source=app/resources/yarn.lock,target=app/resources/yarn.lock \
    --mount=type=cache,target=/root/.yarn \
    yarn install --immutable --immutable-cache --check-cache

# Run the application as a non-root user.
USER node

COPY . .

EXPOSE 8080
CMD npm start
