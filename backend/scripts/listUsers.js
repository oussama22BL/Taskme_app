#!/usr/bin/env node
require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');

const URI = process.env.MONGO_URI || process.argv[2];

if (!URI) {
  console.error('No MONGO_URI provided. Set MONGO_URI in env or pass it as first argument.');
  process.exit(1);
}

(async () => {
  try {
    await connectDB(URI);
    const users = await User.find({}).select('nom prenom name email role createdAt updatedAt');
    console.log('Users:');
    users.forEach(u => console.log(JSON.stringify(u, null, 2)));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();