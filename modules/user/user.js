const con = require('../database/mysql');
const util = require('util');
const query = util.promisify(con.query).bind(con);
const functions = require('../common/functions');
const config = require('../../config');
const validator = require('validator');
const code = require('../common/code');
const message = require('../common/message');
const fs = require('fs');

class UserService {
  /**
   * API for user registration
   * @param {*} req (user detials)
   * @param {*} res (json with success/failure)
   */
  async registration(info) {
    try {
      if (
        !validator.isEmail(info.emailAddress) &&
        !validator.isEmpty(info.userPassword) &&
        !validator.isEmpty(info.fullName) &&
        !validator.isEmpty(info.mobileNumber)
      ) {
        return {
          code: code.invalidDetails,
          message: message.invalidDetails,
          data: null
        };
      }

      const sqlQuerySelect = `SELECT * FROM ec_user WHERE emailAddress = ? OR mobileNumber = ?`;
      const getDetails = await query(sqlQuerySelect, [
        info.emailAddress,
        info.mobileNumber
      ]);

      if (getDetails.length > 0) {
        return {
          code: code.invalidDetails,
          message: message.duplicateDetails,
          data: null
        };
      }

      const userPassword = functions.encryptPassword(info.userPassword);
      const sqlQuery = `INSERT INTO ec_user(fullName, emailAddress, userPassword, mobileNumber) VALUES (?, ?, ?, ?)`;
      const registrationDetails = await query(sqlQuery, [
        info.fullName,
        info.emailAddress,
        userPassword,
        info.mobileNumber
      ]);

      let token = await functions.tokenEncrypt(info.emailAddress);
      token = Buffer.from(token, 'ascii').toString('hex');
      let emailMessage = fs
        .readFileSync('./modules/emailtemplate/welcome.html', 'utf8')
        .toString();
      emailMessage = emailMessage
        .replace('$fullname', info.fullName)
        .replace('$link', config.emailVerifiedLink + token);

      functions.sendEmail(
        info.emailAddress,
        message.registrationEmailSubject,
        emailMessage
      );
      return {
        code: code.success,
        message: message.registration,
        data: registrationDetails
      };
    } catch (e) {
      return {
        code: code.unexceptedError,
        message: message.tryCatch,
        data: e.message
      };
    }
  }

  /**
   * API for email verification
   * @param {*} req (email)
   * @param {*} res (json with success/failure)
   */
  async verifyEmail(info) {
    try {
      if (!info.emailAddress) {
        return {
          code: code.invalidDetails,
          message: message.dataIssue,
          data: null
        };
      }
      const token = Buffer.from(info.emailAddress, 'hex').toString('ascii');
      const tokenDecrypt = await functions.tokenDecrypt(token);
      if (tokenDecrypt.message === 'jwt expired') {
        return {
          code: code.sessionExpire,
          message: message.emailLinkExpired,
          data: null
        };
      }
      const verifyEmailDetails = await query(
        `UPDATE ec_user SET isEmailVerified = 1 WHERE emailAddress = ?`,
        [tokenDecrypt.data]
      );
      return {
        code: code.success,
        message: message.emailVerificationSuccess,
        data: verifyEmailDetails
      };
    } catch (error) {
      return {
        code: code.unexceptedError,
        message: message.tryCatch,
        data: error.message
      };
    }
  }

  /**
   * API for user login
   * @param {*} req (email address & password)
   * @param {*} res (json with success/failure)
   */
  async login(info) {
    try {
      if (!validator.isEmail(info.emailAddress)) {
        return {
          code: code.invalidDetails,
          message: message.invalidLoginDetails,
          data: null
        };
      }

      const sqlQuery = `SELECT id, fullName, emailAddress, userPassword, mobileNumber, isEmailVerified, isActive, isAdmin, isDeleted FROM ec_user WHERE emailAddress = ?`;
      const loginDetails = await query(sqlQuery, [info.emailAddress]);

      if (loginDetails.length <= 0) {
        return {
          code: code.invalidDetails,
          message: message.invalidLoginDetails,
          data: null
        };
      }
      const password = functions.decryptPassword(loginDetails[0].userPassword);
      if (password !== info.userPassword) {
        return {
          code: code.invalidDetails,
          message: message.invalidLoginDetails,
          data: null
        };
      }

      if (!loginDetails[0].isActive === 1 && !loginDetails[0].isDeleted === 0) {
        return {
          code: code.invalidDetails,
          message: message.accountDisable,
          data: null
        };
      }

      if (loginDetails[0].isEmailVerified === 0) {
        return {
          code: code.invalidDetails,
          message: message.emailVerify,
          data: null
        };
      }

      const token = await functions.tokenEncrypt(loginDetails[0]);
      delete loginDetails[0].userPassword;
      delete loginDetails[0].isEmailVerified;
      delete loginDetails[0].isActive;
      delete loginDetails[0].isAdmin;
      delete loginDetails[0].isDeleted;
      return {
        code: code.success,
        message: message.success,
        data: loginDetails,
        token: token
      };
    } catch (e) {
      return {
        code: code.unexceptedError,
        message: message.tryCatch,
        data: e.message
      };
    }
  }

  /**
   * API to Change password
   * @param {*} req (old password, token, new password )
   * @param {*} res (json with success/failure)
   */
  async changePassword(id, info) {
    try {
      if (
        validator.isEmpty(info.oldPassword) &&
        validator.isEmpty(info.newPassword)
      ) {
        return {
          code: code.invalidDetails,
          message: message.dataIssue,
          data: null
        };
      }

      const userDetails = await query(
        'SELECT userPassword FROM ec_user WHERE id = ?',
        [id]
      );
      if (userDetails.length <= 0) {
        return {
          code: code.invalidDetails,
          message: message.invalidDetails,
          data: null
        };
      }
      let password = functions.decryptPassword(userDetails[0].userPassword);
      if (password !== info.oldPassword) {
        return {
          code: code.invalidDetails,
          message: message.invalidPassword,
          data: null
        };
      }

      // Encrypt password for the user
      password = functions.encryptPassword(info.newPassword);
      const updatePasswordDetails = await query(
        'UPDATE ec_user SET userPassword = ? WHERE id = ?',
        [password, id]
      );
      return {
        code: code.success,
        message: message.passwordChanged,
        data: updatePasswordDetails
      };
    } catch (error) {
      return {
        code: code.unexceptedError,
        message: message.tryCatch,
        data: error.message
      };
    }
  }

  /**
   * API for Forgot Password
   * @param {*} req (email address )
   * @param {*} res (json with success/failure)
   */
  async forgotPassword(info) {
    try {
      if (!validator.isEmail(info.emailAddress)) {
        return {
          code: code.invalidDetails,
          message: message.invalidEmail,
          data: null
        };
      }
      const userDetail = await query(
        'SELECT emailAddress, fullName FROM ec_user WHERE emailAddress = ?',
        [info.emailAddress]
      );
      if (userDetail.length <= 0) {
        return {
          code: code.invalidDetails,
          message: message.invalidEmail,
          data: null
        };
      }
      const to = userDetail[0].emailAddress;
      let token = await functions.tokenEncrypt(to);
      token = Buffer.from(token, 'ascii').toString('hex');
      const subject = message.forgotPasswordSubject;
      const link = config.resetPasswordLink + token;
      let emailMessage = fs
        .readFileSync('./modules/emailtemplate/reset.html', 'utf8')
        .toString();
      emailMessage = emailMessage
        .replace('$fullname', userDetail[0].fullName)
        .replace('$link', link)
        .replace('$emailId', config.supportEmail);

      functions.sendEmail(to, subject, emailMessage);
      return {
        code: code.success,
        message: message.resetLink,
        data: null
      };
    } catch (error) {
      return {
        code: code.unexceptedError,
        message: message.tryCatch,
        data: error.message
      };
    }
  }

  /**
   * API for Reset Password
   * @param {*} req (emailAddress )
   * @param {*} res (json with success/failure)
   */
  async resetPassword(info) {
    try {
      if (
        validator.isEmpty(info.emailAddress) ||
        validator.isEmpty(info.newPassword)
      ) {
        return {
          code: code.invalidDetails,
          message: message.invalidDetails,
          data: null
        };
      }
      const emailAddress = Buffer.from(info.emailAddress, 'hex').toString(
        'ascii'
      );
      const emailAddressDetails = await functions.tokenDecrypt(emailAddress);
      if (!emailAddressDetails.data) {
        return {
          code: code.invalidDetails,
          message: message.emailLinkExpired,
          data: null
        };
      }
      const password = functions.encryptPassword(info.newPassword);
      const passwordDetails = await query(
        'UPDATE ec_user SET userPassword = ? WHERE emailAddress = ?',
        [password, emailAddressDetails.data]
      );
      return {
        code: code.success,
        message: message.passwordReset,
        data: passwordDetails
      };
    } catch (error) {
      return {
        code: code.unexceptedError,
        message: message.tryCatch,
        data: error.message
      };
    }
  }

  /**
   * API to update profile
   * @param {*} req (token, user information )
   * @param {*} res (json with success/failure)
   */
  async updateProfile(userId, info) {
    try {
      if (validator.isEmpty(info.fullName)) {
        return {
          code: code.invalidDetails,
          message: message.allFieldReq,
          data: null
        };
      }
      const userDetail = await query(
        'UPDATE ec_user SET fullName = ? WHERE id= ?',
        [info.fullName, userId]
      );
      return {
        code: code.success,
        message: message.profileUpdate,
        data: userDetail
      };
    } catch (error) {
      return {
        code: code.unexceptedError,
        message: message.tryCatch,
        data: error.message
      };
    }
  }

  /**
   * API for user history
   * @param {*} req (userId)
   * @param {*} res (json with success/failure)
   */
  async profileInformation(id) {
    try {
      const sqlQuery =
        'SELECT fullName, mobileNumber, emailAddress FROM ec_user u WHERE id = ?';
      const profileInformationDetails = await query(sqlQuery, [id]);
      if (profileInformationDetails.length > 0) {
        return {
          code: code.success,
          message: message.success,
          data: profileInformationDetails
        };
      } else {
        return {
          code: code.invalidDetails,
          message: message.noData,
          data: null
        };
      }
    } catch (error) {
      return {
        code: code.unexceptedError,
        message: message.tryCatch,
        data: error.message
      };
    }
  }

  /**
   * API for uploading user profile pic
   * @param {*} req (userId, base64 data)
   * @param {*} res (json with success/failure)
   */
  async uploadProfilePicUsingBase64Data(id, info) {
    try {
      const base64Data = info.profilePic.replace(
        /^data:image\/png;base64,/,
        ''
      );
      const path = 'upload/profilepic/' + id + '-' + Date.now() + '.png';
      try {
        const fs = require('fs');
        const writeFile = util.promisify(fs.writeFile).bind(fs);
        const uploadInfo = await writeFile(path, base64Data, 'base64');
        const uploadProfilePicDetails = await query(
          'UPDATE ec_user SET profileImagePath = ? WHERE id = ?',
          [path, id]
        );
        return {
          code: code.success,
          message: message.success,
          data: uploadProfilePicDetails
        };
      } catch (error) {
        return {
          code: code.invalidDetails,
          message: message.invalidDetails,
          data: error
        };
      }
    } catch (error) {
      return { code: code.dbCode, message: message.dbError, data: error };
    }
  }
}

module.exports = {
  userService: function() {
    return new UserService();
  }
};

/**
 * API for Uploading data from CSV into mongodb
 * @param {*} req (CSV file)
 * @param {*} res (json with success/failure)
 */
// function uploadDataInMongo(info) {
//   return new Promise((resolve, reject) => {
//       try {
//           const csvFilePath = info.file.path;

//           csv().fromFile(csvFilePath).then((jsonObj) => {
//               const promises = jsonObj.map(item => {
//                   return new Promise((resolve, reject) => {
//                       const User = new userSchema(item);
//                       User.save((err, userDetails) => {
//                           if(err)
//                           {
//                               reject();
//                           }
//                           resolve();
//                       });
//                   });
//               });

//               Promise.all(promises).then(() => {
//                   resolve({ code: code.success, message: message.csvDataAdded });
//               }).catch(e => {
//                   reject({ code: code.dbCode, message: message.dbError, data: err});
//               });
//           });
//       }
//       catch (e) {
//           reject({ code: code.invalidDetails, message: message.tryCatch, data: e });
//       }
//   });
// };

/**
 * API for uploading user profile pic
 * @param {*} req (userId, base64 data)
 * @param {*} res (json with success/failure)
 */
// async uploadProfilePicUsingBase64Data(id, info) {
//   try {
//     const base64Data = info.data.profilePic.replace(/^data:image\/png;base64,/, "");
//     const path = "upload/profilepic/" + id + "-" + Date.now() + ".png";
//     try {
//       const fs = require("fs");
//       const writeFile = util.promisify(fs.writeFile).bind(fs);
//       const uploadInfo = await writeFile(path, base64Data, "base64");
//       const uploadProfilePicDetails = await query("UPDATE user SET profileImagePath = ? WHERE id = ?", [path, id]);
//       return { code: code.success, message: message.success, data: uploadProfilePicDetails };
//     } catch (error) {
//       return { code: code.invalidDetails, message: message.invalidDetails, data: error };
//     }
//   } catch (error) {
//     return { code: code.dbCode, message: message.dbError, data: error };
//   }
// }
