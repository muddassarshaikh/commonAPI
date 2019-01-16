const mongoose = require('mongoose');
 
const userSchema = mongoose.Schema({
    
    firstName: {
        type: String,
        required: true
    },
    
    lastName: String,

    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: (text) => {
                if (text !== null && text.length > 0)
                {
                    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    return re.test(text);
                }
                return false;
            },
            message: 'Invalid email address'
        }
    },
    
    twitter: {
        type: String,
        validate: {
            validator: (text) => {
                if (text !== null && text.length > 0)
                    return text.indexOf('https://twitter.com/') === 0;
                 
                return true;
            },
            message: 'Twitter handle must start with https://twitter.com/'
        }
    },

    facebook: {
        type: String,
        validate: {
            validator: function(text) {
                if (text !== null && text.length > 0)
                    return text.indexOf('https://www.facebook.com/') === 0;
                 
                return true;
            },
            message: 'Facebook Page must start with https://www.facebook.com/'
        }
    },

    linkedin: {
        type: String,
        validate: {
            validator: function(text) {
                if (text !== null && text.length > 0)
                    return text.indexOf('https://www.linkedin.com/') === 0;
                 
                return true;
            },
            message: 'LinkedIn must start with https://www.linkedin.com/'
        }
    },

    mobileNumber: String,
    address: String
}, { timestamps: true, collection: 'user' });
 
var user = mongoose.model('user', userSchema);
 
module.exports = user;