const con = require('../database/databaseConnector');
const config = require('../../config');
const CryptoJS = require("crypto-js");
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');
const status = config.env;

/**
 * Function for Encrypting the data
 * @param {*} data (data to encrypt) 
 * @param {*} return (encrypted data)
 */
function encryptData(data)
{
    if(status === 'development')
    {
        return {encResponse: data};
    }
    else
    {
        var dataString = JSON.stringify(data);
        var response = CryptoJS.AES.encrypt(dataString, config.cryptokey);
        return {encResponse: response.toString()};
    }
}

/**
 * Function for decrypting the data
 * @param {*} data (data to decrypt) 
 * @param {*} return (decrypt data)
 */
function decryptData(data)
{
    if(status === 'development')
    {
        return data;
    }
    else
    {
        var decrypted = CryptoJS.AES.decrypt(data, config.cryptokey);
        if(decrypted)
        {
            var userinfo = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
            return userinfo;
        }
        else
        {
            return {"userinfo": { "error": "Please send proper token"}};
        }
    }
}

/**
 * Function for Encrypting the password
 * @param {*} data (data to encrypt) 
 * @param {*} return (encrypted data)
 */
function encryptPassword(data)
{
    var response = CryptoJS.AES.encrypt(data, config.tokenkey);
    return response.toString();
}

/**
 * Function for decrypting the password
 * @param {*} data (data to decrypt) 
 * @param {*} return (decrypt data)
 */
function decryptPassword(data)
{
    var decrypted = CryptoJS.AES.decrypt(data, config.tokenkey);
    if(decrypted)
    {
        var userinfo = decrypted.toString(CryptoJS.enc.Utf8);
        return userinfo;
    }
    else
    {
        return {"userinfo": { "error": "Please send proper token"}};
    }
}

/**
 * Function for encryting the userId with session 
 * @param {*} data (data to encrypt) 
 * @param {*} return (encrypted data)
 */
function tokenEncrypt(data)
{
    var token = jwt.sign({data: data}, config.tokenkey, { expiresIn: 20 * 60 });    // Expires in 20 minutes 
    return token;   
}

/**
 * Function for decryting the userId with session 
 * @param {*} data (data to decrypt) 
 * @param {*} return (decrypted data)
 */
function tokenDecrypt(data, callback)
{
    jwt.verify(data, config.tokenkey, function(err, decoded) {
        callback(err, decoded);
    });
}

/**
 * Function for creating response 
 * @param {*} data (status, data, token) 
 * @param {*} return (encrypted data)
 */
function responseGenerator(code, message, data = '') 
{
    var details = {
        "status": {"code": code, "message": message},
        "result": data,
    };
    
    console.log(details);

    if(status === "development")
    {
        return details;
    }
    else
    {
        return encryptData(details);
    }
}

/**
 * Function for sending email  
 * @param {*} data (to, sub) 
 * @param {*} return (decrypted data)
 */
function sendEmail(to, subject, message, callback) 
{
    var transporter = nodemailer.createTransport({
        host:'mail3.gridhost.co.uk',
        port: 465,
        auth: {
            user: 'register.hrbecoin@hrbe.io',
            pass: 'lc3cXzcds8FZLExhX3h9'
        }
    });

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'developers.winjit@gmail.com',
            pass: 'Winjit@123'
        }
    });
    
    var mailOptions = { 
        from: "developers.winjit@gmail.com",
        to: to,
        subject: subject,
        html: message
    }; 
    
    transporter.sendMail(mailOptions, function(err, info) {
        console.log(err);
        console.log(info);
        callback(err, info);
    });
}

/**
 * Function to randomly generate string
 * param 
 * return (err, result)
 */
function generateRandomString(callback)
{   
    var referralCode = randomstring.generate({
        length: 9,
        charset: 'alphanumeric',
        capitalization: 'uppercase'
    });

    callback(referralCode);
}

module.exports = {
    encryptData,
    decryptData,
    encryptPassword,
    decryptPassword,
    tokenEncrypt,
    tokenDecrypt,
    responseGenerator,
    sendEmail,
    generateRandomString
};