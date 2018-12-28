const router = require('express').Router();
const api = require('./userController');
const auth = require('../common/authentication');

// Middle layer for User API
router.post('/registration', auth.decryptRequest, api.registration);
router.post('/login', auth.decryptRequest, api.login);

module.exports = router;