'use strict';

var _modules = require('./modules');

var app = (0, _modules.express)();

// view engine setup
app.set('views', _modules.path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
app.use((0, _modules.favicon)(_modules.path.join(__dirname, 'public', 'favicon.ico')));
app.use((0, _modules.logger)('dev'));
app.use(_modules.bodyParser.json());
app.use(_modules.bodyParser.urlencoded({ extended: false }));
app.use((0, _modules.cookieParser)());
app.use(_modules.express.static(_modules.path.join(__dirname, 'public')));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;