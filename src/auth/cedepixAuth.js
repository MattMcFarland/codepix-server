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


function createUser({username, password, email}) {
  return new Promise((resolve, reject) => {
    User.create({
      username,
      password: hash(password),
      email: email
    }).then((user) => resolve(user)).catch(err => reject(err));
  });
}


export function signUp() {
  return function (req, res, next) {
    let count = User.count();
    if (typeof count === 'number' && count > 0) {
      console.log(User.count());
      User.findOne(
        { where: { username: req.body.username } }
      ).then(taken => {
        if (taken) {
          res.status(401);
          return res.json({message: 'username already exists'});
        }
        console.log('\n', req.body.username, 'is available! \n');
        console.log('creating user');
        createUser(req.body).then(user => {
          res.json({user, message: 'success'});
        }).catch(bad => next(bad));
      }).catch(err => next(err));
    } else {
      console.log('creating our FIRST USER!!! OMG');
      createUser(req.body)
        .then(user => res.json({user, message: 'success'}))
        .catch(err => next(err));
    }
  };
}



