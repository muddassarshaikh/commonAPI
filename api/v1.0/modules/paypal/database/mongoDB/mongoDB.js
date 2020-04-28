const User = require('./schema');
const { connection_failed } = require('../../../../../../common/statusCode');

class UserDatabase {
  /**
   * Database call to check if user exists
   * @param {*} req (email address & mobileNumber)
   * @param {*} res (json with success/failure)
   */
  async checkIfuserExists(info) {
    try {
      const details = await User.find({ emailAddress: info.emailAddress });
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
    const user = new User(info);
    try {
      const details = await user.save();
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
      const details = await User.updateOne(
        { emailAddress: emailAddress },
        { isEmailVerified: 1 }
      );
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
      const details = await User.find(
        { emailAddress: emailAddress },
        {
          fullName: 1,
          emailAddress: 1,
          userPassword: 1,
          mobileNumber: 1,
          isEmailVerified: 1,
          isActive: 1,
          isDeleted: 1,
        }
      );
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
      const details = await User.find(
        { emailAddress: emailAddress },
        {
          userPassword: 1,
        }
      );
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
   * Database call for updating userpassword
   * @param {*} req (emailAddress)
   * @param {*} res (json with success/failure)
   */
  async updateUserPassword(emailAddress, password) {
    try {
      const details = await User.updateOne(
        { emailAddress: emailAddress },
        { userPassword: password }
      );
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
      const details = await User.updateOne(
        { emailAddress: emailAddress },
        { fullName: info.fullName }
      );
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
      const details = await User.updateOne(
        { emailAddress: emailAddress },
        { profileURL: path }
      );
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
