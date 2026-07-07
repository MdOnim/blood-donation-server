require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@lifelink.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const existing = await User.findOne({ email: ADMIN_EMAIL });

    if (existing) {
      existing.name = 'LifeLink Admin';
      existing.password = hashedPassword;
      existing.role = 'admin';
      existing.status = 'active';
      existing.bloodGroup = existing.bloodGroup || 'O+';
      existing.district = existing.district || 'Dhaka';
      existing.upazila = existing.upazila || 'Dhaka';
      existing.avatar =
        existing.avatar ||
        'https://ui-avatars.com/api/?name=LifeLink+Admin&background=9B1B30&color=fff';
      await existing.save();
      console.log('Admin user updated:', ADMIN_EMAIL);
    } else {
      await User.create({
        name: 'LifeLink Admin',
        email: ADMIN_EMAIL,
        password: hashedPassword,
        avatar: 'https://ui-avatars.com/api/?name=LifeLink+Admin&background=9B1B30&color=fff',
        bloodGroup: 'O+',
        district: 'Dhaka',
        upazila: 'Dhaka',
        role: 'admin',
        status: 'active',
      });
      console.log('Admin user created:', ADMIN_EMAIL);
    }

    console.log('Password:', ADMIN_PASSWORD);
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
};

seedAdmin();
