const router = require('express').Router();
const api = require('./userController');
const auth = require('../common/authentication');

// Middle layer for User API
router.post('/registration', auth.decryptRequest, api.registration);
router.post('/login', auth.decryptRequest, api.login);
router.post('/verifyEmail', auth.decryptRequest, api.verifyEmail);
router.post('/changePassword', auth.validateToken, auth.decryptRequest, api.changePassword);

module.exports = router;