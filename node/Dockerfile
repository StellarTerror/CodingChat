FROM node:16-alpine AS client-modules
WORKDIR /app

COPY package.json .

RUN npm i

FROM node:16-alpine AS builder
WORKDIR /app

COPY . .
COPY --from=client-modules /app/node_modules ./node_modules

RUN npm run build

FROM node:16-alpine AS server-modules
WORKDIR /app

COPY package.json .

RUN npm i --production

FROM node:16-alpine AS runner

WORKDIR /app

COPY --from=builder /app/build ./build
COPY --from=server-modules /app/node_modules ./node_modules
COPY server.js .

CMD ["node", "server.js"]
