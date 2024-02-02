const express = require('express');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  res.render('index');
});

router.get('/en', (req, res) => {
  req.i18n.setLocale('en');
  res.render('index');
});

router.get('/fr', (req, res) => {
  req.i18n.setLocale('fr');
  res.render('index');
});

module.exports = router;
