const functions = require('../../../../common/functions');
const config = require('../../../../config');
const validator = require('validator');
const statusCode = require('../../../../common/statusCode');
const message = require('../../../../common/message');
const fs = require('fs');
const db = require(`./database/${config.database}/${config.database}`);

class UserService {
  /**
   * API for user registration
   * @param {*} req (user detials)
   * @param {*} res (json with success/failure)
   */
  async registration(info) {
    try {
      if (
        !validator.isEmail(info.emailAddress) ||
        validator.isEmpty(info.userPassword) ||
        validator.isEmpty(info.fullName) ||
        validator.isEmpty(info.mobileNumber)
      ) {
        throw {
          statusCode: statusCode.bad_request,
          message: message.badRequest,
          data: null,
        };
      }

      const checkIfuserExists = await db.userDatabase().checkIfuserExists(info);

      if (checkIfuserExists.length > 0) {
        throw {
          statusCode: statusCode.bad_request,
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
        .replace('$link', config.emailVerificationLink + token);

      functions.sendEmail(
        info.emailAddress,
        message.registrationEmailSubject,
        emailMessage
      );
      return {
        statusCode: statusCode.success,
        message: message.registration,
        data: userRegistration,
      };
    } catch (error) {
      throw {
        statusCode: error.statusCode,
        message: error.message,
        data: JSON.stringify(error),
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
        throw {
          statusCode: statusCode.bad_request,
          message: message.badRequest,
          data: null,
        };
      }
      const token = Buffer.from(info.emailAddress, 'hex').toString('ascii');
      const tokenDecrypt = await functions.tokenDecrypt(token);
      if (tokenDecrypt.message === 'jwt expired') {
        throw {
          statusCode: statusCode.unauthorized,
          message: message.emailLinkExpired,
          data: null,
        };
      }
      const verifyEmailDetails = await db
        .userDatabase()
        .verifyEmail(tokenDecrypt.data);
      return {
        statusCode: statusCode.success,
        message: message.emailVerificationSuccess,
        data: verifyEmailDetails,
      };
    } catch (error) {
      throw {
        statusCode: error.statusCode,
        message: error.message,
        data: JSON.stringify(error),
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
        throw {
          statusCode: statusCode.bad_request,
          message: message.invalidLoginDetails,
          data: null,
        };
      }

      const loginDetails = await db.userDatabase().getUser(info.emailAddress);

      if (loginDetails.length <= 0) {
        throw {
          statusCode: statusCode.bad_request,
          message: message.invalidLoginDetails,
          data: null,
        };
      }
      const password = functions.decryptPassword(loginDetails[0].userPassword);
      if (password !== info.userPassword) {
        throw {
          statusCode: statusCode.bad_request,
          message: message.invalidLoginDetails,
          data: null,
        };
      }

      if (loginDetails[0].isActive !== 1 || loginDetails[0].isDeleted !== 0) {
        throw {
          statusCode: statusCode.bad_request,
          message: message.accountDisable,
          data: null,
        };
      }

      if (loginDetails[0].isEmailVerified === 0) {
        throw {
          statusCode: statusCode.bad_request,
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
        statusCode: statusCode.success,
        message: message.success,
        data: userDetails,
      };
    } catch (error) {
      throw {
        statusCode: error.statusCode,
        message: error.message,
        data: JSON.stringify(error),
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
        throw {
          statusCode: statusCode.bad_request,
          message: message.badRequest,
          data: null,
        };
      }

      const getPassword = await db.userDatabase().getPassword(emailAddress);

      if (getPassword.length <= 0) {
        throw {
          statusCode: statusCode.bad_request,
          message: message.invalidDetails,
          data: null,
        };
      }

      let password = functions.decryptPassword(getPassword[0].userPassword);
      if (password !== info.oldPassword) {
        throw {
          statusCode: statusCode.bad_request,
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
        statusCode: statusCode.success,
        message: message.passwordChanged,
        data: updatePasswordDetails,
      };
    } catch (error) {
      throw {
        statusCode: error.statusCode,
        message: error.message,
        data: JSON.stringify(error),
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
        throw {
          statusCode: statusCode.bad_request,
          message: message.invalidEmail,
          data: null,
        };
      }
      const userDetail = await db.userDatabase().getUser(info.emailAddress);

      if (userDetail.length <= 0) {
        throw {
          statusCode: statusCode.bad_request,
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
        statusCode: statusCode.success,
        message: message.resetLink,
        data: null,
      };
    } catch (error) {
      throw {
        statusCode: error.statusCode,
        message: error.message,
        data: JSON.stringify(error),
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
        throw {
          statusCode: statusCode.bad_request,
          message: message.invalidDetails,
          data: null,
        };
      }
      const emailAddress = Buffer.from(info.emailAddress, 'hex').toString(
        'ascii'
      );
      const emailAddressDetails = await functions.tokenDecrypt(emailAddress);
      if (!emailAddressDetails.data) {
        throw {
          statusCode: statusCode.unauthorized,
          message: message.emailLinkExpired,
          data: null,
        };
      }
      const password = functions.encryptPassword(info.newPassword);

      const passwordDetails = await db
        .userDatabase()
        .updateUserPassword(emailAddressDetails.data, password);

      return {
        statusCode: statusCode.success,
        message: message.passwordReset,
        data: passwordDetails,
      };
    } catch (error) {
      throw {
        statusCode: error.statusCode,
        message: error.message,
        data: JSON.stringify(error),
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
          statusCode: statusCode.success,
          message: message.success,
          data: userDetails,
        };
      } else {
        return {
          statusCode: statusCode.bad_request,
          message: message.noData,
          data: null,
        };
      }
    } catch (error) {
      throw {
        statusCode: error.statusCode,
        message: error.message,
        data: JSON.stringify(error),
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
        throw {
          statusCode: statusCode.bad_request,
          message: message.allFieldReq,
          data: null,
        };
      }

      const userDetail = await db.userDatabase().updateUser(userId, info);

      return {
        statusCode: statusCode.success,
        message: message.profileUpdate,
        data: userDetail,
      };
    } catch (error) {
      throw {
        statusCode: error.statusCode,
        message: error.message,
        data: JSON.stringify(error),
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
        throw {
          statusCode: statusCode.unsupported_media_type,
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
        statusCode: statusCode.success,
        message: message.success,
        data: addProfilePic,
      };
    } catch (error) {
      throw {
        statusCode: error.statusCode,
        message: error.message,
        data: JSON.stringify(error),
      };
    }
  }
}

module.exports = {
  userService: function () {
    return new UserService();
  },
};
