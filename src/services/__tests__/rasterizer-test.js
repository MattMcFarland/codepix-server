/**
 * Module dependencies.
 */
import { express, request, bodyParser, path, winston } from '../modules';
import { expect } from 'chai';
import { describe, before, it } from 'mocha';
import { Rasterizer } from '../Rasterizer';
import { api } from '../../routes';

const assertOK = (obj) => {
  return expect(obj).to.not.be.an('undefined');
};

process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err);
  process.exit(1);
});
process.on('SIGTERM', () => {
  process.exit(0);
});
process.on('SIGINT', () => {
  process.exit(0);
});


describe('=> Server', function () {
  var app;
  var server;

  before((done) => {

    const logFile = ('rasterizer-test.log');

    const logger = new (winston.Logger)({
      transports: [
        new (winston.transports.File)({ filename: logFile })
      ]
    });

    app = express();
    // view engine setup
    app.set('views', path.join(__dirname, '../../../views'));
    app.set('view engine', 'hbs');


    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use((req, res, next) => {
      logger.log('info', { body: req.body, headers: req.headers } );
      next();

    });
    app.get('/', (req, res) => {
      res.status(200).send('ok');
    });
    app.use('/api', api);
    server = app.listen(5555, done);
  });


  it('express application', () => assertOK(app));
  it('server instance', () => assertOK(server));
  it('server response', (done) => {
    request(app)
      .get('/')
      .expect(200)
      .end(done);
  });

  it('server api', (done) => {
    request(app)
      .post('/api')
      .send({code: 'herp'})
      .expect(200)
      .end(done);
  });

  describe('=> Rasterizer', function () {
    let rasterizer;
    // let app = express();
    before((done) => {
      rasterizer = new Rasterizer({
        host: 'localhost',
        port: 5555,
        debug: true
      }).startService().then(r => {
        rasterizer = r;
        done();
      }).catch(err => done(err));
    });

    it('has instance', () => assertOK(rasterizer));
    it('instance has service', () => assertOK(rasterizer.service));
    it('spawns the process', () => assertOK(rasterizer.service.process));
    it('process has PID', () => assertOK(rasterizer.service.process.pid));

    it('rasterizes code', (done) => {
      rasterizer
        .rasterizeCode('console.log("test")',
          'data/' + 'test' + '.png')
        .then(done)
        .catch(err => done(err));
    });

  });

});



