FROM node:18-alpine
#Create a working directory for the react app, where we'll store all of the react app files
WORKDIR /app

COPY package.json .

RUN npm install

COPY . .


EXPOSE 3000

CMD [ "npm", "start" ]


