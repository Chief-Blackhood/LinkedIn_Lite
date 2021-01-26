const mongoose = require('mongoose');
const User = require('./UserModel');

const Recuiter = User.discriminator(
  'Recuiter',
  new mongoose.Schema({
    contactNo: {
      type: Number,
      min: 1000000000,
      max: 9999999999,
      unique: true,
    },
    bio: String, // validate in backend for not more than 250 words
  })
);

module.exports = Recuiter;
