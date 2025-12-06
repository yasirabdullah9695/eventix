
const express = require('express');
const router = express.Router();
const { getHouses, createHouse, getHouseById, updateHouse, deleteHouse } = require('../controllers/houseController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Make GET houses public, but protect other operations
router.get('/', getHouses);
router.post('/', protect, authorize('admin'), createHouse);
router.route('/:id').get(getHouseById).put(protect, authorize('admin'), updateHouse).delete(protect, authorize('admin'), deleteHouse);

module.exports = router;
