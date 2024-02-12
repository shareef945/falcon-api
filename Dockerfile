FROM node:17-alpine

WORKDIR /src

COPY package.json ./

RUN npm install

COPY . .

CMD [ "npm", "run", "start" ]