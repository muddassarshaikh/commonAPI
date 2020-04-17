const con = require('../../../../../../common/database/mysql');
const util = require('util');
const query = util.promisify(con.query).bind(con);
const { database_initial } = require('../../../../../../config');
const { connection_failed } = require('../../../../../../common/statusCode');

class UserDatabase {
  /**
   * Database call to check if user exists
   * @param {*} req (email address & mobileNumber)
   * @param {*} res (json with success/failure)
   */
  async checkIfuserExists(info) {
    try {
      const sqlSelectQuery = `SELECT * FROM ${database_initial}_user WHERE emailAddress = ? OR mobileNumber = ?`;
      const details = await query(sqlSelectQuery, [
        info.emailAddress,
        info.mobileNumber,
      ]);
      con.end();
      return details;
    } catch (error) {
      throw {
        statusCode: connection_failed,
        message: error.message,
        data: JSON.stringify(error),
      };
    }
  }

  /**
   * Database call for inserting user information
   * @param {*} req (user details)
   * @param {*} res (json with success/failure)
   */
  async userRegistration(info) {
    try {
      const sqlInsertQuery = `INSERT INTO ${database_initial}_user(fullName, emailAddress, userPassword, mobileNumber) VALUES (?, ?, ?, ?)`;
      const details = await query(sqlInsertQuery, [
        info.fullName,
        info.emailAddress,
        info.userPassword,
        info.mobileNumber,
      ]);
      con.end();
      return details;
    } catch (error) {
      throw {
        statusCode: connection_failed,
        message: error.message,
        data: JSON.stringify(error),
      };
    }
  }

  /**
   * Database call for updating the user email verification
   * @param {*} req (email address)
   * @param {*} res (json with success/failure)
   */
  async verifyEmail(emailAddress) {
    try {
      const sqlUpdateQuery = `UPDATE ${database_initial}_user SET isEmailVerified = 1 WHERE emailAddress = ?`;
      const details = await query(sqlUpdateQuery, [emailAddress]);
      con.end();
      return details;
    } catch (error) {
      throw {
        statusCode: connection_failed,
        message: error.message,
        data: JSON.stringify(error),
      };
    }
  }

  /**
   * Database call for selecting user details for login
   * @param {*} req (emailAddress)
   * @param {*} res (json with success/failure)
   */
  async getUser(emailAddress) {
    try {
      const sqlSelectQuery = `
        SELECT id, fullName, emailAddress, userPassword, mobileNumber, isEmailVerified, isActive, isDeleted 
        FROM ${database_initial}_user 
        WHERE emailAddress = ?`;
      const details = await query(sqlSelectQuery, [emailAddress]);
      con.end();
      return details;
    } catch (error) {
      throw {
        statusCode: connection_failed,
        message: error.message,
        data: JSON.stringify(error),
      };
    }
  }

  /**
   * Database call for selecting userpassword for changing password
   * @param {*} req (emailAddress)
   * @param {*} res (json with success/failure)
   */
  async getPassword(emailAddress) {
    try {
      const sqlSelectQuery = `SELECT userPassword FROM ${database_initial}_user WHERE emailAddress = ?`;
      const details = await query(sqlSelectQuery, [emailAddress]);
      con.end();
      return details;
    } catch (error) {
      throw {
        statusCode: connection_failed,
        message: error.message,
        data: JSON.stringify(error),
      };
    }
  }

  /**
   * Database call for updating userpassword by email address
   * @param {*} req (emailAddress)
   * @param {*} res (json with success/failure)
   */
  async updateUserPassword(emailAddress, password) {
    try {
      const sqlUpdateQuery = `UPDATE ${database_initial}_user SET userPassword = ? WHERE emailAddress = ?`;
      const details = await query(sqlUpdateQuery, [password, emailAddress]);
      con.end();
      return details;
    } catch (error) {
      throw {
        statusCode: connection_failed,
        message: error.message,
        data: JSON.stringify(error),
      };
    }
  }

  /**
   * Database call for updating userdetails
   * @param {*} req (emailAddress)
   * @param {*} res (json with success/failure)
   */
  async updateUser(emailAddress, info) {
    try {
      const sqlUpdateQuery = `UPDATE ${database_initial}_user SET fullName = ? WHERE emailAddress = ?`;
      const details = await query(sqlUpdateQuery, [
        info.fullName,
        emailAddress,
      ]);
      con.end();
      return details;
    } catch (error) {
      throw {
        statusCode: connection_failed,
        message: error.message,
        data: JSON.stringify(error),
      };
    }
  }

  /**
   * Database call for updating userdetails
   * @param {*} req (emailAddress)
   * @param {*} res (json with success/failure)
   */
  async addProfilePic(emailAddress, path) {
    try {
      const sqlUpdateQuery = `UPDATE ${database_initial}_user SET profileURL = ? WHERE emailAddress = ?`;
      const details = await query(sqlUpdateQuery, [path, emailAddress]);
      con.end();
      return details;
    } catch (error) {
      throw {
        statusCode: connection_failed,
        message: error.message,
        data: JSON.stringify(error),
      };
    }
  }
}

module.exports = {
  userDatabase: function () {
    return new UserDatabase();
  },
};
