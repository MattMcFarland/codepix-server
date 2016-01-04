import {
  express,
  hljs,
  Chance,
  fs,
  path,
  passport

} from './modules';

import { User } from '../database';

let apiRoute = express.Router();

apiRoute.get('/code/:id', (req, res) => {
  let data = require('../../data/' + req.params.id + '.png.meta.json');
  res.json(data);
});

apiRoute.get('/list', (req, res, next) => {

  fs.readdir(path.join(__dirname,'../../data'), (err, files) => {
    let data = [];

    if (err) {
      next(err);
      return;
    }

    files.forEach((file, i) => {

      if (file.indexOf('json') > -1 ) {
        let fileData = require(path.join(__dirname,'../../data', file));
         data.push(fileData);
        if (i === files.length - 1) {
          res.json(data);
        }
      }
    });

  });


});

apiRoute.post('/add', function (req, res, next) {
  if (req.rasterizer) {
    let chance = new Chance();
    let hash = chance.hash();
    req.rasterizer.rasterizeCode(req.body.code,
      'data/' + hash + '.png')
      .then((file) => {
        req.codepic = file;
        next();
      }).catch(err => {
      console.error(err);
    });
  } else {
    next();
  }
});

apiRoute.post('/add', (req, res, next) => {
  if (req.codepic) {
    res.json(req.codepic);
  } else {
    next();
  }
});

apiRoute.post('/', function (req, res, next) {
  try {
    let { code } = req.body;
    let parsed = hljs.highlightAuto(code);
    res.render('canvas', {
      title: 'codepic',
      description: 'your code',
      codez: parsed.value
    });

  } catch (err) {
    next(err);
  }

});


apiRoute.post('/login', (req, res, next) => {
  console.log(req.body);
  passport.authenticate('local', (err, user, info) => {
    console.log(err, user, info);
    if (err) {
      return next(err);
    }
    if (!user) {
      res.status(400);
      res.json(info);
    }
    req.logIn(user, (loginError) => {
      if (loginError) {
        return next(loginError);
      }
      res.status(200);
      res.json(info);
    });
  })(req, res, next);
});

apiRoute.post('/logout', (req, res) => {
  req.logout();
  res.json({logout: true});
});

const bcrypt = require('bcrypt');
function hashPassword(cleartext) {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(10, (error, salt) => {
      if (error) {
        return reject(error);
      }
      bcrypt.hash(cleartext, salt, (h) => {
        resolve(h);
      });
    });
  });
}

apiRoute.post('/signup', (req, res, next) => {
  if (req.user) {
    res.status(400);
    res.json({msg: 'already logged in'});
  } else {
    hashPassword(req.body.password).then(pwd => {
      User.create({
        username: req.body.username,
        password: pwd}).then(() => {
        res.status(200);
        res.json({msg: 'success'});
      }).catch(next);
    }).catch(next);
  }
});



export const api = apiRoute;

