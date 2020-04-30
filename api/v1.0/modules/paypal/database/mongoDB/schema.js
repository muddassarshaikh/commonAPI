const mongoose = require('mongoose');

const paypalSchema = mongoose.Schema(
  {},
  { timestamps: true, collection: 'paypal' }
);

const Paypal = mongoose.model('Paypal', paypalSchema);

module.exports = Paypal;
