require('dotenv').config();
const express = require('express');
const http = require('http'); // <--- AJOUTER
const { Server } = require('socket.io'); // <--- AJOUTER
const connectDB = require('./config/db');
const startCronJobs = require('./utils/cronJobs');


const app = express();
const server = http.createServer(app); // <--- CRÉER LE SERVEUR HTTP
const io = new Server(server, {
  cors: { origin: "*" } // Autorise le frontend à se connecter
});

startCronJobs(io);

// Middleware pour passer "io" aux contrôleurs via "req"
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/assignments', require('./routes/assignmentRoutes'));
app.use('/api/vehicles', require('./routes/vehicleRoutes'));

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    // UTILISER server.listen au lieu de app.listen
    server.listen(PORT, () => {
      console.log(`🚀 Serveur et Socket.io démarrés sur le port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Erreur lors du démarrage :", error);
  }
}

startServer();