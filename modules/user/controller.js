const userObject = require("./user");
const functions = require("../common/functions");

const userController = {
  //User Registration API
  registration: async (req, res) => {
    try {
      const registrationDetails = await userObject.userService().registration(res.locals.requestedData);
      res.send(functions.responseGenerator(registrationDetails.code, registrationDetails.message, registrationDetails.data));
    } catch (error) {
      res.send(functions.responseGenerator(error.code, error.message, error.data));
    }
  },

  //Verify Email API
  verifyEmail: async (req, res) => {
    try {
      const verificationDetails = await userObject.userService().verifyEmail(res.locals.requestedData);
      res.send(functions.responseGenerator(verificationDetails.code, verificationDetails.message, verificationDetails.data));
    } catch (error) {
      res.send(functions.responseGenerator(error.code, error.message, error.data));
    }
  },

  //Login API
  login: async (req, res) => {
    try {
      const loginDetails = await userObject.userService().login(res.locals.requestedData);
      res.header("auth", loginDetails.token);
      res.send(functions.responseGenerator(loginDetails.code, loginDetails.message, loginDetails.data));
    } catch (error) {
      res.send(functions.responseGenerator(error.code, error.message, error.data));
    }
  },

  // Change Password API
  changePassword: (req, res, next) => {
    method
      .changePassword(res.locals.data, res.locals.id)
      .then(data => {
        res.send(functions.responseGenerator(data.code, data.message, data.data));
      })
      .catch(error => {
        res.send(functions.responseGenerator(error.code, error.message, error.data));
      });
  },

  // Forgot Password API
  forgetPassword: (req, res, next) => {
    method
      .forgetPassword(res.locals.data)
      .then(data => {
        res.send(functions.responseGenerator(data.code, data.message, data.data));
      })
      .catch(error => {
        res.send(functions.responseGenerator(error.code, error.message, error.data));
      });
  },

  // Reset Password API
  resetPassword: (req, res, next) => {
    method
      .resetPassword(res.locals.data)
      .then(data => {
        res.send(functions.responseGenerator(data.code, data.message, data.data));
      })
      .catch(error => {
        res.send(functions.responseGenerator(error.code, error.message, error.data));
      });
  },

  // Update Profile API
  updateProfile: (req, res, next) => {
    method
      .updateProfile(res.locals.data, res.locals.id)
      .then(data => {
        res.send(functions.responseGenerator(data.code, data.message, data.data));
      })
      .catch(error => {
        res.send(functions.responseGenerator(error.code, error.message, error.data));
      });
  },

  // Update Profile API
  userInformation: (req, res, next) => {
    method
      .userInformation(res.locals.id)
      .then(data => {
        res.send(functions.responseGenerator(data.code, data.message, data.data));
      })
      .catch(error => {
        res.send(functions.responseGenerator(error.code, error.message, error.data));
      });
  }
};

module.exports = userController;
