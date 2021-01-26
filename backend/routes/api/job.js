const express = require('express');
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

const router = express.Router();

// import Job model
const Job = require('../../models/JobModel');
const JobApplication = require('../../models/JobapplicationModel');
const User = require('../../models/UserModel');

router.post(
  '/',
  auth,
  [
    check('title').exists().trim(),
    check('maxApplication').exists(),
    check('maxPosition').exists(),
    check('salary').exists(),
    check('deadline').exists(),
    check('typeOfJob').exists(),
    check('duration').exists(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }
      if (!req.body.title)
        return res.status(400).json({ msg: 'Title can not be empty string' });
      const user = await User.findById(req.user.id);
      if (String(user.type) !== 'Recuiter')
        return res.status(400).json({ msg: 'Only recuiters can post jobs' });
      if (
        req.body.maxApplication < 0 ||
        req.body.maxPosition < 0 ||
        req.body.salary < 0
      ) {
        return res.status(400).json({
          msg:
            'Maximum value of application and position or Salary can not be negative',
        });
      }
      req.body.deadline = new Date(req.body.deadline);
      req.body.userId = user.id;
      const newJob = new Job(req.body);
      const result = await newJob.save();
      res.json(result);
    } catch (err) {
      res.status(400).json(err);
    }
  }
);

router.post('/:id/apply', auth, [check('sop').exists()], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const user = await User.findById(req.user.id);
    if (String(user.type) !== 'Job Applicant')
      return res
        .status(400)
        .json({ msg: 'Only Job Applicant can apply for jobs' });

    const acceptedSomewhere = await JobApplication.findOne({
      jobApplicant: req.user.id,
      status: 'accepted',
    });
    if (acceptedSomewhere)
      return res
        .status(405)
        .json({ msg: 'You are accepted somewhere already' });
    req.body.jobApplicant = user.id;
    req.body.job = req.params.id;
    const count = await JobApplication.countDocuments({
      jobApplicant: user.id,
      status: 'applied',
    });
    if (count >= 10)
      return res
        .status(400)
        .json({ msg: 'Job Applicant can not apply for more than 10 jobs' });
    if (String(req.body.sop).split(' ').length > 250)
      return res.status(400).json({ msg: 'SOP should be less than 250 words' });
    if (req.body.dateOfPosting) {
      req.body.dateOfPosting = new Date(req.body.dateOfPosting);
    }
    if (req.body.dateOfAcceptence) {
      req.body.dateOfAcceptence = new Date(req.body.dateOfAcceptence);
    }
    const jobExists = await Job.findById(req.params.id);
    if (!jobExists) return res.status(400).json({ msg: 'Job does not exists' });
    const curDate = Date.now();
    const deadlinePassed = await Job.findById(req.params.id);
    if (curDate > deadlinePassed.deadline)
      return res
        .status(400)
        .json({ msg: 'Deadline has passed for application' });
    const alreadyApplied = await JobApplication.findOne({
      job: req.params.id,
      jobApplicant: req.user.id,
    });
    if (alreadyApplied)
      return res
        .status(400)
        .json({ msg: 'You have already applied for the job' });
    const positionFilled = await JobApplication.countDocuments({
      job: req.params.id,
      status: 'accepted',
    });
    if (positionFilled >= jobExists.maxPosition)
      return res
        .status(400)
        .json({ msg: 'All position for this job has been filled' });
    const applicationFilled = await JobApplication.countDocuments({
      job: req.params.id,
      status: { $in: ['accepted', 'shortlisted'] },
    });
    if (applicationFilled >= jobExists.maxApplication)
      return res
        .status(400)
        .json({ msg: 'Maximum application for this job has been filled' });
    const newJobApplication = new JobApplication(req.body);
    const result = await newJobApplication.save();
    res.json(result);
  } catch (err) {
    res.json(err);
  }
});

router.post('/:id/rate', auth, [check('rating').exists()], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    if (req.body.rating > 5 || req.body.rating <= 0) {
      return res.status(400).json({ msg: 'Rating must be in between 1 and 5' });
    }
    const user = await JobApplication.findOne({
      job: req.params.id,
      jobApplicant: req.user.id,
      status: 'accepted',
    });
    const { rating } = req.body;
    const value = rating;
    const userId = req.user.id;
    if (user) {
      const updateJob = await Job.findOneAndUpdate(
        { _id: req.params.id, 'rating.raterId': { $ne: userId } },
        {
          $addToSet: {
            rating: {
              raterId: userId,
              rate: value,
            },
          },
        },
        { useFindAndModify: false, new: true }
      );
      if (!updateJob)
        return res.status(400).json({ msg: 'You have already rated this job' });
      res.json(updateJob);
    } else
      return res
        .status(400)
        .json({ msg: 'You are not a employee working on this posiiton' });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const checkForId = await Job.findById(req.params.id);
    if (String(req.user.id) === String(checkForId.userId)) {
      await JobApplication.deleteMany({
        job: req.params.id,
      });
      const jobToDelete = await Job.findByIdAndRemove(req.params.id);
      res.json(jobToDelete);
    } else
      return res
        .status(400)
        .json({ msg: 'You are not authorised to delete this job' });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.patch('/:id', auth, async (req, res) => {
  try {
    const { maxApplication, maxPosition } = req.body;
    let { deadline } = req.body;
    const jobToUpdate = await Job.findById(req.params.id);
    if (String(jobToUpdate.userId) !== String(req.user.id))
      return res.status(400).json({ msg: 'You can not update this job' });
    if (maxApplication < 0 || maxPosition < 0)
      return res.status(400).json({
        msg: 'Number of applications and positions can not be negative',
      });
    deadline = new Date(deadline);
    const result = await Job.findByIdAndUpdate(
      req.params.id,
      {
        maxApplication,
        maxPosition,
        deadline,
      },
      { useFindAndModify: false, new: true }
    );
    res.json(result);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const jobs = await Job.find({ deadline: { $gt: Date.now() } })
      .populate({
        path: 'userId',
        select: 'name',
      })
      .lean();
    for (let i = 0; i < jobs.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const positionFilled = await JobApplication.countDocuments({
        job: jobs[i]._id,
        status: 'accepted',
      });
      // eslint-disable-next-line no-await-in-loop
      const applied = await JobApplication.findOne({
        job: jobs[i]._id,
        jobApplicant: req.user.id,
      });
      const remaining = jobs[i].maxPosition - positionFilled;
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      jobs[i] = { ...jobs[i], remaining };
      if (applied) {
        // eslint-disable-next-line node/no-unsupported-features/es-syntax
        jobs[i] = { ...jobs[i], status: 'applied' };
      }
    }
    return res.json(jobs);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/mine', auth, async (req, res) => {
  try {
    // eslint-disable-next-line prefer-const
    let myJobs = await Job.find({
      userId: req.user.id,
    }).lean();
    for (let i = 0; i < myJobs.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const countApplicant = await JobApplication.countDocuments({
        job: myJobs[i]._id,
      });
      // eslint-disable-next-line no-await-in-loop
      let remaining = await JobApplication.countDocuments({
        job: myJobs[i]._id,
        status: 'accepted',
      });
      remaining = myJobs[i].maxPosition - remaining;
      myJobs[i] = {
        // eslint-disable-next-line node/no-unsupported-features/es-syntax
        ...myJobs[i],
        remaining,
        numberOfApplicant: countApplicant,
      };
    }
    myJobs = myJobs.filter((a) => a.remaining !== 0);
    res.json(myJobs);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
