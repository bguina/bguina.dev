const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const sassMiddleware = require('node-sass-middleware');
const i18n = require('i18n-2');
const logger = require('./logger');
const env = require('./env');

const app = express();

const resourcesDir = path.join(__dirname, 'resources');

app.use(favicon(path.join(resourcesDir, 'public', 'img', 'favicon.ico')));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Attach the i18n property to the express request object
// And attach helper methods for use in templates
i18n.expressBind(app, {
  locales: [
    'fr',
    'en',
  ],
  defaultLocale: 'en',
  directory: path.join(resourcesDir, 'locales'),
  extension: '.json',
  cookieName: 'locale',
  indent: ' ',
});

app.use((req, res, next) => {
  req.i18n.setLocaleFromCookie();
  next();
});

app.use(express.static(path.join(resourcesDir, 'public')));
app.set('views', path.join(resourcesDir, 'views'));
app.set('view engine', 'pug');
app.use(sassMiddleware({
  src: path.join(resourcesDir, 'views'),
  dest: path.join(resourcesDir, 'public'),
  debug: env.isDevelopment && false,
  force: env.isDevelopment,
  outputStyle: env.isDevelopment ? 'expanded' : 'compressed',
  error(err) {
    logger.error(`SASS middleware error: ${err}`);
  },
  update(s) {
    logger.verbose('updated a file', s);
  },
}));

app.use('/', require('./routes/index'));

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
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
