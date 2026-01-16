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
        const { nom, prenom, email, role, specialite, grade } = req.body;

        // 1. Vérifier si l'utilisateur existe
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "Cet email est déjà utilisé" });

        // 2. Générer code temporaire
        const tempPassword = crypto.randomBytes(4).toString('hex');

        // 3. Créer l'utilisateur
        const user = await User.create({
            nom, prenom, email,
            password: tempPassword,
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

// @desc    Récupérer tous les utilisateurs
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort('-createdAt');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};