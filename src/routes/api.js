import {
  express,
  hljs,
  Chance
} from './modules';

let apiRoute = express.Router();

apiRoute.get('/canvas', (req, res) => {
  let rasterizer = req.rasterizer;
  console.log(rasterizer);

  res.json(rasterizer);
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


export const api = apiRoute;

