const mongoose = require('mongoose');
const Nomination = require('./models/nominationModel');
const dotenv = require('dotenv');
dotenv.config({ path: './backend/.env' });

const MONGO_URI = 'mongodb://localhost:27017/college_app';

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
    Nomination.find({ position_id: '6904f0a48d431fcaa86a644d' })
      .then(nominations => {
        console.log(nominations);
        mongoose.connection.close();
      })
      .catch(err => {
        console.error(err);
        mongoose.connection.close();
      });
  })
  .catch(err => console.error('Could not connect to MongoDB', err));