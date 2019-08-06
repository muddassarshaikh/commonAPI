const router = require('express').Router();
const api = require('./controller');
const auth = require('../common/authentication');

// Middle layer for User API
router.post('/registration', auth.decryptRequest, api.registration);
router.post('/login', auth.decryptRequest, api.login);
router.post('/verifyEmail', auth.decryptRequest, api.verifyEmail);
router.post(
  '/changePassword',
  auth.validateToken,
  auth.decryptRequest,
  api.changePassword
);
router.post('/forgotPassword', auth.decryptRequest, api.forgotPassword);
router.post('/resetPassword', auth.decryptRequest, api.resetPassword);
router.put(
  '/profile',
  auth.validateToken,
  auth.decryptRequest,
  api.updateProfile
);
router.get('/profile', auth.validateToken, api.profileInformation);
router.post(
  '/uploadProfilePicUsingBase64Data',
  auth.validateToken,
  auth.decryptRequest,
  api.uploadProfilePicUsingBase64Data
);

module.exports = router;
