
const express = require('express');
const router = express.Router();
const { getVotes, createVote, getMyVotes, getVoteResults, declareResults, resetVoteResults } = require('../controllers/voteController');


const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/').get(protect, authorize('admin'), getVotes).post(protect, createVote);
router.route('/my-votes').get(protect, getMyVotes);
router.route('/results').get(protect, getVoteResults);
router.route('/declare-results').post(protect, authorize('admin'), declareResults);
router.route('/results/:positionId').delete(protect, authorize('admin'), resetVoteResults);

module.exports = router;
