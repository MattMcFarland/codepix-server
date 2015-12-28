const router = require('express').Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('root', { title: 'Express' });
});

export const root = router;

