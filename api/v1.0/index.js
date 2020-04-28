var express = require('express');
var router = express.Router();

const userRouter = require('./modules/user/routes');
const paypalRouter = require('./modules/paypal/routes');

router.get('/', function (req, res, next) {
  res.send('Hello v1.0 GET API from Afoofa');
});

router.post('/', function (req, res, next) {
  res.send('Hello v1.0 POST API from Afoofa');
});

router.use('/user', userRouter);
router.use('/paypal', paypalRouter);

module.exports = router;
