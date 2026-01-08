#!/usr/bin/env node
/**
 * Seed script to insert sample users into MongoDB
 * Usage:
 *  - Using env var: set MONGO_URI=mongodb://localhost:27017/taskme_db; node scripts/seed.js
 *  - Passing URI: node scripts/seed.js "mongodb://localhost:27017/taskme_db"
 *  - To drop existing users before seeding: add --drop
 */
require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const URI = process.env.MONGO_URI || process.argv[2];
const shouldDrop = process.argv.includes('--drop');

if (!URI) {
  console.error('No MONGO_URI provided. Set MONGO_URI in env or pass it as first argument.');
  process.exit(1);
}

(async () => {
  try {
    await connectDB(URI);

    if (shouldDrop) {
      await User.deleteMany({});
      console.log('Existing users removed');
    }

    const users = [
      { name: 'Admin', email: 'admin@example.com', password: 'password123' },
      { name: 'User One', email: 'user1@example.com', password: 'password123' },
    ];

    // Ensure a superAdmin exists for development convenience.
    // You can override via env vars: ADMIN_EMAIL and ADMIN_PASSWORD
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'password123';
    const existingSuper = await User.findOne({ role: 'superAdmin' });
    if (!existingSuper) {
      const existsAdmin = await User.findOne({ email: adminEmail });
      if (!existsAdmin) {
        const saltA = await bcrypt.genSalt(10);
        const hashedA = await bcrypt.hash(adminPassword, saltA);
        const superAdmin = new User({ name: 'Super Admin', email: adminEmail, password: hashedA, role: 'superAdmin' });
        await superAdmin.save();
        console.log(`Created superAdmin ${adminEmail}`);
      } else {
        // If a user exists with the admin email but not superAdmin, promote them
        if (existsAdmin.role !== 'superAdmin') {
          existsAdmin.role = 'superAdmin';
          await existsAdmin.save();
          console.log(`Promoted ${adminEmail} to superAdmin`);
        }
      }
    } else {
      console.log(`SuperAdmin already exists: ${existingSuper.email}`);
    }

    for (const u of users) {
      const exists = await User.findOne({ email: u.email });
      if (exists) {
        console.log(`User ${u.email} already exists — skipping`);
        continue;
      }

      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(u.password, salt);
      const newUser = new User({ name: u.name, email: u.email, password: hashed });
      await newUser.save();
      console.log(`Created ${u.email}`);
    }

    console.log('Seeding finished');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
})();
