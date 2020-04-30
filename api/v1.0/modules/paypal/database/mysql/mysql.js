const con = require('../../../../../../common/database/mysql');
const util = require('util');
const query = util.promisify(con.query).bind(con);
const { databaseInitial } = require('../../../../../../config');
const { connection_failed } = require('../../../../../../common/statusCode');

class PaypalDatabase {}

module.exports = {
  paypalDatabase: function () {
    return new PaypalDatabase();
  },
};
