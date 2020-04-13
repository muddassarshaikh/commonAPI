const functions = require('../../../../common/functions');
const config = require('../../../../config');
const validator = require('validator');
const code = require('../../../../common/code');
const message = require('../../../../common/message');
const fs = require('fs');
const db =
  config.database === 'mysql'
    ? require('../user/database/mysql/mysql')
    : require('../user/database/mongoDB/mongoDB');

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
          data: null,
        };
      }

      const checkIfuserExists = await db.userDatabase().checkIfuserExists(info);

      if (checkIfuserExists.length > 0) {
        return {
          code: code.invalidDetails,
          message: message.duplicateDetails,
          data: null,
        };
      }

      info.userPassword = functions.encryptPassword(info.userPassword);

      const userRegistration = await db.userDatabase().userRegistration(info);

      let token = await functions.tokenEncrypt(info.emailAddress);
      token = Buffer.from(token, 'ascii').toString('hex');
      let emailMessage = fs
        .readFileSync('./common/emailtemplate/welcome.html', 'utf8')
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
        data: userRegistration,
      };
    } catch (e) {
      return {
        code: code.dbCode,
        message: message.tryCatch,
        data: e.message,
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
          data: null,
        };
      }
      const token = Buffer.from(info.emailAddress, 'hex').toString('ascii');
      const tokenDecrypt = await functions.tokenDecrypt(token);
      if (tokenDecrypt.message === 'jwt expired') {
        return {
          code: code.sessionExpire,
          message: message.emailLinkExpired,
          data: null,
        };
      }
      const verifyEmailDetails = await db
        .userDatabase()
        .verifyEmail(tokenDecrypt.data);
      return {
        code: code.success,
        message: message.emailVerificationSuccess,
        data: verifyEmailDetails,
      };
    } catch (error) {
      return {
        code: code.unexceptedError,
        message: message.tryCatch,
        data: error.message,
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
          data: null,
        };
      }

      const loginDetails = await db.userDatabase().getUser(info.emailAddress);

      if (loginDetails.length <= 0) {
        return {
          code: code.invalidDetails,
          message: message.invalidLoginDetails,
          data: null,
        };
      }
      const password = functions.decryptPassword(loginDetails[0].userPassword);
      if (password !== info.userPassword) {
        return {
          code: code.invalidDetails,
          message: message.invalidLoginDetails,
          data: null,
        };
      }

      if (!loginDetails[0].isActive === 1 && !loginDetails[0].isDeleted === 0) {
        return {
          code: code.invalidDetails,
          message: message.accountDisable,
          data: null,
        };
      }

      if (loginDetails[0].isEmailVerified === 0) {
        return {
          code: code.invalidDetails,
          message: message.emailVerify,
          data: null,
        };
      }

      const userDetails = {
        fullName: loginDetails[0].fullName,
        emailAddress: loginDetails[0].emailAddress,
        mobileNumber: loginDetails[0].mobileNumber,
      };

      const token = await functions.tokenEncrypt(userDetails);

      userDetails.token = token;

      return {
        code: code.success,
        message: message.success,
        data: userDetails,
      };
    } catch (e) {
      return {
        code: code.unexceptedError,
        message: message.tryCatch,
        data: e.message,
      };
    }
  }

  /**
   * API to Change password
   * @param {*} req (old password, token, new password )
   * @param {*} res (json with success/failure)
   */
  async changePassword(emailAddress, info) {
    try {
      if (
        validator.isEmpty(info.oldPassword) &&
        validator.isEmpty(info.newPassword)
      ) {
        return {
          code: code.invalidDetails,
          message: message.dataIssue,
          data: null,
        };
      }

      const getPassword = await db.userDatabase().getPassword(emailAddress);

      if (getPassword.length <= 0) {
        return {
          code: code.invalidDetails,
          message: message.invalidDetails,
          data: null,
        };
      }

      let password = functions.decryptPassword(getPassword[0].userPassword);
      if (password !== info.oldPassword) {
        return {
          code: code.invalidDetails,
          message: message.invalidPassword,
          data: null,
        };
      }

      // Encrypt password for the user
      password = functions.encryptPassword(info.newPassword);

      const updatePasswordDetails = await db
        .userDatabase()
        .updateUserPassword(emailAddress, password);

      return {
        code: code.success,
        message: message.passwordChanged,
        data: updatePasswordDetails,
      };
    } catch (error) {
      return {
        code: code.unexceptedError,
        message: message.tryCatch,
        data: error.message,
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
          data: null,
        };
      }
      const userDetail = await db.userDatabase().getUser(info.emailAddress);

      if (userDetail.length <= 0) {
        return {
          code: code.invalidDetails,
          message: message.invalidEmail,
          data: null,
        };
      }
      const to = userDetail[0].emailAddress;
      let token = await functions.tokenEncrypt(to);
      token = Buffer.from(token, 'ascii').toString('hex');
      const subject = message.forgotPasswordSubject;
      const link = config.resetPasswordLink + token;
      let emailMessage = fs
        .readFileSync('./common/emailtemplate/reset.html', 'utf8')
        .toString();
      emailMessage = emailMessage
        .replace('$fullname', userDetail[0].fullName)
        .replace('$link', link)
        .replace('$emailId', config.supportEmail);

      functions.sendEmail(to, subject, emailMessage);
      return {
        code: code.success,
        message: message.resetLink,
        data: null,
      };
    } catch (error) {
      return {
        code: code.unexceptedError,
        message: message.tryCatch,
        data: error.message,
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
          data: null,
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
          data: null,
        };
      }
      const password = functions.encryptPassword(info.newPassword);

      const passwordDetails = await db
        .userDatabase()
        .updateUserPassword(emailAddressDetails.data, password);

      return {
        code: code.success,
        message: message.passwordReset,
        data: passwordDetails,
      };
    } catch (error) {
      return {
        code: code.unexceptedError,
        message: message.tryCatch,
        data: error.message,
      };
    }
  }

  /**
   * API for user history
   * @param {*} req (userId)
   * @param {*} res (json with success/failure)
   */
  async getProfile(emailAdress) {
    try {
      const getProfileDetails = await db.userDatabase().getUser(emailAdress);
      if (getProfileDetails.length > 0) {
        const userDetails = {
          fullName: getProfileDetails[0].fullName,
          emailAddress: getProfileDetails[0].emailAddress,
          mobileNumber: getProfileDetails[0].mobileNumber,
        };
        return {
          code: code.success,
          message: message.success,
          data: userDetails,
        };
      } else {
        return {
          code: code.invalidDetails,
          message: message.noData,
          data: null,
        };
      }
    } catch (error) {
      return {
        code: code.unexceptedError,
        message: message.tryCatch,
        data: error.message,
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
          data: null,
        };
      }

      const userDetail = await db.userDatabase().updateUser(userId, info);

      return {
        code: code.success,
        message: message.profileUpdate,
        data: userDetail,
      };
    } catch (error) {
      return {
        code: code.unexceptedError,
        message: message.tryCatch,
        data: error.message,
      };
    }
  }

  /**
   * API for uploading user profile pic
   * @param {*} req (userId, base64 data)
   * @param {*} res (json with success/failure)
   */
  async addProfilePic(emailAddress, info) {
    try {
      var imageType = info.imageInfo.name
        ? info.imageInfo.name.split('.')[1]
        : '';
      if (!imageType) {
        return {
          code: code.error,
          message: message.invalidImage,
          data: [],
        };
      }

      const imageName = `profile-${Date.now()}`;
      const path = 'profile/';
      const imageInformation = {
        fileName: imageName,
        base64: info.imageInfo.base64,
        fileType: imageType,
        pathInfo: path,
      };
      const imageURLInfo = await functions.uploadFile(imageInformation);

      const imageURL = path + imageURLInfo.fileName;

      const addProfilePic = await db
        .userDatabase()
        .addProfilePic(emailAddress, imageURL);
      return {
        code: code.success,
        message: message.success,
        data: addProfilePic,
      };
    } catch (error) {
      return {
        code: code.invalidDetails,
        message: message.invalidDetails,
        data: error.message,
      };
    }
  }
}

module.exports = {
  userService: function () {
    return new UserService();
  },
};
