const object = require('./user');
const functions = require('../common/functions');

const controller = {
  //User Registration API
  registration: async (req, res) => {
    try {
      const registrationDetails = await object
        .userService()
        .registration(res.locals.requestedData);
      res.send(
        functions.responseGenerator(
          registrationDetails.code,
          registrationDetails.message,
          registrationDetails.data
        )
      );
    } catch (error) {
      res.send(
        functions.responseGenerator(error.code, error.message, error.data)
      );
    }
  },

  //Verify Email API
  verifyEmail: async (req, res) => {
    try {
      const verificationDetails = await object
        .userService()
        .verifyEmail(res.locals.requestedData);
      res.send(
        functions.responseGenerator(
          verificationDetails.code,
          verificationDetails.message,
          verificationDetails.data
        )
      );
    } catch (error) {
      res.send(
        functions.responseGenerator(error.code, error.message, error.data)
      );
    }
  },

  //Login API
  login: async (req, res) => {
    try {
      const loginDetails = await object
        .userService()
        .login(res.locals.requestedData);
      res.header('auth', loginDetails.token);
      res.send(
        functions.responseGenerator(
          loginDetails.code,
          loginDetails.message,
          loginDetails.data
        )
      );
    } catch (error) {
      res.send(
        functions.responseGenerator(error.code, error.message, error.data)
      );
    }
  },

  // Change Password API
  changePassword: async (req, res) => {
    try {
      const changePasswordDetails = await object
        .userService()
        .changePassword(res.locals.tokenInfo.id, res.locals.requestedData);
      res.send(
        functions.responseGenerator(
          changePasswordDetails.code,
          changePasswordDetails.message,
          changePasswordDetails.data
        )
      );
    } catch (error) {
      res.send(
        functions.responseGenerator(error.code, error.message, error.data)
      );
    }
  },

  // Forgot Password API
  forgotPassword: async (req, res) => {
    try {
      const forgotPasswordDetails = await object
        .userService()
        .forgotPassword(res.locals.requestedData);
      res.send(
        functions.responseGenerator(
          forgotPasswordDetails.code,
          forgotPasswordDetails.message,
          forgotPasswordDetails.data
        )
      );
    } catch (error) {
      res.send(
        functions.responseGenerator(error.code, error.message, error.data)
      );
    }
  },

  // Reset Password API
  resetPassword: async (req, res) => {
    try {
      const resetPasswordDetails = await object
        .userService()
        .resetPassword(res.locals.requestedData);
      res.send(
        functions.responseGenerator(
          resetPasswordDetails.code,
          resetPasswordDetails.message,
          resetPasswordDetails.data
        )
      );
    } catch (error) {
      res.send(
        functions.responseGenerator(error.code, error.message, error.data)
      );
    }
  },

  // Update Profile API
  updateProfile: async (req, res) => {
    try {
      const updateProfileDetails = await object
        .userService()
        .updateProfile(res.locals.tokenInfo.id, res.locals.requestedData);
      res.send(
        functions.responseGenerator(
          updateProfileDetails.code,
          updateProfileDetails.message,
          updateProfileDetails.data
        )
      );
    } catch (error) {
      res.send(
        functions.responseGenerator(error.code, error.message, error.data)
      );
    }
  },

  // Update Profile API
  profileInformation: async (req, res) => {
    try {
      const userInformationDetails = await object
        .userService()
        .profileInformation(res.locals.tokenInfo.id);
      res.send(
        functions.responseGenerator(
          userInformationDetails.code,
          userInformationDetails.message,
          userInformationDetails.data
        )
      );
    } catch (error) {
      res.send(
        functions.responseGenerator(error.code, error.message, error.data)
      );
    }
  },

  uploadProfilePicUsingBase64Data: async (req, res) => {
    try {
      const uploadProfilePicDetails = await object
        .userService()
        .uploadProfilePicUsingBase64Data(
          res.locals.tokenInfo.id,
          res.locals.requestedData
        );
      res.send(
        functions.responseGenerator(
          uploadProfilePicDetails.code,
          uploadProfilePicDetails.message,
          uploadProfilePicDetails.data
        )
      );
    } catch (error) {
      res.send(
        functions.responseGenerator(error.code, error.message, error.data)
      );
    }
  }
};

module.exports = controller;
