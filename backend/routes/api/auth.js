const express = require('express');
const config = require('config');
const jwt = require('jsonwebtoken');
const auth = require('../../middleware/auth');

const router = express.Router();

// Load User model
const User = require('../../models/UserModel');

// @route POST api/auth
// @desc Auth user
// @auth public
router.post('/', async (req, res) => {
  try {
    const { email, password } = req.body;

    // simple validation
    if (!email || !password) {
      return res.status(400).json({ msg: 'Please enter all fields' });
    }

    // check for existing user
    const user = await User.findOne({ email: req.body.email }).exec();
    if (!user) return res.status(400).json({ msg: 'User does not exists' });

    // Validate password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credential' });
    jwt.sign({ id: user.id }, config.get('jwtSecret'), (err, token) => {
      if (err) throw err;
      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    });
  } catch (err) {
    res.status(500).send(err);
  }
});

// @route GET api/auth/user
// @desc Get user data
// @access private
router.get('/user', auth, async (req, res) => {
  const result = await User.findById(req.user.id).select('-password');
  res.json(result);
});
module.exports = router;
