require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const DonationRequest = require('../models/DonationRequest');
const Funding = require('../models/Funding');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@lifelink.com';

const clearDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const [donations, fundings, users] = await Promise.all([
      DonationRequest.deleteMany({}),
      Funding.deleteMany({}),
      User.deleteMany({ email: { $ne: ADMIN_EMAIL } }),
    ]);

    const admin = await User.findOne({ email: ADMIN_EMAIL });

    console.log('Cleared donation requests:', donations.deletedCount);
    console.log('Cleared funding records:', fundings.deletedCount);
    console.log('Cleared users (except admin):', users.deletedCount);
    console.log(
      admin
        ? `Admin kept: ${admin.email}`
        : `Warning: admin not found (${ADMIN_EMAIL}). Run npm run seed:admin.`
    );

    process.exit(0);
  } catch (error) {
    console.error('Clear database failed:', error.message);
    process.exit(1);
  }
};

clearDatabase();
