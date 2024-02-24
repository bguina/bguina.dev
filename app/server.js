#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const http = require('http');
const app = require('./app');
const logger = require('./logger');
const pdf = require('./pdf');

const port = process.env.PORT || 8080;

http
  .createServer(app)
  .listen(port)
  .on('listening', () => {
    const baseUrl = `http://localhost:${port}`;
    logger.info(`Listening on ${baseUrl}`);

    const pdfDir = path.join(__dirname, 'resources', 'public', 'pdf');

    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }

    pdf.buildPdf(`${baseUrl}/en`, path.join(pdfDir, 'bguina.dev-en.pdf'));
    pdf.buildPdf(`${baseUrl}/fr`, path.join(pdfDir, 'bguina.dev-fr.pdf'));
  });
