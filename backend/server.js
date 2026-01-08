require('dotenv').config();
const express = require('express');
const http = require('http'); // <--- AJOUTER
const { Server } = require('socket.io'); // <--- AJOUTER
const connectDB = require('./config/db');
const startCronJobs = require('./utils/cronJobs');
const cors = require('cors');
const Message = require('./models/Message');


const app = express();
const server = http.createServer(app); // <--- CRÉER LE SERVEUR HTTP
const io = new Server(server, {
  cors: { origin: "*" } // Autorise le frontend à se connecter
});

startCronJobs(io);

io.on('connection', (socket) => {
    console.log('⚡ Un utilisateur est connecté au socket :', socket.id);

    // --- LOGIQUE NOTIFICATIONS (Déjà faite normalement) ---
    socket.on('setup', (userId) => {
        socket.join(userId); // L'utilisateur rejoint sa propre "room" pour ses notifications perso
        console.log(`User ${userId} est prêt à recevoir des notifications`);
    });

    // --- NOUVELLE LOGIQUE CHAT (Point 10 du projet) ---

    // 1. Rejoindre un salon (soit 'general', soit l'ID d'une tâche spécifique)
    socket.on('join_chat', (roomId) => {
        socket.join(roomId);
        console.log(`📥 L'utilisateur ${socket.id} a rejoint le salon : ${roomId}`);
    });

    // 2. Écouter l'envoi d'un message
    socket.on('send_message', async (data) => {
        try {
            const { senderId, taskId, content } = data;

            // Sauvegarder le message en base de données pour l'historique
            const newMessage = await Message.create({
                sender: senderId,
                taskId: taskId === 'general' ? null : taskId,
                content: content
            });

            // Récupérer les infos de l'expéditeur (nom, prénom) pour l'affichage immédiat
            const populatedMessage = await Message.findById(newMessage._id)
                .populate('sender', 'nom prenom');

            // Envoyer le message UNIQUEMENT aux gens qui sont dans ce salon (roomId = taskId)
            // On utilise io.to(taskId) pour cibler le bon groupe
            io.to(taskId).emit('receive_message', populatedMessage);
            
        } catch (error) {
            console.error("Erreur lors de l'envoi du message :", error);
        }
    });

    socket.on('disconnect', () => {
        console.log('❌ Utilisateur déconnecté');
    });
});

// Middleware pour passer "io" aux contrôleurs via "req"
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(cors());
// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/assignments', require('./routes/assignmentRoutes'));
app.use('/api/vehicles', require('./routes/vehicleRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

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