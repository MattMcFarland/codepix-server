import {
  express
} from './modules';

const codeRoute = express.Router();

codeRoute.get('/:id', function (req, res) {
  res.render('code', {
    codepic: '/c0dez/data/' + req.params.id + '.png',
    title: 'c0dez' }
  );
});

export const code = codeRoute;

