import {
  express,
  hljs,
  Chance,
  fs,
  path,
  crypto

} from './modules';

import { onAuthenticate } from '../auth/cedepixAuth';
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


apiRoute.post('/login', onAuthenticate(), (req, res, next) => {
  next();
});

apiRoute.post('/logout', (req, res) => {
  req.logout();
  res.json({logout: true});
});

const hash = (pwd) => {
  return crypto
    .createHash('sha1')
    .update(pwd)
    .digest('hex');
};

apiRoute.post('/signup', (req, res, next) => {
  if (req.user) {
    res.status(400);
    res.json({msg: 'already logged in'});
  } else {
    var pass = hash(req.body.password);
    User.create({
      username: req.body.username,
      password: pass
    }).then(() => {
      res.status(200);
      res.json({msg: 'success'});
    }).catch(next);
  }
});



export const api = apiRoute;

