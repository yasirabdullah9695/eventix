
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs'); // Import bcrypt
const User = require('./models/userModel'); // Import User model

dotenv.config({ path: './.env' });

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"]
    }
});

app.set('socketio', io); // Add this line



app.use(cors({ origin: '*', credentials: true, methods: ["GET", "POST", "PUT", "DELETE"], allowedHeaders: ["Content-Type", "Authorization"] }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Import routes
const houseRoutes = require('./routes/houseRoutes');
const eventRoutes = require('./routes/eventRoutes');
const galleryImageRoutes = require('./routes/galleryImageRoutes');
const leaderPositionRoutes = require('./routes/leaderPositionRoutes');
const nominationRoutes = require('./routes/nominationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const voteRoutes = require('./routes/voteRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const reportRoutes = require('./routes/reportRoutes');

app.use('/api/events', eventRoutes);
app.use('/api/gallery', galleryImageRoutes);
app.use('/api/houses', houseRoutes);
app.use('/api/leader-positions', leaderPositionRoutes);
app.use('/api/nominations', nominationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);

const PORT = process.env.PORT || 5000;

// Basic route
app.get('/', (req, res) => {
    res.send('College Hub Backend is running!');
});

io.on('connection', (socket) => {
    console.log('Socket.IO: a user connected', socket.id);

    socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`Socket.IO: User ${userId} joined room ${userId}`);
    });

    socket.on('disconnect', () => {
        console.log('Socket.IO: user disconnected', socket.id);
    });
});

module.exports = { app, io };

// MongoDB Connection
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
    console.error('ERROR: MONGO_URI environment variable is not set!');
    process.exit(1);
}

mongoose.connect(mongoUri, {
})
.then(async () => { // Make the callback async
    console.log('MongoDB connected');

    // Ensure the default admin user exists and has the correct password
    const adminEmail = 'yasirabdullah18@gmail.com';
    const adminPassword = 'yasir123'; // Default password

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // Find and update the admin user, or create if not found.
    // Always update password to ensure it matches the default.
    const updatedAdmin = await User.findOneAndUpdate(
        { email: adminEmail }, // Find by email
        {
            full_name: 'Default Admin',
            password: hashedPassword, // Always update password
            phone: '1234567890',
            branch: 'IT',
            year: '2025',
            enrollment_number: 'ADMIN001',
            role: 'admin' // Ensure role is admin
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`Default admin user ensured: ${adminEmail} with role ${updatedAdmin.role}`);

    http.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})
.catch(err => {
    console.error('MongoDB connection error:', err);
    console.error(err.stack);
    // Gracefully exit the application
    process.exit(1);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(`[${new Date().toISOString()}] ERROR: ${err.message}`);
    console.error(`Request URL: ${req.originalUrl}`);
    console.error(err.stack);
    res.status(500).json({ message: 'Something broke!', error: err.message });
});


// Initialize event status updater
// const eventStatusUpdater = require('./utils/eventStatusUpdater');



