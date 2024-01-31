var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sassMiddleware = require('node-sass-middleware');
var i18n = require('i18n-2');

var routes = require('./routes/index');

var app = express();

// Express Configuration
// view engine setup
app.set('views', path.join(__dirname, 'resources', 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'resources', 'public')));

// Attach the i18n property to the express request object
// And attach helper methods for use in templates
i18n.expressBind(app, {
  locales: [
    'fr',
    'en'
  ],
  defaultLocale: 'en',
  directory: path.join(__dirname, 'resources', 'locales'),
  extension: '.json', 
  cookieName: 'locale',
  indent: ' '
});

app.use(function(req, res, next) {
 if (req.query.lang) {
    req.i18n.setLocaleFromQuery();
    res.cookie(config.locale.cookie, req.i18n.getLocale());
  } else {
    req.i18n.setLocaleFromCookie();
  }
  next();
});

var sass_debug = false;
app.use(sassMiddleware({
  src: path.join(__dirname, 'resources', 'views'),
  dest: path.join(__dirname, 'resources', 'public'),
  debug: sass_debug,
  outputStyle: (sass_debug === true) ? 'expanded' : 'compressed',
  error: function(err) {
    console.log('SASS middleware error: '+err);
  },
  update: function(s) {
    console.log('updated a file', s);
  }
}));

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;

