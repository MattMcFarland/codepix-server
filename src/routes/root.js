import {
  express
} from './modules';

const rootRoute = express.Router();

/* GET home page. */
rootRoute.get('*', function (req, res) {
  res.render('root', { title: 'codepix.io' });
});


export const root = rootRoute;

