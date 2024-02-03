const express = require('express');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  if (!req.cookies.locale) {
    res.cookie('locale', req.acceptsLanguages('fr', 'en') || 'en');
  }
  res.render('cv/index');
});

router.get('/en', (req, res) => {
  res.cookie('locale', 'en');
  res.redirect('/');
});

router.get('/fr', (req, res) => {
  res.cookie('locale', 'fr');
  res.redirect('/');
});

module.exports = router;
