
const cron = require('node-cron');
const Event = require('../models/eventModel');
const { io } = require('../index');

const updateEventStatuses = async () => {
    try {
        const events = await Event.find({});
        const now = new Date();

        for (const event of events) {
            const eventDateTime = new Date(`${event.date}T${event.time}`);
            let updated = false;

            if (event.status === 'upcoming' && eventDateTime <= now) {
                event.status = 'ongoing';
                updated = true;
            }

            // This is a simplistic approach. A more robust solution would be to store the event duration
            // and calculate the end time.
            if (event.status === 'ongoing' && now > new Date(eventDateTime.getTime() + 2 * 60 * 60 * 1000)) { // Assuming 2 hours duration
                event.status = 'completed';
                updated = true;
            }

            if (updated) {
                const updatedEvent = await event.save();
                io.emit('updateEvent', updatedEvent);
            }
        }
    } catch (error) {
        console.error('Error updating event statuses:', error);
    }
};

const start = () => {
    // Run every minute
    cron.schedule('* * * * *', updateEventStatuses);
};

module.exports = { start };
