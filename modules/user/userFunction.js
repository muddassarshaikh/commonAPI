const con = require('../database/databaseConnector');
const functions = require('../common/functions');
const config = require('../../config');
const validator = require('validator');
const code = require('../common/code');
const message = require('../common/message');

/**
 * API for user registration
 * @param {*} req (user detials)
 * @param {*} res (json with success/failure)
*/
function registration(info) {
    return new Promise((resolve, reject) => {
        try {
            if(validator.isEmail(info.data.emailAddress)) {
                const userPassword = functions.encryptPassword(info.data.userPassword);
                const sqlQuery = 'INSERT INTO user(firstName, middleName, lastName, emailAddress, userPassword, address, mobileNumber) VALUES (?, ?, ?, ?, ?, ?, ?)';
                con.query(sqlQuery, [info.data.firstName, info.data.middleName, info.data.lastName, info.data.emailAddress, userPassword, info.data.address, info.data.mobileNumber], (err, regDetails) => {
                    if(err) {
                        reject({ code: code.dbCode, message: message.dbError, data: err });
                    }
                    else {
                        resolve({ code: code.success, message: message.registration });
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

module.exports = {
    registration
};