// const functions = require('../../../../common/functions');
// const validator = require('validator');
// const db = require(`../user/database/${config.database}/${config.database}`);
var request = require('request-promise');
const config = require('../../../../config');
const statusCode = require('../../../../common/statusCode');
const message = require('../../../../common/message');
const fs = require('fs');
const paypalURL =
  config.env == 'development'
    ? 'https://api.sandbox.paypal.com'
    : 'https://api.paypal.com';

class PaypalService {
  /**
   * API for get access token for paypal
   * @param {*} req (user detials)
   * @param {*} res (json with success/failure)
   */
  async getAccessToken() {
    try {
      const auth = {
        username: config.sandboxPaypalClientId,
        password: config.sandboxPaypalSecret,
      };

      const response = await request({
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        auth: auth,
        uri: `${paypalURL}/v1/oauth2/token`,
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

  async createPlan(info) {
    try {
      var accessTokenDetails = await getAccessToken();
      if (!accessTokenDetails.data) {
        return {
          code: code.invalidDetails,
          message: message.tryCatch,
          data: null,
        };
      }
      var accessToken = accessTokenDetails.data;
      return new Promise(function (resolve, reject) {
        const headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        };
        var date = moment().format('DD MMM, YYYY');
        const payment = {
          product_id: 'PROD-4CJ57263PM821325D',
          name: `${date} - DonarId ${info.userId} Pledge`,
          description: `${date} - DonarId ${info.userId} Pledge`,
          status: 'ACTIVE',
          billing_cycles: [
            {
              frequency: {
                interval_unit: 'DAY',
                interval_count: 1,
              },
              tenure_type: 'REGULAR',
              sequence: 1,
              total_cycles: info.amount,
              pricing_scheme: {
                fixed_price: {
                  value: '1',
                  currency_code: 'USD',
                },
              },
            },
          ],
          payment_preferences: {
            auto_bill_outstanding: true,
            setup_fee: {
              value: '0',
              currency_code: 'USD',
            },
            setup_fee_failure_action: 'CONTINUE',
            payment_failure_threshold: 0,
          },
          taxes: {
            percentage: '0',
            inclusive: false,
          },
        };
        request(
          {
            headers: headers,
            uri: `${paypalURL}/v1/billing/plans`,
            method: 'POST',
            body: payment,
            json: true,
          },
          function (error, res, body) {
            if (!error && res.statusCode == 201) {
              resolve({
                code: code.success,
                message: message.success,
                data: body.id,
              });
            } else if (!error && res.statusCode != 201) {
              resolve({
                code: code.invalidDetails,
                message: `Paypal Error: ${body.message}`,
                data: null,
              });
            } else {
              resolve({
                code: code.invalidDetails,
                message: error,
                data: null,
              });
            }
          }
        );
      });
    } catch (error) {
      return {
        code: code.invalidDetails,
        message: error,
        data: null,
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
