
/**
 * Import Node Modules
 */
import {
  express,
  path,
  favicon,
  cookieParser,
  bodyParser,
  compression,
  expressPhantom
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

app.use(compression({level: 9, filter: shouldCompress}));
app.use(expressPhantom.SEORender);

function shouldCompress(req, res) {
  if (req.headers['x-no-compression']) {
    // don't compress responses with this request header
    console.log('no compression');
    return false;
  }
  // fallback to standard filter function
  return compression.filter(req, res);
}

app.use(favicon(path.join(staticpath, 'favicon.ico')));
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
