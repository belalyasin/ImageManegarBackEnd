const http = require('http');
const app = require('./app');


// server
const server = http.createServer(app);
const port = process.env.PORT ||3000;
const serverListen = server.listen(port, () => {
  console.log(`App running on port ${port}`);
});