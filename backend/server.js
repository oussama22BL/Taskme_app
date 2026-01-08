// server.js
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const path = require('path');

const app = express();

// Connexion à MongoDB
connectDB();

// Middleware
app.use(cors()); // en dev: autorise toutes les origines
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
// Compatibility: frontend expects /api/auth/* for auth actions
app.use('/api/auth', userRoutes);

// Mount API router with tasks, notifications, history
const apiRoutes = require('./routes/api');
// Serve uploaded attachments
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});