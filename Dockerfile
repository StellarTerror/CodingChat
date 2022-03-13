FROM node:16-alpine AS builder

WORKDIR /workspace

COPY ./client/web/package.json .

RUN npm i

COPY ./client/web .

RUN npm run build


FROM node:16-alpine AS modules

WORKDIR /workspace

COPY ./client/web/package.json .

RUN npm i --production

FROM python:3.10 AS runner

WORKDIR /app

COPY --from=builder /workspace/build ./build
COPY --from=modules /workspace/node_modules ./node_modules

COPY ./api/requirements.txt .
RUN pip3 install -r requirements.txt

COPY api/src ./src

ENV ENV=production
CMD uvicorn src.main:app --host 0.0.0.0 --port $PORT
