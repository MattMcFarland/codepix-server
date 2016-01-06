/**
 * Module dependencies.
 */
import {
  express,
  request,
  bodyParser,
  winston,
  passport,
  session,
  path
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
import { api } from '../../routes';
import { connect } from '../../database/utils';
import { strategy, serializeUser, deserializeUser} from '../cedepixAuth';
const OK = (obj) => {
  return expect(obj).to.not.be.an('undefined');
};

describe('models/User.js => database', () => {

  let db;
  let User;

  before((done) => {
    connect().then((_db) => {
      db = _db;
      User = db.User;
      done();

    });
  });


  it('Connection exists.', () => OK(db));
  it('User model exists.', () => OK(User));

  describe('=> Server', () => {
    var app;
    var server;


    before((done) => {
      const logFile = ('userauth-test.log');
      const logger = new (winston.Logger)({
        transports: [
          new (winston.transports.File)({filename: logFile})
        ]
      });
      app = express();
      // view engine setup
      app.set('views', path.join(__dirname, '../../../views'));
      app.set('view engine', 'hbs');

      app.use(bodyParser.urlencoded({extended: false}));
      app.use(bodyParser.json());
      app.use(session({ secret: 'super-secret' }));
      app.use(passport.initialize());
      app.use(passport.session());
      var LocalStrategy = require('passport-local').Strategy;
      passport.use('local', new LocalStrategy(strategy));
      passport.serializeUser(serializeUser);
      passport.deserializeUser(deserializeUser);
      app.use((req, res, next) => {
        logger.log('info', {body: req.body, headers: req.headers});
        next();
      });

      app.get('/', (req, res) => {
        res.status(200).send('ok');
      });

      app.use('/api', api);
      server = app.listen(4444, done);
      app.use(function (req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
      });
      app.use(function (err, req, res) {
        res.status(err.status || 500);
        res.render('error', {
          message: err.message,
          error: err
        });
      });

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



    describe('=> Authentication', () => {

      before(function (done) {
        // Delete all users
        User.destroy({truncate: true, cascade: true})
          .then(function () {
            done();
          })
          .catch(done);
      });

      it('can signup', (done) => {
        request(app)
          .post('/api/signup')
          .send({
            username: 'someuser',
            email: 'hubhub@hub.com',
            password: 'password'})
          .expect(200)
          .end((err, res) => {
            console.log(res.body);
            expect(err).to.equal(null);
            OK(res);
            OK(res.body);
            expect(res.body.user.username).to.equal('someuser');
            expect(res.body.user.email).to.equal('hubhub@hub.com');
            expect(res.body.user.password)
              .to.equal('5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8');

            User.findAll({
              where: {
                username: 'someuser'
              }
            }).then(newUser => {
              let {username, id} = newUser[0].dataValues;
              expect(username).equal('someuser');
              expect(id).be.gt(0);
              done();
            });
          });
      });

      it('logs out', done => {
        request(app)
          .post('/api/logout')
          .expect(200)
          .end(done);
      });

      it('bas username fail', (done) => {
        request(app)
          .post('/api/login')
          .send({username: 'asdf', password: 'asdf'})
          .expect(401)
          .end(done);
      });

      it('bad password fail', (done) => {
        request(app)
          .post('/api/login')
          .send({username: 'someuser', password: 'asdf'})
          .expect(401)
          .end(done);
      });

      it('succeeds login', (done) => {
        request(app)
          .post('/api/login')
          .send({username: 'someuser', password: 'password'})
          .expect(200)
          .end(done);
      });


    });
  });
});

