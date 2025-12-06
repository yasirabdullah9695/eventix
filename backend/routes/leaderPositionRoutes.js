
const express = require('express');
const router = express.Router();
const { getLeaderPositions, createLeaderPosition, getVotingResults } = require('../controllers/leaderPositionController');

const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/').get(protect, getLeaderPositions).post(protect, authorize('admin'), createLeaderPosition);
router.route('/voting-results').get(getVotingResults);

module.exports = router;
