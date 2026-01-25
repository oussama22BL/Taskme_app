const User = require('../models/User');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// Récupérer tous les utilisateurs, avec option de filtrage par rôle

exports.getUsers = async (req, res) => {
    try {
        const { role } = req.query;
        const filter = role ? { role } : {};
        const users = await User.find(filter).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Créer un compte et envoyer code par email
exports.createAccount = async (req, res) => {
    try {
        const { nom, prenom, email,password, role, specialite, grade } = req.body;

        // 1. Vérifier si l'utilisateur existe
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "Cet email est déjà utilisé" });

        // 2. Générer code temporaire
        const tempPassword = crypto.randomBytes(4).toString('hex');

        // 3. Créer l'utilisateur
        const user = await User.create({
            nom, prenom, email,
            password,
            role, 
            specialite,
            grade,
            isActive: true
        });

        // 4. Envoi de l'email
        try {
            await sendEmail({
                email: user.email,
                name: prenom,
                role: role === 'admin' ? 'Coordinateur' : 'Auditeur',
                subject: 'Accès au système Taskme',
                code: tempPassword
            });
            res.status(201).json({ message: "Compte créé et email envoyé" });
        } catch (mailErr) {
            // Si l'email échoue, on renvoie le code dans la réponse pour pouvoir tester
            res.status(201).json({ 
                message: "Compte créé (Email non envoyé)", 
                tempCode: tempPassword 
            });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

//     Récupérer tous les utilisateurs
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: { $in: ['user', 'admin'] } }).select('-password').sort('-createdAt');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//  Activer ou désactiver un compte utilisateur
//  PATCH /api/users/:id/toggle-status
exports.toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

        // Empêcher le superAdmin de se désactiver lui-même
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: "Vous ne pouvez pas désactiver votre propre compte." });
        }

        user.isActive = !user.isActive; // Inverse le statut (true -> false ou false -> true)
        await user.save();

        res.json({ 
            message: `Le compte est désormais ${user.isActive ? 'activé' : 'désactivé'}.`, 
            isActive: user.isActive 
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors du changement de statut" });
    }
};



//     Récupérer le profil de l'utilisateur connecté
//   GET /api/users/profile
exports.getUserProfile = async (req, res) => {
    try {
        // req.user._id provient du middleware 'protect'
        const user = await User.findById(req.user._id).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

//   Mettre à jour le profil de l'utilisateur connecté
//   PUT /api/users/profile
exports.updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        // 1. Mise à jour des champs d'identité
        user.nom = req.body.nom || user.nom;
        user.prenom = req.body.prenom || user.prenom;

        // 2. Mise à jour de l'expertise (Crucial pour l'IA)
        // On remplace le tableau si fourni dans la requête
        if (req.body.diplomes) user.diplomes = req.body.diplomes;
        if (req.body.formations) user.formations = req.body.formations;

        // 3. Changement de mot de passe (optionnel)
        if (req.body.password) {
            user.password = req.body.password; // Le middleware pre('save') s'occupera du hachage
        }

        const updatedUser = await user.save();

        // 4. Réponse avec l'objet mis à jour (sans le mot de passe)
        res.json({
            _id: updatedUser._id,
            nom: updatedUser.nom,
            prenom: updatedUser.prenom,
            email: updatedUser.email,
            role: updatedUser.role,
            grade: updatedUser.grade,
            specialite: updatedUser.specialite,
            diplomes: updatedUser.diplomes,
            formations: updatedUser.formations
        });

    } catch (error) {
        console.error("Erreur mise à jour profil:", error.message);
        res.status(400).json({ message: "Données invalides ou erreur lors de la sauvegarde" });
    }
};