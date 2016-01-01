import {
  express,
  hljs
} from './modules';




let apiRoute = express.Router();


apiRoute.use((req, res, next) => {
  console.log('request', req.body);
  next();
});


apiRoute.get('/canvas', (req, res) => {
  res.render('canvas', { title: 'CodePic' });
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

