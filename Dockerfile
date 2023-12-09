FROM node:20-slim

WORKDIR /app
COPY package.json ./
RUN npm i

COPY . .

CMD ["node", "index.js"]