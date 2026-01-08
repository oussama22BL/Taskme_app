// Exemple de configuration pour MongoDB (mongoose)
// Remplacez par votre logiques de connexion et variables d'environnement

const mongoose = require('mongoose');

/**
 * Connect to MongoDB using MONGO_URI from env if present.
 * If no URI provided, the function will warn and return without exiting the process.
 */
const connectDB = async (mongoUri) => {
  // Default to local development DB if no env var provided
  const defaultUri = 'mongodb://localhost:27017/taskme_db';
  const uri = mongoUri || process.env.MONGO_URI || defaultUri;

  if (!uri) {
    console.warn('No MONGO_URI provided — skipping DB connection');
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected:', uri);
  } catch (err) {
    console.error('MongoDB connection error:', err.message || err);
    // In dev we don't crash the server automatically, but log the error for debugging
  }
};

module.exports = connectDB;
