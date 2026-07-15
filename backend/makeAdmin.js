/**
 * ONE-TIME USE SCRIPT — promotes an existing account to admin.
 *
 * Run this from your `backend` folder (same place you run `npm start`):
 *
 *     node makeAdmin.js your-email@example.com
 *
 * It connects to your existing MongoDB (using the same connection logic
 * as the rest of your app), finds the user with that email, sets their
 * role to "admin", and disconnects.
 *
 * DELETE THIS FILE after you've used it once — it's not meant to stay
 * in the project long-term (same reasoning as removing /api/admin/setup).
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function run() {
  const email = process.argv[2];

  if (!email) {
    console.error('❌ Please provide an email. Example:');
    console.error('   node makeAdmin.js your-email@example.com');
    process.exit(1);
  }

  try {
    // Uses the same MONGO_URI your app already connects with (from .env)
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/back2you');
    console.log('✅ Connected to MongoDB');

    const user = await User.findOne({ email });

    if (!user) {
      console.error(`❌ No user found with email: ${email}`);
      console.error('   Double-check the email matches exactly what you registered with.');
      process.exit(1);
    }

    console.log(`Found user: ${user.name} (${user.email}) — current role: "${user.role}"`);

    user.role = 'admin';
    await user.save();

    console.log(`🎉 Success! "${user.name}" (${user.email}) is now role: "admin"`);
    console.log('   You can now log in to the Admin Dashboard with this account.');
  } catch (err) {
    console.error('❌ Something went wrong:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();