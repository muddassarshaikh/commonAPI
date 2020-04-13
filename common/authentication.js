const functions = require('./functions');
const code = require('./code');
const message = require('./message');

const authenticationController = {
  validateToken: async (req, res, next) => {
    try {
      if (req.headers.auth) {
        const tokenDecryptInfo = await functions.tokenDecrypt(req.headers.auth);

        if (tokenDecryptInfo.data) {
          res.locals.tokenInfo = tokenDecryptInfo.data;
          const token = await functions.tokenEncrypt(tokenDecryptInfo.data);
          res.header('auth', token);
          next();
        } else {
          res.send(
            functions.responseGenerator(
              code.sessionExpire,
              message.sessionExpire
            )
          );
        }
      } else {
        res.send(
          functions.responseGenerator(code.invalidDetails, message.tokenMissing)
        );
      }
    } catch (e) {
      res.send(
        functions.responseGenerator(
          code.invalidDetails,
          message.tryCatch,
          e.message
        )
      );
    }
  },

  validateAdmin: (req, res, next) => {
    try {
      if (res.locals.tokenInfo.isAdmin === 1) {
        next();
      } else {
        res.send(
          functions.responseGenerator(
            code.invalidDetails,
            message.notAuthorized
          )
        );
      }
    } catch (e) {
      res.send(
        functions.responseGenerator(
          code.invalidDetails,
          message.tryCatch,
          e.message
        )
      );
    }
  },

  decryptRequest: (req, res, next) => {
    try {
      if (req.body) {
        const userinfo = functions.decryptData(req.body);
        res.locals.requestedData = userinfo;
        next();
      } else {
        res.send(
          functions.responseGenerator(code.invalidDetails, message.dataIssue)
        );
      }
    } catch (e) {
      res.send(
        functions.responseGenerator(
          code.invalidDetails,
          message.tryCatch,
          e.message
        )
      );
    }
  }
};

module.exports = authenticationController;
