var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
  res.render('index', {
    pdf: req.query.pdf,
  })
});

router.get('/fr', function (req, res) {
  res.cookie('locale', 'fr');
  res.redirect('/')
});

router.get('/en', function (req, res) {
  res.cookie('locale', 'en');
  res.redirect('/')
}); 


module.exports = router;
