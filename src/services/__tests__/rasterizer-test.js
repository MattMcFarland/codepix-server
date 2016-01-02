/**
 * Module dependencies.
 */
import {
  express,
  request,
  bodyParser,
  path,
  winston,
  compression
} from '../modules';

/** Test Modules **/
import {
  expect
} from 'chai';
import { describe,
  before,
  it
} from 'mocha';

/** App Modules */
import { Rasterizer } from '../Rasterizer';
import { api } from '../../routes';

/* const models = require('../../db/models'); */

const assertOK = (obj) => {
  return expect(obj).to.not.be.an('undefined');
};

/*
const connect = () => {
  return new Promise((resolve, reject) => {
    try {
      models.sequelize.sync().then(() => {
        resolve(models);
      });
    } catch (error) {
      reject(error);
    }
  });
};
*/
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

    app.use(compression({level: 9}));
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

  /*
  describe('=> Database', function () {

    it('connects to database', (done) => {
      connect().then((db) => {
        assertOK(db);
        done();
      }).catch(done);
    });

  });
  */

  describe('=> Rasterizer', function () {
    let rasterizer;

    before((done) => {
      rasterizer = new Rasterizer({
        host: 'localhost',
        port: 5555,
        debug: false
      }).startService().then(r => {
        rasterizer = r;

        done();
      }).catch(err => done(err));
    });

    it('has instance', () => assertOK(rasterizer));
    it('instance has service', () => assertOK(rasterizer.service));
    it('spawns the process', () => assertOK(rasterizer.service.process));
    it('process has PID', () => assertOK(rasterizer.service.process.pid));


    describe('=> File Data', function () {
      this.timeout(5000);
      let file;
      before(function (done) {
        rasterizer
          .rasterizeCode('console.log("test")')
          .then(f => {
            file = f;
            done();
          }).catch(err => done(err));
      });

      it('filename and id sha1 hash is exact match of code', function () {
        expect(file.id).to.equal('6b3c25d7d8918eeda3230357a58ecf5ea20bf5f3');
      });


      // TODO: Prevent files from being overwritten
      // TODO: Create test to make sure that files cant be overwritten
      // TODO: Test file should be deleted after the test passes


    });

  });

});



