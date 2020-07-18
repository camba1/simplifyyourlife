const os = require("os");
var hostname = os.hostname();

/**
 * Returns rendered page containing the hello world message to the client
 */
const sayHello = (request, response) => {
  let helloWorldMsg = buildHello(hostname);
  response.render('helloworld', {
    title: 'Welcome to DevOps World 2020' ,
    message: helloWorldMsg
  })
}

/**
 * Build the string to be returned to the front end
 */
const buildHello = (myHostname) => { return `Hello world from host: ${myHostname}` }

module.exports = { sayHello,
                   buildHello
                 }
