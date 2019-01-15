const method = require('./fileOperationFunction');
const functions = require('../common/functions');

const fileOperationController = {

    // Upload CSV file into mongo database
    uploadDataInMongo: (req, res, next) => {
        method.uploadDataInMongo(req.files).then(data => {
            res.send(functions.responseGenerator(data.code, data.message , data.data));
        }).catch(error => {
            res.send(functions.responseGenerator(error.code, error.message , error.data));
        });
    }
}

module.exports = fileOperationController;