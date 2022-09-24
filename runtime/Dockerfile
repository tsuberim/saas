FROM node:alpine

RUN sudo apk add python3 make g++

ADD package.json package.json
ADD package-lock.json package-lock.json

RUN npm install

ADD . .

ENTRYPOINT [ "npm", "start" ]