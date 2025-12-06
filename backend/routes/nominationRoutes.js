
const express = require('express');
const router = express.Router();
const { getNominations, getNominationById, createNomination, updateNomination, deleteNomination, getApprovedNominations, getWinners, declareWinner } = require('../controllers/nominationController');
const nominationUploadMiddleware = require('../middleware/nominationUploadMiddleware');

const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/').get(protect, authorize('admin'), getNominations).post(protect, nominationUploadMiddleware, createNomination);
router.route('/approved').get(protect, getApprovedNominations);
router.route('/:id').get(protect, getNominationById).put(protect, authorize('admin'), updateNomination).delete(protect, authorize('admin'), deleteNomination);
router.route('/get/winners').get(protect, getWinners);
router.route('/:id/declare-winner').put(protect, authorize('admin'), declareWinner);


module.exports = router;
