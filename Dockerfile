FROM node:20-slim as builder

WORKDIR /app
COPY package*.json ./
RUN npm i

COPY . .
RUN npm run build

FROM node:20-slim

WORKDIR /app
COPY --from=builder /app/dist /app
COPY package*.json ./
RUN npm i

CMD [ "node", "index.js" ]