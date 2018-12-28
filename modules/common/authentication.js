const functions = require('./functions');
const code = require('./code');
const message = require('./message');

const authenticationController = {
    
    validateToken: (req, res, next) => {
        try
        {
            if(req.headers.auth)
            {          
                functions.tokenDecrypt(req.headers.auth, (err, result) => {
                    if(result)
                    {
                        if(result.data)
                        {
                            res.locals.id = result.data;
                            const token = functions.tokenEncrypt(result.data);
                            res.header('auth', token);
                            next();
                        }
                        else
                        {
                            res.send(functions.responseGenerator(code.invalidDetails, message.tokenIssue));
                        }
                    }
                    else
                    {
                        res.send(functions.responseGenerator(code.sessionExpire, message.sessionExpire));
                    }
                });
            }
            else
            {
                res.send(functions.responseGenerator(code.invalidDetails, message.tokenMissing));
            }
        }
        catch(e)
        {
            console.log(e);
            res.send(functions.responseGenerator(code.invalidDetails, message.tryCatch, e));
        }
    },
    
    decryptRequest: (req, res, next) => {
        try
        {
            if(req.body.encRequest)
            {
                const userinfo  = functions.decryptData(req.body.encRequest);
                res.locals.data = userinfo;
                next();
            }
            else
            {
                res.send(functions.responseGenerator(code.invalidDetails, message.dataIssue));
            }
        }
        catch(e)
        {
            console.log(e);
            res.send(functions.responseGenerator(code.invalidDetails, message.tryCatch, e));
        }
    }
}

module.exports = authenticationController;