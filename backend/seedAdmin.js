
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/userModel');
const path = require('path'); // Import path module

dotenv.config({ path: path.resolve(__dirname, '.env') }); // Specify the path to .env file


const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
        });
        console.log('MongoDB connected');

        const adminEmail = 'yasirabdullah18@gmail.com';
        const adminPassword = 'yasir123'; // New password

        const adminExists = await User.findOne({ email: adminEmail });

        if (!adminExists) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminPassword, salt);

            await User.create({
                full_name: 'Admin',
                email: adminEmail,
                password: hashedPassword,
                phone: '1234567890',
                branch: 'IT',
                year: '2025',
                enrollment_number: 'ADMIN_001',
                role: 'admin',
            });
            console.log(`Created admin: ${adminEmail}`);
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminPassword, salt);
            adminExists.password = hashedPassword;
            adminExists.role = 'admin';
            await adminExists.save();
            console.log(`Updated admin ${adminEmail} with new password.`);
        }

        mongoose.connection.close();
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
