FROM node:20.11.1-slim

RUN apt-get update && apt-get install -y tzdata
ENV TZ=Europe/Paris
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /app
COPY package.json ./
RUN yarn

COPY . .

EXPOSE 3000
CMD ["yarn", "prod"]
