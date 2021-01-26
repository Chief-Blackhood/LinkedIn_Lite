const mongoose = require('mongoose');
const User = require('./UserModel');

const JobApplicant = User.discriminator(
  'Job Applicant',
  new mongoose.Schema({
    education: [
      {
        institution: String,
        startYear: {
          type: Number,
          max: Date.getFullYear,
          required: true,
        },
        endYear: {
          type: Number,
        },
      },
    ],
    skills: [String],
    rating: {
      type: [
        {
          raterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
          rate: { type: Number, max: 5, min: 0 },
        },
      ],
    },
  })
);

module.exports = JobApplicant;
