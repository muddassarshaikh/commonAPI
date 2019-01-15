const db = require('../database/mongo');
const functions = require('../common/functions');
const config = require('../../config');
const validator = require('validator');
const code = require('../common/code');
const message = require('../common/message');
const csv = require('csvtojson')

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
                jsonObj.forEach(item => {
                    console.log(item.Email);
                })
            });

            console.log(info);
        }
        catch (e) {
            reject({ code: code.invalidDetails, message: message.tryCatch, data: e });
        }
    });
};

module.exports = {
    uploadDataInMongo
};