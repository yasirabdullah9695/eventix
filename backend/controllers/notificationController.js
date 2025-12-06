const User = require('../models/userModel');
const Notification = require('../models/notificationModel');
const Headline = require('../models/headlineModel');

// @desc    Get the headline message
// @route   GET /api/notifications/headline
// @access  Public
const getHeadline = async (req, res) => {
    try {
        const headline = await Headline.findOne().sort({ updatedAt: -1 });
        if (!headline) {
            return res.json({ message: '' });
        }
        res.json(headline);
    } catch (error) {
        console.error('Error in getHeadline:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Create or update the headline message
// @route   POST /api/notifications/headline
// @access  Admin
const createOrUpdateHeadline = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        let headline = await Headline.findOne();
        if (headline) {
            headline.message = message;
        } else {
            headline = new Headline({ message });
        }
        
        await headline.save();

        const io = req.app.get('io');
        if (io) {
            io.emit('newHeadline', headline);
        }

        res.status(201).json(headline);
    } catch (error) {
        console.error('Error in createOrUpdateHeadline:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get notifications for a user
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user_id: req.user.id })
            .sort({ created_date: -1 });
        res.json(notifications);
    } catch (error) {
        console.error('Error in getNotifications:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get unread notifications count
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadNotificationsCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({ 
            user_id: req.user.id, 
            read: false 
        });
        res.json({ count });
    } catch (error) {
        console.error('Error in getUnreadNotificationsCount:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Create a notification
// @route   POST /api/notifications
// @access  Private
const createNotification = async (req, res) => {
    try {
        const { user_id, title, message, type, link } = req.body;
        
        if (!title || !message || !type) {
            return res.status(400).json({ message: 'Title, message, and type are required' });
        }

        const notification = new Notification({
            user_id: user_id || req.user.id,
            title,
            message,
            type,
            link,
        });
        
        const createdNotification = await notification.save();
        
        // Emit socket event if io is available
        if (req.app.get('io')) {
            req.app.get('io').to(notification.user_id.toString()).emit('newNotification', createdNotification);
        }
        
        res.status(201).json(createdNotification);
    } catch (error) {
        console.error('Error in createNotification:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
    try {
        const result = await Notification.updateMany(
            { user_id: req.user.id, read: false }, 
            { read: true }
        );
        res.json({ 
            message: 'All notifications marked as read',
            modifiedCount: result.modifiedCount 
        });
    } catch (error) {
        console.error('Error in markAllAsRead:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        if (notification.user_id.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized to update this notification' });
        }

        notification.read = true;
        const updatedNotification = await notification.save();
        res.json(updatedNotification);
    } catch (error) {
        console.error('Error in markAsRead:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        if (notification.user_id.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized to delete this notification' });
        }

        await notification.deleteOne();
        res.json({ message: 'Notification removed' });
    } catch (error) {
        console.error('Error in deleteNotification:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Send a global notification to all users
// @route   POST /api/notifications/global
// @access  Admin
const sendGlobalNotification = async (req, res) => {
    try {
        console.log('sendGlobalNotification: Received request');
        const { title, message } = req.body;
        console.log('sendGlobalNotification: Request body', { title, message });

        if (!title || !message) {
            console.log('sendGlobalNotification: Validation failed - title or message missing');
            return res.status(400).json({ message: 'Title and message are required' });
        }

        const users = await User.find({});
        console.log(`sendGlobalNotification: Found ${users.length} users`);
        const io = req.app.get('io');

        const notificationPromises = users.map(user => {
            const notification = new Notification({
                user_id: user._id,
                title,
                message,
                type: 'general',
            });
            console.log(`sendGlobalNotification: Creating notification for user ${user._id}`, notification);
            return notification.save();
        });

        const createdNotifications = await Promise.all(notificationPromises);
        console.log(`sendGlobalNotification: Created ${createdNotifications.length} notifications`);

        if (io) {
            console.log('sendGlobalNotification: Socket.IO is available');
            createdNotifications.forEach(notification => {
                console.log(`sendGlobalNotification: Emitting 'newNotification' to room ${notification.user_id.toString()}`);
                io.to(notification.user_id.toString()).emit('newNotification', notification);
            });
        } else {
            console.log('sendGlobalNotification: Socket.IO is not available');
        }

        res.status(201).json({ message: 'Global notification sent successfully', count: createdNotifications.length });
    } catch (error) {
        console.error('Error in sendGlobalNotification:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};


// @desc    Delete the headline message
// @route   DELETE /api/notifications/headline
// @access  Admin
const deleteHeadline = async (req, res) => {
    try {
        await Headline.deleteMany({});
        const io = req.app.get('io');
        if (io) {
            io.emit('newHeadline', { message: '' });
        }
        res.json({ message: 'Headline deleted' });
    } catch (error) {
        console.error('Error in deleteHeadline:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
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
};