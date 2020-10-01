# pull official base image
FROM node:10-slim

WORKDIR /app

# install parcel
RUN yarn global add parcel-bundler
RUN yarn global add tailwindcss

# install app dependencies
COPY package.json ./
RUN yarn install

# add app
COPY . ./


# Windows steps:
# Step 1: from host to container
# docker cp . oneclick:app/

# Step 2: build in container
# yarn build

# Step 3: from container to host
# docker cp oneclick:app/dist .