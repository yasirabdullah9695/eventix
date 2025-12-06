
const mongoose = require('mongoose');
const User = require('./models/userModel');
const House = require('./models/houseModel'); // <-- Import House model
require('dotenv').config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('Connected to MongoDB');

        const users = await User.find().populate('house_id', 'name'); // Populate house name

        if (users.length === 0) {
            console.log('No users found in the database.');
        } else {
            console.log('--- User List ---');
            users.forEach(user => {
                console.log(
                    `Name: ${user.full_name}, Email: ${user.email}, Role: ${user.role}, House: ${user.house_id ? user.house_id.name : 'Not Assigned'}`
                );
            });
            console.log('--- End of List ---');
        }

    } catch (error) {
        console.error('Error connecting to MongoDB or fetching users:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

checkUsers();
