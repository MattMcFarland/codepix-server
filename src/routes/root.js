const rootRoute = require('express').Router();

/* GET home page. */
rootRoute.get('/', function (req, res) {
  res.render('root', { title: 'Express' });
});


export const root = rootRoute;

