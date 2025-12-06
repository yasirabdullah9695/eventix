const mongoose = require('mongoose');
const User = require('./models/userModel');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config({ path: './backend/.env' });

const MONGO_URI = 'mongodb://localhost:27017/college_app';

const resetPassword = async () => {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('MongoDB connected');

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  await User.updateOne({ email: 'yasirabdullah18@gmail.com' }, { password: hashedPassword });
  console.log('Password reset successfully for yasirabdullah18@gmail.com');

  await mongoose.connection.close();
};

resetPassword().catch(err => console.error(err));