#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const app = require('./app');
const logger = require('./logger');
const pdf = require('./pdf');
const env = require('./env');

let protocol = 'http';
const port = process.env.PORT || 8080;
let options = {};

if (env.isProduction) {
  protocol = 'https';
  options = {
    key: fs.readFileSync(path.join(__dirname, 'certs', 'privkey.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'certs', 'fullchain.pem')),
  };
}

require(protocol) // eslint-disable-line import/no-dynamic-require
  .createServer(options, app)
  .listen(port)
  .on('listening', () => {
    const baseUrl = `${protocol}://localhost:${port}`;
    logger.info(`Listening on ${baseUrl}`);

    const pdfDir = path.join(__dirname, 'resources', 'public', 'pdf');

    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }

    pdf.buildPdf(`${baseUrl}/en`, path.join(pdfDir, 'bguina.dev-en.pdf'));
    pdf.buildPdf(`${baseUrl}/fr`, path.join(pdfDir, 'bguina.dev-fr.pdf'));
  });
