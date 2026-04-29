# allow control node.js version from command line
ARG NODE_VERSION=24
FROM node:${NODE_VERSION}-alpine AS base
  # cache bust to make sure the next step is running
  # modify this if you found docker image caching
  # make OS level software not up to date
LABEL cache_burst_date=2026-03-09
  # force latest security fix
RUN apk update && apk upgrade
  # we already have yarn so don't really need to keep npm
RUN npm uninstall -g npm
WORKDIR /app
ENV PATH=/app/node_modules/.bin:$PATH

  #---------------------
FROM base AS deps

COPY package.json yarn.lock ./
# Install everything including devdependencies
RUN yarn install --frozen-lockfile

  #---------------------
FROM deps AS builder

COPY . .
RUN yarn build

  #---------------------
FROM base AS base-deps
  # private NPM token only appears in a middle stage image
  # and doesn't appear in the final image
ARG NPM_TOKEN
COPY package.json yarn.lock ./
# We installeren HIER alleen de runtime dependencies voor de uiteindelijke image
RUN echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > /root/.npmrc && \
    yarn install --frozen-lockfile --production && \
    rm /root/.npmrc

  #---------------------
FROM base
COPY --from=base-deps /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
RUN adduser -u 1002 -D -h /home/nodeuser nodeuser && \
    chown -R nodeuser:nodeuser /app && \
    chmod -R u=rwX,go=rX /app

USER nodeuser
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3003
EXPOSE 3003

CMD ["node", "build/index.js"]