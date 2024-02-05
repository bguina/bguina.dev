const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const i18n = require('i18n-2');
const env = require('./env');

const app = express();

const resourcesDir = path.join(__dirname, 'resources');

app.use(favicon(path.join(resourcesDir, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

i18n.expressBind(app, {
  locales: [
    'en',
    'fr',
  ],
  defaultLocale: 'en',
  directory: path.join(resourcesDir, 'locales'),
  extension: '.json',
  cookieName: 'locale',
  indent: ' ',
});

app.use((req, res, next) => {
  req.i18n.setLocaleFromCookie();
  if (!req.cookies.locale) {
    res.cookie('locale', req.acceptsLanguages('fr', 'en') || 'en');
  }
  next();
});

if (env.isDevelopment) {
  app.use(morgan('dev'));
}

app.use(express.static(path.join(resourcesDir, 'public')));
app.set('views', path.join(resourcesDir, 'views'));
app.set('view engine', 'pug');

app.use('/', require('./routes/index'));

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error(`Not Found: ${req.originalUrl}`);
  err.status = 404;
  next(err);
});

// error handlers
app.use((err, req, res) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: env.isProduction ? {} : err,
  });
});

module.exports = app;
