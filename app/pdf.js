const Puppeteer = require('puppeteer');

async function buildPdf(url, outputFile) {
  const browser = await Puppeteer.launch({
    headless: 'new',
    ignoreHTTPSErrors: true,
    args: [
      '--no-sandbox',
      '--disable-audio-output',
    ],
  });

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle0' });

  const margin = '2.5cm';
  await page.pdf({
    path: outputFile,
    format: 'A4',
    border: 0,
    scale: 0.8,
    margin: {
      top: margin,
      right: margin,
      bottom: margin,
      left: margin,
    },
  });
  await browser.close();
}

module.exports = {
  buildPdf,
};
