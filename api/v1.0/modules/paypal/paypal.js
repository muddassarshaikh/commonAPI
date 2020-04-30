// const functions = require('../../../../common/functions');
// const validator = require('validator');
// const db = require(`../user/database/${config.database}/${config.database}`);
var request = require('request-promise');
const config = require('../../../../config');
const statusCode = require('../../../../common/statusCode');
const message = require('../../../../common/message');
const fs = require('fs');

class PaypalService {
  /**
   * API for get access token for paypal
   * @param {*} req (user detials)
   * @param {*} res (json with success/failure)
   */
  async getAccessToken() {
    try {
      const auth = {
        username: config.paypalClientId,
        password: config.paypalSecret,
      };

      const response = await request({
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        auth: auth,
        uri: `${config.paypalURL}/v1/oauth2/token`,
        method: 'POST',
        form: { grant_type: 'client_credentials' },
        json: true,
      });

      return {
        statusCode: statusCode.success,
        message: message.success,
        data: response,
      };
    } catch (error) {
      return {
        statusCode: statusCode.bad_request,
        message: error.message,
        data: JSON.stringify(error),
      };
    }
  }

  async webhookNotification(info) {
    try {
      var data =
        '\n=========================================================================================\n';
      data += JSON.stringify(info);
      var filename = moment().format('DD-MM-YYYY');
      await fs.appendFileSync(
        `${appRoot}/modules/thirdpartyapi/logs/${filename}.txt`,
        data
      );

      if (
        info.event_type == 'PAYMENT.SALE.COMPLETED' &&
        info.resource.state == 'completed'
      ) {
        // info.create_time
        console.log(info);
      }
    } catch (error) {
      return {
        statusCode: statusCode.bad_request,
        message: error.message,
        data: JSON.stringify(error),
      };
    }
  }
}

module.exports = {
  paypalService: function () {
    return new PaypalService();
  },
};
