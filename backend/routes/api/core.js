const express = require('express');
const config = require('config');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

const router = express.Router();

// Load User model

const Recuiter = require('../../models/RecuiterModel');
const JobApplicant = require('../../models/JobApplicantModel');
const User = require('../../models/UserModel');

// @route POST api/core
// @desc Register new user
// @auth public
router.post(
  '/register',
  [
    check('name').exists().trim(),
    check('email').exists().isEmail().normalizeEmail(),
    check('password').exists().isLength({ min: 6 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }
      if (!req.body.name)
        return res.status(400).json({ msg: 'Name can not be empty string' });
      let newUser;

      // check for existing user
      const user = await User.findOne({ email: req.body.email }).exec();
      if (user) return res.status(400).json({ msg: 'User already exists' });
      if (req.body.type === 'Recuiter') {
        if (String(req.body.contactNo).length !== 10)
          return res
            .status(400)
            .json({ msg: 'Contact number should be of 10 digits' });
        if (String(req.body.bio).split(' ').length > 250)
          return res
            .status(400)
            .json({ msg: 'Bio should be less than 250 words' });
        newUser = new Recuiter(req.body);
      } else if (String(req.body.type) === 'Job Applicant') {
        const curYear = new Date().getFullYear();
        if (req.body.education) {
          for (let i = 0; i < req.body.education.length; i += 1) {
            if (req.body.education[i].startYear) {
              if (req.body.education[i].startYear > curYear)
                return res
                  .status(400)
                  .json({ msg: 'Start year can not be in the future' });
            } else {
              return res.status(400).json({ msg: 'Start year is required' });
            }
            if (req.body.education[i].endYear) {
              if (
                Number(req.body.education[i].endYear) <
                Number(req.body.education[i].startYear)
              ) {
                return res
                  .status(400)
                  .json({ msg: 'Start year must be earlier than end year' });
              }
            }
          }
        }
        newUser = new JobApplicant(req.body);
      } else return res.status(400).json({ msg: 'Role of user is required' });
      const result = await newUser.save();
      jwt.sign({ id: newUser.id }, config.get('jwtSecret'), (err, token) => {
        if (err) throw err;
        res.status(200).json({
          token,
          user: {
            id: result.id,
            name: result.name,
            email: result.email,
            type: result.type,
          },
        });
      });
    } catch (err) {
      res.status(500).send(err);
    }
  }
);

// @route POST api/core
// @desc Register new user
// @auth public
router.post(
  '/login',
  [
    check('email').exists().isEmail().normalizeEmail(),
    check('password').exists(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      // check for existing user
      const user = await User.findOne({ email: req.body.email }).exec();
      if (!user) return res.status(400).json({ msg: 'User does not exists' });
      const isMatch = await user.comparePassword(req.body.password);
      if (!isMatch) return res.status(400).json({ msg: 'Invalid Credential' });
      jwt.sign(
        { id: user.id },
        config.get('jwtSecret'),
        { expiresIn: 7200 },
        (err, token) => {
          if (err) throw err;
          res.json({
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              type: user.type,
            },
          });
        }
      );
    } catch (err) {
      res.status(500).send(err);
    }
  }
);

// @route GET api/auth/user
// @desc Get user data
// @access private
router.get('/user', auth, async (req, res) => {
  const result = await User.findById(req.user.id).select('-password');
  res.json(result);
});

module.exports = router;
