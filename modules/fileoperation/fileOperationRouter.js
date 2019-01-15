const router = require('express').Router();
const api = require('./fileOperationController');
const auth = require('../common/authentication');
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();

// Middle layer for File Operations API
router.post('/uploadDataInMongo', multipartMiddleware, api.uploadDataInMongo);

module.exports = router;