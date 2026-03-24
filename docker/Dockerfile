# allow control node.js version from command line
ARG NODE_VERSION=24
FROM node:${NODE_VERSION}-alpine3.23.3 as base
  # cache bust to make sure the next step is running
  # modify this if you found docker image caching
  # make OS level software not up to date
LABEL cache_burst_date=2026-03-09
  # force latest security fix
RUN apk update && apk upgrade
  # we already have yarn so don't really need to keep npm
RUN npm uninstall -g npm
WORKDIR /app

  #---------------------
FROM base as base-deps
  # private NPM token only appears in a middle stage image
  # and doesn't appear in the final image
ARG NPM_TOKEN
RUN echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > $HOME/.npmrc
COPY package.json yarn.lock ./
  # only package.json's dependency is install as this stage
RUN yarn install --frozen-lockfile --production

  #---------------------
FROM base-deps as builder
  # install missing devDependencies,
  # base-deps already have some yarn's cache so this should be fast
RUN yarn run --frozen-lockfile
COPY . .
RUN yarn build

  #---------------------
FROM base
COPY --from=base-deps app/node_modules node_modules
COPY --from=builder app/build build
RUN adduser -u 1002 -D -h /nodeuser nodeuser && \
chown -R nodeuser ./ && \
chmod -R u=rwX,go= ./
USER nodeuser WORKDIR /app
ENV NODE_ENV=production
PORT=3003
EXPOSE 3003
CMD ["node", "build/index"]