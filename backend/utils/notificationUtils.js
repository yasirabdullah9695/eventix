
const Notification = require('../models/notificationModel');
const User = require('../models/userModel');

const createAndSendNotification = async (io, notificationData) => {
    try {
        const users = await User.find({});
        const notificationPromises = users.map(user => {
            const notification = new Notification({
                ...notificationData,
                user_id: user._id,
            });
            return notification.save();
        });

        const createdNotifications = await Promise.all(notificationPromises);
        
        if (io) {
            console.log('Emitting newNotification events via Socket.IO to specific users.');
            createdNotifications.forEach(notification => {
                io.to(notification.user_id.toString()).emit('newNotification', notification);
            });
        } else {
            console.log('Socket.IO instance (io) is not available in createAndSendNotification.');
        }
    } catch (error) {
        console.error('Error creating and sending notification:', error);
    }
};

module.exports = { createAndSendNotification };
