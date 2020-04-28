const object = require('./paypal');
const functions = require('../../../../common/functions');

const controller = {
  getToken: async (req, res, next) => {
    try {
      const tokenDetails = await object.paypalService().getAccessToken();
      res.send(
        functions.responseGenerator(
          tokenDetails.statusCode,
          tokenDetails.message,
          tokenDetails.data
        )
      );
    } catch (error) {
      return next(error);
    }
  },

  webhookNotification: async (req, res, next) => {
    try {
      const tokenDetails = await object
        .paypalService()
        .webhookNotification(req.body);
      res.send(
        functions.responseGenerator(
          tokenDetails.statusCode,
          tokenDetails.message,
          tokenDetails.data
        )
      );
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = controller;
