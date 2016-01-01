
/**
 * Import Dependencies
 */
import app from '../app';
import { Rasterizer } from '../services/Rasterizer';
import { http, debug } from './modules';

/**
 * Setup Debug
 */
debug('codepix:server');

// pretty errors for the win
require('pretty-error').start();

/**
 * Get port from environment and store in Express.
 */

let port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

new Rasterizer({
  host: 'localhost',
  port: port,
  debug: true
}).startService().then(r => {
  app.set('rasterizer', r);
  server.on('error', onError);
  server.on('listening', onListening);
  server.listen(port);
});




/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var _port = parseInt(val, 10);

  if (isNaN(_port)) {
    // named pipe
    return val;
  }

  if (_port >= 0) {
    // port number
    return _port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}


