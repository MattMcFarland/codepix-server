/**
 * Import Node Modules
 */
import {
  express,
  path,
  favicon,
  logger,
  cookieParser,
  bodyParser
} from './modules';

/**
 * Import Routes
 */
import {
  api,
  root
} from './routes';

// app setup
const app = express();
const staticpath = path.join(
  __dirname, '../node_modules/codepix-client/lib/public'
);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(staticpath, 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(staticpath));
app.use('/c0dez/data', express.static('data'));
app.use('/api', function (req, res, next) {
  if (app.get('rasterizer')) {
    req.rasterizer = app.get('rasterizer');
  }
  next();
});
app.use('/api', api);
app.use('/', root);
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
// no stack-traces leaked to user
app.use(function (err, req, res) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
