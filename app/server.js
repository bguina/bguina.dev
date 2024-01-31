#!/usr/bin/env node

/**
 * Module dependencies.
 */
var app = require('./app');
var debug = require('debug')('bgcv:server');
var fs = require('fs');

/**
 * Create server.
 */
var server;
var protocol;
if (fs.existsSync("certs/privkey.pem")) {
  protocol = 'https';
  var port = normalizePort(process.env.PORT || '443');
  app.set('port', port);

  debug('starting with HTTPS');
  var https = require('https');
  var server = https.createServer({
    key: fs.readFileSync("certs/privkey.pem"),
    cert: fs.readFileSync("certs/fullchain.pem")
  }, app);
  server.listen(port);
} else {
  protocol = 'http';
  var port = normalizePort(process.env.PORT || '8080');
  app.set('port', port);

  debug('starting without HTTPS');
  var http = require('http');
  var server = http.createServer(app);
  server.listen(port);
}

/**
 * Listen on provided port, on all network interfaces.
 */

debug('listening on ' + port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

/**
 * PDF generator
 */

const Puppeteer = require('puppeteer');

async function buildPdf(url, outputFile) {
  const browser = await Puppeteer.launch({
    headless: "new",
    args: [
      '--no-sandbox',
      '--disable-audio-output'
    ],
  });

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle0' });

  var margin = '2.5cm';
  await page.pdf({
    path: outputFile,
    format: 'A4',
    border: 0,
    scale: .8,
    margin: {
      top: margin,
      right: margin,
      bottom: margin,
      left: margin,
    },
  });
  await browser.close();
};

var baseUrl = protocol + "://localhost:" + app.get('port')
buildPdf(baseUrl + "/en", "resources/public/pdf/bguina.dev-en.pdf");
buildPdf(baseUrl + "/fr", "resources/public/pdf/bguina.dev-fr.pdf");

console.log("serving "+baseUrl);
