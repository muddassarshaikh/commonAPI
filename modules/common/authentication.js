const functions = require("./functions");
const code = require("./code");
const message = require("./message");

const authenticationController = {
  validateToken: async (req, res, next) => {
    try {
      if (req.headers.auth) {
        const tokenDecryptInfo = await functions.tokenDecrypt(req.headers.auth);

        if (tokenDecryptInfo.data) {
          res.locals.tokenInfo = tokenDecryptInfo.data;
          const token = await functions.tokenEncrypt(tokenDecryptInfo.data);
          res.header("auth", token);
          next();
        } else {
          res.send(functions.responseGenerator(code.sessionExpire, message.sessionExpire));
        }
      } else {
        res.send(functions.responseGenerator(code.invalidDetails, message.tokenMissing));
      }
    } catch (e) {
      console.log(e);
      res.send(functions.responseGenerator(code.invalidDetails, message.tryCatch, e));
    }
  },

  decryptRequest: (req, res, next) => {
    try {
      if (req.body.encRequest) {
        const userinfo = functions.decryptData(req.body.encRequest);
        res.locals.requestedData = userinfo;
        next();
      } else {
        res.send(functions.responseGenerator(code.invalidDetails, message.dataIssue));
      }
    } catch (e) {
      console.log(e);
      res.send(functions.responseGenerator(code.invalidDetails, message.tryCatch, e));
    }
  }
};

module.exports = authenticationController;
