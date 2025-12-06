
const express = require('express');
const router = express.Router();
const { getGalleryImages, uploadGalleryImage, updateGalleryImage, deleteGalleryImage } = require('../controllers/galleryImageController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/').get(getGalleryImages).post(protect, authorize('admin'), upload, uploadGalleryImage);
router.route('/:id').put(protect, authorize('admin'), upload, updateGalleryImage).delete(protect, authorize('admin'), deleteGalleryImage);

module.exports = router;
