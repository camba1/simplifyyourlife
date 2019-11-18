FROM node
WORKDIR /code

COPY package.json /code
RUN npm install mysql2
RUN npm install express
RUN npm install pug
RUN npm install chai
RUN npm install chai-http
RUN npm install mocha
RUN npm install mocha-junit-reporter

COPY . /code

RUN npm install


EXPOSE 3000
CMD ["npm","start"]
