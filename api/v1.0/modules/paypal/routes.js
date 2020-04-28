const router = require('express').Router();
const api = require('./controller');
const auth = require('../../../../common/authentication');

// Middle layer for User API
router.get('/token', auth.validateToken, api.getToken);
router.post('/paypalWebhook', api.webhookNotification);
module.exports = router;
