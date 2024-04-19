FROM node:lts-bookworm AS builder

WORKDIR /workspace

COPY ./client/web/package.json .

RUN npm i

COPY ./client/web .

RUN npm run build


FROM node:lts-bookworm AS modules

WORKDIR /workspace

COPY ./client/web/package.json ./
COPY ./client/web/package-lock.json ./

RUN npm i --production

FROM python:3.12 AS runner

WORKDIR /app

COPY --from=builder /workspace/build ./build
COPY --from=modules /workspace/node_modules ./node_modules

COPY ./api/requirements.txt .
RUN pip3 install -r requirements.txt

COPY api/src ./src

ENV ENV=production

RUN apt update && apt upgrade -y

CMD uvicorn src.main:app --host 0.0.0.0 --port $PORT
