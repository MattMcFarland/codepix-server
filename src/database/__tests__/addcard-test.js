/**
 * Module dependencies.
 */
import {
  express,
  request,
  bodyParser,
  path,
  winston
} from '../../modules';

/** Test Modules **/
import {
  expect
} from 'chai';
import { describe,
  before,
  it
} from 'mocha';

/** App Modules */
import { Rasterizer } from '../../services/Rasterizer';
import { api } from '../../routes';
import { connect } from '../utils';

const OK = (obj) => {
  return expect(obj).to.not.be.an('undefined');
};

describe('models/Card.js => database', () => {

  let db;

  before((done) => {
    connect().then((_db) => {
      db = _db;
      done();
    });
  });

  it('Connection exists.', () => OK(db));
  it('Card model exists.', () => OK(db.Card));

  describe('=> Server', () => {
    var app;
    var server;
    var card;
    before((done) => {
      const logFile = ('addcard-test.log');
      const logger = new (winston.Logger)({
        transports: [
          new (winston.transports.File)({filename: logFile})
        ]
      });
      app = express();
      // view engine setup
      app.set('views', path.join(__dirname, '../../../views'));
      app.set('view engine', 'hbs');

      app.use(bodyParser.urlencoded({extended: true}));
      app.use(bodyParser.json());

      app.use((req, res, next) => {
        logger.log('info', {body: req.body, headers: req.headers});
        next();

      });
      app.get('/', (req, res) => {
        res.status(200).send('ok');
      });

      app.use('/api', api);
      server = app.listen(5555, done);
    });
    it('express application', () => OK(app));
    it('server instance', () => OK(server));
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

      it('has instance', () => OK(rasterizer));
      it('instance has service', () => OK(rasterizer.service));
      it('spawns the process', () => OK(rasterizer.service.process));
      it('process has PID', () => OK(rasterizer.service.process.pid));


      describe('=> Create Card', function () {
        this.timeout(5000);
        let file;
        before(function (done) {
          rasterizer
            .rasterizeCode('var foo="bar"\nwindow.console.log("test")')
            .then(payload => {
              file = payload;
              console.log('\n\n', payload, '\n\n');

              db.Card.create({
                shasum: payload.shasum,
                content: payload.code,
                size: payload.size,
                description: 'here is some new code',
                title: 'New code!!!',
                shareUrl: 'http://codepix.io/code/' + payload.shasum,
                imageUrl: 'http://codepix.io/c0dez/data/' + payload.filename,
                width: payload.dimensions.width,
                height: payload.dimensions.height
              }).then(c => {
                card = c;
                c.createTag({
                  name: 'javascript'
                }).then(t => {
                  OK(card.dataValues);
                  OK(t);
                  OK(card.getTags());
                  c.destroy();
                  done();
                });
              });
            }).catch(err => done(err));
        });

        it('shasum verification', function () {
          expect(file.shasum).to.equal(
            'a9e2e2a03bb72d32e3f18693550c7df25d05fd5d'
          );
        });


      });

    });

  });



});

