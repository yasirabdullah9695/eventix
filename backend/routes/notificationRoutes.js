
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    getNotifications,
    getUnreadNotificationsCount,
    createNotification,
    markAllAsRead,
    markAsRead,
    deleteNotification,
    sendGlobalNotification,
    getHeadline,
    createOrUpdateHeadline,
    deleteHeadline,
} = require('../controllers/notificationController');

// IMPORTANT: Specific routes should come before parameterized routes
router.post('/global', protect, authorize('admin'), sendGlobalNotification);
router.get('/headline', getHeadline);
router.post('/headline', protect, authorize('admin'), createOrUpdateHeadline);
router.delete('/headline', protect, authorize('admin'), deleteHeadline);

router.get('/unread-count', protect, getUnreadNotificationsCount);
router.put('/read-all', protect, markAllAsRead);

router.get('/', protect, getNotifications);
router.post('/', protect, createNotification);

router.put('/:id/read', protect, markAsRead);
router.delete('/:id', protect, deleteNotification);



module.exports = router;
