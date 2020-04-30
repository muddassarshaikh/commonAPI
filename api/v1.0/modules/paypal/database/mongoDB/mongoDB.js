const Paypal = require('./schema');
const { connection_failed } = require('../../../../../../common/statusCode');

class PaypalDatabase {}

module.exports = {
  paypalDatabase: function () {
    return new PaypalDatabase();
  },
};
