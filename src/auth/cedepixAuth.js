import {
  User
} from '../database';

const crypto = require('crypto');
const passport = require('passport');

const hash = (pwd) => {
  return crypto
    .createHash('sha1')
    .update(pwd)
    .digest('hex');
};

/**
 * @usage passport.use(new LocalStrategy(strategy));
 */
export function strategy(username, password, done) {
  console.log('testing', username, password);
  User.findOne({ where: { username: username } }).then(user => {
    if (!user) {
      return done(null, false, { message: 'Incorrect username.' });
    }
    if (hash(password) !== user.password) {
      return done(null, false, { message: 'Incorrect password.' });
    }
    return done(null, user);
  }).catch(done);
}

/**
 * @usage passport.serializeUser(serializeUser);
 */
export function serializeUser(user, done) {
  done(null, user.id);
}

/**
 * @usage passport.deserializeUser(deserializeUser);
 */
export function deserializeUser(id, done) {
  User.findById(id).then(user => {
    done(null, user);
  }).catch(err => done(err));
}


/**
 * @usage router.get('/dashboard', onAuthenticate, (req, res, next) ...
 */
export function onAuthenticate() {
  return function (req, res, next) {
    console.log('\n', req.body, '\n');
    passport.authenticate('local', function (err, user, info) {
      console.log(err, info);
      if (err) {
        return next(err);
      }
      if (!user) {
        res.status(401);
        res.json(info);
        return next();
      }
      req.logIn(user, function (loginErr) {
        if (loginErr) {
          return next(loginErr);
        }
        res.json(user);
      });
    })(req, res, next);
  };
}

