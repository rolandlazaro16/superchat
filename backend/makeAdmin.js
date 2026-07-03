const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/superchat';

const makeAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB successfully.');

    const result = await User.updateMany({}, { $set: { isAdmin: true } });
    console.log(`Successfully updated ${result.modifiedCount} users to be Admin!`);

    process.exit(0);
  } catch (err) {
    console.error('Error updating users:', err);
    process.exit(1);
  }
};

makeAdmin();
