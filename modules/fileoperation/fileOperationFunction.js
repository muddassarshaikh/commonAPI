const db = require('../database/mongo');
const functions = require('../common/functions');
const config = require('../../config');
const validator = require('validator');
const code = require('../common/code');
const message = require('../common/message');
const csv = require('csvtojson');
const userSchema = require('../database/schema/user');

/**
 * API for Uploading data from CSV into mongodb
 * @param {*} req (CSV file)
 * @param {*} res (json with success/failure)
*/
function uploadDataInMongo(info) {
    return new Promise((resolve, reject) => {
        try {
            const csvFilePath = info.file.path; 
            
            csv().fromFile(csvFilePath).then((jsonObj) => {
                const promises = jsonObj.map(item => {
                    return new Promise((resolve, reject) => {
                        const User = new userSchema(item);
                        User.save((err, userDetails) => {
                            if(err)
                            {
                                reject();
                            }
                            resolve();
                        });
                    });
                });
                
                Promise.all(promises).then(() => {
                    resolve({ code: code.success, message: message.csvDataAdded });
                }).catch(e => {
                    reject({ code: code.dbCode, message: message.dbError, data: err});
                });
            });
        }
        catch (e) {
            reject({ code: code.invalidDetails, message: message.tryCatch, data: e });
        }
    });
};

module.exports = {
    uploadDataInMongo
};