const express = require('express');
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

const router = express.Router();

// import Job model
const JobApplication = require('../../models/JobapplicationModel');
const User = require('../../models/UserModel');
const JobApplicant = require('../../models/JobApplicantModel');
const Recuiter = require('../../models/RecuiterModel');

router.post('/:id/rate', auth, [check('rating').exists()], async (req, res) => {
  try {
    const errors = await validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    if (req.body.rating > 5 || req.body.rating <= 0) {
      return res.status(400).json({ msg: 'Rating must be in between 1 and 5' });
    }
    const raterInfo = await User.findById(req.user.id);
    if (String(raterInfo.type) === 'Recuiter') {
      const requiredJob = await JobApplication.findOne({
        jobApplicant: req.params.id,
        status: 'accepted',
      }).populate({
        path: 'job',
        select: 'id userId',
        match: { userId: req.user.id },
      });
      if (requiredJob.job) {
        const { rating } = req.body;
        const value = rating;
        const userId = req.user.id;
        const updateUser = await JobApplicant.findOneAndUpdate(
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
        if (!updateUser)
          return res
            .status(400)
            .json({ msg: 'You have already rated this user' });
        res.json(updateUser);
      } else return res.status(400).json({ msg: 'You did not hire this user' });
    } else return res.status(400).json({ msg: 'You are not a recruiter' });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.put('/me', auth, [check('name').trim()], async (req, res) => {
  try {
    const { name, bio, contactNo, education, skills } = req.body;
    const userInfo = await User.findById(req.user.id);
    let result;
    if (!req.body.name)
      return res.status(400).json({ msg: 'Name can not be empty string' });
    if (userInfo.type === 'Recuiter') {
      if (String(contactNo).length !== 10)
        return res
          .status(400)
          .json({ msg: 'Contact number should be of 10 digits' });
      if (String(bio).split(' ').length > 250)
        return res
          .status(400)
          .json({ msg: 'Bio should be less than 250 words' });
      result = await Recuiter.findByIdAndUpdate(
        req.user.id,
        {
          name,
          bio,
          contactNo,
        },
        { new: true }
      );
    } else if (String(userInfo.type) === 'Job Applicant') {
      const curYear = new Date().getFullYear();
      if (education) {
        for (let i = 0; i < education.length; i += 1) {
          if (education[i].startYear) {
            if (education[i].startYear > curYear)
              return res
                .status(400)
                .json({ msg: 'Start year can not be in the future' });
          } else {
            return res.status(400).json({ msg: 'Start year is required' });
          }
          if (education[i].endYear) {
            if (education[i].endYear < education[i].startYear) {
              return res
                .status(400)
                .json({ msg: 'Start year must be earlier than end year' });
            }
          }
        }
      }
      result = await JobApplicant.findByIdAndUpdate(
        req.user.id,
        {
          name,
          education,
          skills,
        },
        { new: true }
      );
    }
    res.json(result);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const userInfo = await User.findById(req.user.id).select('-password');
    if (userInfo) {
      return res.json(userInfo);
    }
    return res.status(400).json({ msg: 'User does not exists' });
  } catch (err) {
    res.status(400).json(err);
  }
});

module.exports = router;
