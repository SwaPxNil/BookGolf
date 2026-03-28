const express = require('express');
const router = express.Router();
const { getHandicapRating } = require('../controllers/courseController');

router.route('/').get(getHandicapRating);

module.exports = router;
