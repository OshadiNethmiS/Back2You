/**
 * ONE-TIME DEBUG SCRIPT — lists every registered user's email + role
 * so you can find the exact email you registered with.
 *
 * Run from your `backend` folder:
 *
 *     node listUsers.js
 *
 * DELETE THIS FILE after use.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/back2you');
    console.log('✅ Connected to MongoDB\n');

    const users = await User.find().select('name email role studentId');

    if (users.length === 0) {
      console.log('❌ No users found in the database at all.');
      console.log('   This means registration never actually saved to this database —');
      console.log('   double check your MONGO_URI in .env points to the right DB.');
    } else {
      console.log(`Found ${users.length} user(s):\n`);
      users.forEach((u, i) => {
        console.log(`${i + 1}. Name: ${u.name}`);
        console.log(`   Email: "${u.email}"`);
        console.log(`   Role:  ${u.role}`);
        console.log(`   Student ID: ${u.studentId || '(none)'}`);
        console.log('   ---');
      });
    }
  } catch (err) {
    console.error('❌ Something went wrong:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();