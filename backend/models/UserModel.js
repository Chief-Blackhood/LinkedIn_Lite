const mongoose = require('mongoose');
const Bcrypt = require('bcryptjs');

const { Schema } = mongoose;

// Create Schema
const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['Job Applicant', 'Recuiter'],
      required: true,
    },
  },
  { discriminatorKey: 'type' }
);

UserSchema.pre('save', function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = Bcrypt.hashSync(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = function (plaintext) {
  return Bcrypt.compareSync(plaintext, this.password);
};

const User = mongoose.model('User', UserSchema);
module.exports = User;
