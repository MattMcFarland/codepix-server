import {
  User,
  passport
} from '../database';


/**
 * @usage passport.use(new LocalStrategy(strategy));
 */
export function strategy(username, password, done) {
  User.findOne({ username: username }, function (err, user) {
    if (err) { return done(err); }
    if (!user) {
      return done(null, false, { message: 'Incorrect username.' });
    }
    if (!user.validPassword(password)) {
      return done(null, false, { message: 'Incorrect password.' });
    }
    return done(null, user);
  });
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
    passport.authenticate('local', function (err, user, info) {
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

