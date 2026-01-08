#!/usr/bin/env node
require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');

const email = process.argv[2];
const role = process.argv[3] || 'admin';

if (!email) {
  console.error('Usage: node scripts/promote.js <email> [role]');
  process.exit(1);
}

(async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    const user = await User.findOne({ email });
    if (!user) {
      console.error('User not found:', email);
      process.exit(1);
    }
    user.role = role;
    await user.save();
    console.log(`Set ${email} => role=${role}`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
