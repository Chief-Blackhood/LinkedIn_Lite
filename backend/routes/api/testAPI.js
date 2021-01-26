const express = require('express');

const router = express.Router();

// GET request
// Just a test API to check if server is working properly or not
router.get('/', (req, res) => res.send('API is working properly !'));

module.exports = router;
