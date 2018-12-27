const method = require('./userFunction');
const functions = require('../common/functions');

const userController = {

    //Sign Up API
    registration: (req, res, next) => {
        method.registration(res.locals.data).then(data => {
            res.send(functions.responseGenerator(data.code, data.message , data.data));
        }).catch(error => {
            res.send(functions.responseGenerator(error.code, error.message , error.data));
        });
    },

    //Sign In API
    signIn: (req, res, next) => {
        method.signIn(res.locals.data).then(data => {
            var token = functions.tokenEncrypt(data.data[0].userId);
            res.header('auth', token);
            res.send(functions.responseGenerator(data.code, data.message , data.data));
        }).catch(error => {
            res.send(functions.responseGenerator(error.code, error.message , error.data));
        });
    },

    // Change Password API
    changePassword: (req, res, next) => {
        method.changePassword(res.locals.data, res.locals.id).then(data => {
            res.send(functions.responseGenerator(data.code, data.message , data.data));
        }).catch(error => {
            res.send(functions.responseGenerator(error.code, error.message , error.data));
        });
    },

    // Forgot Password API
    forgotPassword: (req, res, next) => {
        method.forgotPassword(res.locals.data).then(data => {
            res.send(functions.responseGenerator(data.code, data.message , data.data));
        }).catch(error => {
            res.send(functions.responseGenerator(error.code, error.message , error.data));
        });
    },

    // Reset Password API
    resetPassword: (req, res, next) => {
        method.resetPassword(res.locals.data).then(data => {
            res.send(functions.responseGenerator(data.code, data.message , data.data));
        }).catch(error => {
            res.send(functions.responseGenerator(error.code, error.message , error.data));
        });
    },

    // Update Profile API
    updateProfile: (req, res, next) => {
        method.updateProfile(res.locals.data, res.locals.id).then(data => {
            res.send(functions.responseGenerator(data.code, data.message , data.data));
        }).catch(error => {
            res.send(functions.responseGenerator(error.code, error.message , error.data));
        });
    },

    // Update Profile API
    userInformation: (req, res, next) => {
        method.userInformation(res.locals.id).then(data => {
            res.send(functions.responseGenerator(data.code, data.message , data.data));
        }).catch(error => {
            res.send(functions.responseGenerator(error.code, error.message , error.data));
        });
    }
}
    
module.exports = userController;