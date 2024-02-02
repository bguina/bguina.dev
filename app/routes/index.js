const express = require('express');
const logger = require('../logger');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  if (!req.cookies.locale) {
    res.cookie('locale', req.acceptsLanguages('fr', 'en') || 'en');
  }
  res.render('index');
});

router.get('/en', (req, res) => {
  res.cookie('locale', 'en');
  res.render('index');
});

router.get('/fr', (req, res) => {
  res.cookie('locale', 'fr');
  res.render('index');
});

module.exports = router;
