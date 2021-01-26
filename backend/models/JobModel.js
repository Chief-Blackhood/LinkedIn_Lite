const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  maxApplication: {
    type: Number,
    required: true,
  },
  maxPosition: {
    type: Number,
    required: true,
  },
  dateOfPosting: {
    type: Date,
    default: Date.now,
  },
  deadline: {
    type: Date,
    required: true,
  },
  skillset: [String],
  typeOfJob: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Work from home'],
    required: true,
  },
  duration: {
    type: Number,
    min: 0,
    max: 6,
    default: 0,
  },
  salary: {
    type: Number,
    required: true,
    get: (v) => Math.round(v),
    set: (v) => Math.round(v),
  },
  rating: {
    type: [
      {
        raterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rate: { type: Number, max: 5, min: 0 },
      },
    ],
  },
});

const Job = mongoose.model('Job', JobSchema);
module.exports = Job;
