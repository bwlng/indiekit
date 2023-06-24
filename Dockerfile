# Base node image
FROM node:18-bullseye-slim as base

# Install Python
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir /app/
WORKDIR /app/

# Add `/app/node_modules/.bin` to $PATH so `indiekit` and `nodemon` are available on the command line
ENV PATH /app/node_modules/.bin:$PATH

COPY . .

RUN npm install

ENTRYPOINT ["npm", "run"]

# Run `docker-compose up db` to only start the database (helpful for running the web server locally)
# Run `docker-compose -f docker-compose.yml -f docker-compose.dev.yml up` to start the database and web server in dev mode