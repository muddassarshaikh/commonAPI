const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    emailAddress: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: (text) => {
          if (text !== null && text.length > 0) {
            const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(text);
          }
          return false;
        },
        message: 'Invalid email address',
      },
    },
    userPassword: String,
    mobileNumber: String,
    isEmailVerified: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Number,
      default: 1,
    },
    isDeleted: {
      type: Number,
      default: 0,
    },
    profileURL: String,
  },
  { timestamps: true, collection: 'users' }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
