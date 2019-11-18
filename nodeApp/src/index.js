'use strict';

const express = require('express');
const mySqldb = require('./mySqlData');
const helloWorld = require('./helloworld');

//DEMO code....do not do this at home folks!
// Constants
const PORT = 3000;
const HOST = '0.0.0.0';

// App returns pre-rendeered pages to client
const app = express();
app.set('view engine', 'pug');
app.use(express.static('public'))

//root page calls helloWorld module
app.get('/', (req, res) => {
  helloWorld.sayHello(req, res)
});

//mySQL page calls mysqldb module
app.get('/mysql', (req, res) => {
   mySqldb.getMySqlData(req, res)
  }
);

//Add a conditional start so that we can run our http tests and it does
// not try to start the server twice
if(!module.parent) {
  app.listen(PORT, HOST);
}
console.log(`Running on http://${HOST}:${PORT}`);

 module.exports = app;
