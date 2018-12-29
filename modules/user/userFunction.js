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
                        console.log("token", token);

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
 * @param {*} req (old password, token, new password ) 
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
 * @param {*} req (email address ) 
 * @param {*} res (json with success/failure)
 */
function forgetPassword(info) {
    return new Promise((resolve, reject) => {
        try {
            if (validator.isEmail(info.data.emailAddress)) {
                con.query('SELECT emailAddress, firstName FROM user WHERE emailAddress = ?', [info.data.emailAddress], (err, userDetails) => {
                    if (err) {
                        reject({ code: code.dbCode, message: message.dbError, data: err });
                    }
                    else if (userDetails.length > 0) {
                        const to = userDetails[0].emailAddress;

                        let token = functions.tokenEncrypt(to);
                        token = Buffer.from(token, 'ascii').toString('hex');
                        console.log("token", token);

                        const subject = message.forgotPasswordSubject;
                        const link = config.resetPasswordLink + token;
                        let emailMessage = fs.readFileSync('./modules/emailtemplate/reset.html', 'utf8').toString();
                        emailMessage = emailMessage.replace("$fullname", userDetails[0].firstName).replace("$link", link).replace("$emailId", config.supportEmail);

                        functions.sendEmail(to, subject, emailMessage, function (err, result) {
                            if (result) {
                                resolve({ code: code.success, message: message.resetLink });
                            }
                            else {
                                reject({ code: code.invalidDetails, message: message.dbError });
                            }
                        });
                    }
                    else {
                        reject({ code: code.invalidDetails, message: message.invalidEmail });
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
 * API for Reset Password
 * @param {*} req (emailAddress ) 
 * @param {*} res (json with success/failure)
 */
function resetPassword(info) {
    return new Promise((resolve, reject) => {
        try {
            if (info.data.emailAddress) {
                const emailAddress = Buffer.from(info.data.emailAddress, 'hex').toString('ascii');
                functions.tokenDecrypt(emailAddress, function (err, emailAddressDetails) {
                    if (emailAddressDetails) {
                        //Encrypt password for the user
                        const password = functions.encryptPassword(info.data.newPassword);

                        con.query('UPDATE user SET userPassword = ? WHERE emailAddress = ?', [password, emailAddressDetails.data], (err, result) => {
                            if (err) {
                                reject({ code: code.dbCode, message: message.dbError, data: err });
                            }
                            else {
                                resolve({ code: code.success, message: message.passwordReset });
                            }
                        });
                    }
                    else {
                        reject({ code: code.invalidDetails, message: message.emailLinkExpired, data: null });
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
    changePassword,
    forgetPassword,
    resetPassword
};