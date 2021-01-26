const express = require('express');
const auth = require('../../middleware/auth');

const router = express.Router();

// import Job model
const JobApplication = require('../../models/JobapplicationModel');
const Job = require('../../models/JobModel');

router.patch('/:id/status_update', auth, async (req, res) => {
  try {
    const jobApplicationToUpdate = await JobApplication.findById(req.params.id);
    const requiredJob = await JobApplication.findOne({
      _id: req.params.id,
    }).populate({
      path: 'job',
      select: 'id userId maxPosition',
      match: { userId: req.user.id },
    });
    if (requiredJob.job) {
      if (String(req.body.status) === 'shortlisted') {
        if (
          jobApplicationToUpdate.status === 'applied' ||
          jobApplicationToUpdate.status === 'shortlisted'
        ) {
          await JobApplication.updateOne(
            { _id: req.params.id },
            { status: req.body.status }
          );
          res.json({ msg: 'Success' });
        } else
          return res
            .status(400)
            .json({ msg: 'Only applied job application can be shortlisted' });
      }
      if (String(req.body.status) === 'accepted') {
        if (jobApplicationToUpdate.status === 'rejected')
          return res
            .status(400)
            .json({ msg: 'This applicaiton is already rejected' });
        const acceptedApplication = await JobApplication.countDocuments({
          job: jobApplicationToUpdate.job,
          status: 'accepted',
        });
        if (acceptedApplication >= requiredJob.job.maxPosition)
          return res
            .status(400)
            .json({ msg: 'All positions are already filled' });
        await JobApplication.updateMany(
          { jobApplicant: jobApplicationToUpdate.jobApplicant },
          { status: 'rejected' }
        );
        await JobApplication.updateOne(
          { _id: req.params.id },
          { status: 'accepted', dateOfAcceptence: Date.now() }
        );
        if (acceptedApplication + 1 === requiredJob.job.maxPosition)
          await JobApplication.updateMany(
            { job: req.params.id, status: { $ne: 'accepted' } },
            { status: 'rejected' }
          );
        res.json({ msg: 'Success' });
      }
      if (String(req.body.status) === 'rejected') {
        if (jobApplicationToUpdate.status === 'accepted') {
          return res
            .status(400)
            .json({ msg: 'This application has already been accepted' });
        }
        await JobApplication.updateOne(
          { _id: req.params.id },
          { status: 'rejected' }
        );
        res.json({ msg: 'Success' });
      }
    } else
      return res
        .status(400)
        .json({ msg: 'You are not the recuiter of this job' });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const jobApplications = await JobApplication.find({
      jobApplicant: req.user.id,
    }).lean();
    for (let i = 0; i < jobApplications.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const jobRecuiter = await Job.findById(jobApplications[i].job).populate({
        path: 'userId',
        select: 'name',
      });
      jobApplications[i] = {
        // eslint-disable-next-line node/no-unsupported-features/es-syntax
        ...jobApplications[i],
        name: jobRecuiter.userId.name,
        title: jobRecuiter.title,
        salary: jobRecuiter.salary,
      };
    }
    res.json(jobApplications);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/accepted', auth, async (req, res) => {
  try {
    const jobsCreated = await Job.find({
      userId: req.user.id,
    });
    let employees = [];
    for (let i = 0; i < jobsCreated.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const jobApplicationsByOne = await JobApplication.find({
        job: jobsCreated[i]._id,
        status: 'accepted',
      }).populate({ path: 'jobApplicant', select: 'name rating' });
      for (let j = 0; j < jobApplicationsByOne.length; j += 1)
        employees = [
          ...employees,
          {
            name: jobApplicationsByOne[j].jobApplicant.name,
            dateOfAcceptence: jobApplicationsByOne[j].dateOfAcceptence,
            type: jobsCreated[i].typeOfJob,
            title: jobsCreated[i].title,
            id: jobApplicationsByOne[j].jobApplicant._id,
            rating: jobApplicationsByOne[j].jobApplicant.rating,
          },
        ];
    }
    res.json(employees);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const applications = await JobApplication.find({
      job: req.params.id,
      status: { $ne: 'rejected' },
    })
      .populate({
        path: 'jobApplicant',
        select: 'name rating skills education',
      })
      .lean();
    res.json(applications);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
