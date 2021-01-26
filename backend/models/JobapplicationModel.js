const mongoose = require('mongoose');

const JobApplicationSchema = mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
  },
  jobApplicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['applied', 'shortlisted', 'accepted', 'rejected'],
    default: 'applied',
    required: true,
  },
  sop: { type: String, required: true },
  dateOfPosting: {
    type: Date,
    default: Date.now,
  },
  dateOfAcceptence: Date,
});

const JobApplication = mongoose.model('JobApplication', JobApplicationSchema);
module.exports = JobApplication;
