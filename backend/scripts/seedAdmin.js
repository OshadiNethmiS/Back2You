// One-time script: run with `node scripts/seedAdmin.js` to create the first admin user.
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/back2you';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB to seed admin user');

    const adminEmail = 'oshadhinethmi7@gmail.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('ℹ️ Admin user already exists:', adminEmail);
    } else {
      const hashedPassword = await bcrypt.hash('admin1234', 10);
      await User.create({
        name: 'Admin User',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        status: 'active'
      });
      console.log('✅ Admin user created successfully!');
      console.log('Credentials:');
      console.log('  Email: oshadhinethmi7@gmail.com');
      console.log('  Password: admin1234');
    }
  } catch (err) {
    console.error('❌ Seeding error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

seedAdmin();