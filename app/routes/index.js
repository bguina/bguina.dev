const express = require('express');
const cv = require('./cv');

const router = express.Router();

router.get('/', cv);

router.get('/en', (req, res) => {
  res.cookie('locale', 'en');
  res.redirect('/');
});

router.get('/fr', (req, res) => {
  res.cookie('locale', 'fr');
  res.redirect('/');
});

module.exports = router;
