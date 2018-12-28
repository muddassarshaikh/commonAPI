const con = require('../database/databaseConnector');
const functions = require('../common/functions');
const config = require('../../config');
const validator = require('validator');
const code = require('../common/code');
const message = require('../common/message');
const fs = require('fs');

/**
 * API for user registration
 * @param {*} req (user detials)
 * @param {*} res (json with success/failure)
*/
function registration(info) {
    return new Promise((resolve, reject) => {
        try {
            if (validator.isEmail(info.data.emailAddress)) {
                const userPassword = functions.encryptPassword(info.data.userPassword);
                const sqlQuery = 'INSERT INTO user(firstName, middleName, lastName, emailAddress, userPassword, address, mobileNumber) VALUES (?, ?, ?, ?, ?, ?, ?)';
                con.query(sqlQuery, [info.data.firstName, info.data.middleName, info.data.lastName, info.data.emailAddress, userPassword, info.data.address, info.data.mobileNumber], (err, regDetails) => {
                    if (err) {
                        reject({ code: code.dbCode, message: message.dbError, data: err });
                    }
                    else {
                        let token = functions.tokenEncrypt(info.data.emailAddress);
                        token = Buffer.from(token, 'ascii').toString('hex');

                        const to = info.data.emailAddress;
                        const subject = message.registrationEmailSubject;
                        const link = config.emailVerifiedLink + token;
                        let emailMessage = fs.readFileSync('./modules/emailtemplate/welcome.html', 'utf8').toString();
                        emailMessage = emailMessage.replace("$fullname", info.data.firstName).replace("$link", link);
                        functions.sendEmail(to, subject, emailMessage, function (err, result) {
                            resolve({ code: code.success, message: message.registration });
                        });
                    }
                });
            }
            else {
                reject({ code: code.invalidDetails, message: message.invalidEmail });
            }
        }
        catch (e) {
            reject({ code: code.invalidDetails, message: message.tryCatch, data: e });
        }
    });
};

/**
 * API for email verification
 * @param {*} req (email)
 * @param {*} res (json with success/failure)
*/
function verifyEmail(info) {
    return new Promise((resolve, reject) => {
        try {
            if (info.data.emailAddress) {
                const token = Buffer.from(info.data.emailAddress, 'hex').toString('ascii');
                functions.tokenDecrypt(token, function (err, result) {
                    if (result) {
                        con.query('UPDATE user SET isEmailVerified = 1 WHERE emailAddress = ?', [result.data], (err, result) => {
                            if (err) {
                                reject({ code: code.dbCode, message: message.dbError, data: err });
                            }
                            else if (result) {
                                resolve({ code: code.success, message: message.emailVerificationSuccess });
                            }
                        });
                    }
                    else {
                        reject({ code: code.sessionExpire, message: message.emailLinkExpired });
                    }
                });
            }
            else {
                reject({ code: code.invalidDetails, message: message.invalidDetails });
            }
        }
        catch (e) {
            reject({ code: code.invalidDetails, message: message.tryCatch, data: e });
        }
    });
}

/**
 * API for user login
 * @param {*} req (email address & password)
 * @param {*} res (json with success/failure)
*/
function login(info) {
    return new Promise((resolve, reject) => {
        try {
            if (validator.isEmail(info.data.emailAddress)) {
                const sqlQuery = 'SELECT id, firstName, middleName, lastName, address, emailAddress, userPassword, mobileNumber, isEmailVerified, isActive FROM user WHERE emailAddress = ?';
                con.query(sqlQuery, [info.data.emailAddress], (err, userDetails) => {
                    if (err) {
                        reject({ code: code.dbCode, message: message.dbError, data: err });
                    }
                    else if (userDetails.length > 0) {
                        const password = functions.decryptPassword(userDetails[0].userPassword);
                        console.log(userDetails[0])
                        if (password === info.data.userPassword) {
                            if (userDetails[0].isActive === 1) {
                                if (userDetails[0].isEmailVerified === 1) {
                                    delete userDetails[0].userPassword;
                                    delete userDetails[0].isEmailVerified;
                                    delete userDetails[0].isActive;

                                    resolve({ code: code.success, message: message.success, data: userDetails });
                                }
                                else {
                                    reject({ code: code.invalidDetails, message: message.emailVerify });
                                }
                            }
                            else {
                                reject({ code: code.invalidDetails, message: message.accountDisable });
                            }
                        }
                        else {
                            reject({ code: code.invalidDetails, message: message.invalidLoginDetails });
                        }
                    }
                    else {
                        reject({ code: code.invalidDetails, message: message.invalidLoginDetails });
                    }
                });
            }
            else {
                reject({ code: code.invalidDetails, message: message.invalidLoginDetails });
            }
        }
        catch (e) {
            reject({ code: code.invalidDetails, message: message.tryCatch, data: e });
        }
    });
}

/**
 * API to Change password
 * @param {*} req (encrypted token with old password, token, new password ) 
 * @param {*} res (json with success/failure)
 */
function changePassword(info, id) {
    return new Promise((resolve, reject) => {
        try {
            console.log(info, id);
            con.query('SELECT userPassword FROM user WHERE id = ?', [id], function (err, passwordDetails) {
                if (err) {
                    reject({ code: code.dbCode, message: message.dbError, data: err });
                }
                else if (passwordDetails.length > 0) {
                    let password = functions.decryptPassword(passwordDetails[0].userPassword);

                    if (password === info.data.oldPassword) {
                        // Encrypt password for the user
                        password = functions.encryptPassword(info.data.newPassword);

                        con.query('UPDATE user SET userPassword = ? WHERE id = ?', [password, id], (err, passUpdateDetails) => {
                            if (err) {
                                reject({ code: code.dbCode, message: message.dbError, data: err });
                            }
                            else {
                                resolve({ code: code.success, message: message.passwordChanged });
                            }
                        });
                    }
                    else {
                        reject({ code: code.invalidDetails, message: message.invalidDetails });
                    }
                }
                else {
                    reject({ code: code.invalidDetails, message: message.invalidDetails });
                }
            });
        }
        catch (e) {
            reject({ code: code.invalidDetails, message: message.tryCatch, data: e });
        }
    });
};

/**
 * API for Forget Password
 * @param {*} req (encrypted token with old password, token ) 
 * @param {*} res (json with success/failure)
 */
function forgotPassword(info) {
    return new Promise((resolve, reject) => {
        try {
            if (validator.isEmail(info.data.emailAddress)) {
                con.query('SELECT emailId, fullName FROM user WHERE emailId = ?', [info.data.emailId], (err, result) => {
                    if (err) {
                        reject({ code: code.dbCode, message: message.dbError, data: err });
                    }
                    else if (result.length > 0) {
                        var to = result[0].emailId;
                        var enc_username = functions.encryptPassword(to);
                        enc_username = Buffer.from(enc_username, 'ascii').toString('hex');

                        var token = functions.tokenEncrypt(result[0].emailId);
                        token = Buffer.from(token, 'ascii').toString('hex');

                        var subject = "CMX Portal, Forgot password link";
                        var link = config.resetPasswordLink + enc_username + '/' + token;
                        var message = fs.readFileSync('./modules/emailtemplate/reset.html', 'utf8').toString();
                        message = message.replace("$fullname", result[0].fullName).replace("$link", link).replace("$emailId", config.supportEmail);

                        functions.sendEmail(to, subject, message, function (err, result) {
                            if (result) {
                                resolve({ code: msg.successCode, message: msg.successResetPasswordLinkMsg, data: null });
                            }
                            else {
                                reject({ code: msg.internalServerCode, message: msg.internalServalMsg, data: null });
                            }
                        });
                    }
                    else {
                        reject({ code: msg.noContentCode, message: 'Reset link sent successfully. You will receive a link shortly if a user is registered.', data: null });
                    }
                });
            }
            else {
                reject({ code: msg.fieldRequiredCode, message: msg.emailMissingMsg, data: null });
            }
        }
        catch (e) {
            reject({ code: msg.internalServerCode, message: msg.internalServalMsg, data: e });
        }
    });
};

/**
 * API for Reset Password
 * @param {*} req (encrypted token with new password, emailId ) 
 * @param {*} res (json with success/failure)
 */
function resetPassword(info) {
    return new Promise((resolve, reject) => {
        try {
            const buf1 = Buffer.from(info.emailId, 'hex').toString('ascii');
            const emailId = functions.decryptPassword(buf1);

            if (emailId) {
                var token = Buffer.from(info.token, 'hex').toString('ascii');
                functions.tokenDecrypt(token, function (err, result) {
                    if (result) {
                        //Encrypt password for the user
                        var password = functions.encryptPassword(info.newPassword);

                        con.query('UPDATE user SET password = ? WHERE emailId = ?', [password, emailId], function (err, result) {
                            if (err) {
                                reject({ code: msg.internalServerCode, message: msg.internalServalMsg, data: err });
                            }
                            else {
                                resolve({ code: msg.successCode, message: msg.successResetPasswordMsg, data: result });
                            }
                        });
                    }
                    else {
                        reject({ code: msg.sessionCode, message: msg.sessionLinkExpired, data: null });
                    }
                });
            }
            else {
                reject({ code: msg.invalidRequestCode, message: msg.invalidRequestLinkMsg, data: null });
            }
        }
        catch (e) {
            reject({ code: msg.internalServerCode, message: msg.internalServalMsg, data: e });
        }
    });
}

/**
 * API to update profile
 * @param {*} req (encrypted token with token ) 
 * @param {*} res (json with success/failure)
 */
function updateProfile(info, id) {
    return new Promise((resolve, reject) => {
        try {
            if (info.data.firstName && info.data.lastName && info.data.countryId) {
                con.query('UPDATE users SET firstName = ?, middleName = ?, lastName = ?, twitterAccount = ?, telegramAccount = ?, countryId = ? WHERE id= ?', [info.data.firstName, info.data.middleName, info.data.lastName, info.data.twitterAccount, info.data.telegramAccount, info.data.countryId, id], function (err, result) {
                    if (err) {
                        reject({
                            code: "02",
                            message: msg.dbconnection,
                            data: err
                        });
                    }
                    else {
                        resolve({
                            code: "00",
                            message: 'Profile updated successfully',
                            data: null
                        });
                    }
                });
            }
            else {
                reject({
                    code: "01",
                    message: 'Please fill all required fields',
                    data: null
                });
            }
        }
        catch (e) {
            reject({
                code: "01",
                message: msg.tryCatchMsg,
                data: e
            });
        }
    });
};

/**
 * API for user history
 * @param {*} req (userId)
 * @param {*} res (json with success/failure)
 */
function userInformation(id) {
    return new Promise((resolve, reject) => {
        try {
            con.query('SELECT u.firstName, u.middleName, u.lastName, u.telegramAccount, u.twitterAccount, u.countryId FROM users u WHERE u.id = ?', [id], function (err, result) {
                if (err) {
                    reject({
                        code: "02",
                        message: msg.dbconnection,
                        data: err
                    });
                }
                else if (result.length > 0) {
                    resolve({
                        code: "00",
                        message: "Success",
                        data: result
                    });
                }
                else {
                    resolve({
                        code: "00",
                        message: msg.noData,
                        data: result
                    });
                }
            });
        }
        catch (e) {
            reject({
                code: "01",
                message: msg.tryCatchMsg,
                data: e
            });
        }
    });
};

module.exports = {
    registration,
    login,
    verifyEmail,
    changePassword
};