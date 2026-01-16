const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Fonction utilitaire pour générer le Token JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '24h', // Le token expire après 24 heures
    });
};

// @desc    Enregistrer un nouvel utilisateur
// @route   POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { nom, prenom, email, password, role, specialite, grade } = req.body;

        // 1. Vérifier si l'utilisateur existe déjà
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "Cet utilisateur existe déjà" });
        }

        // 2. Créer l'utilisateur (le hachage se fait auto dans le modèle User.js)
        const user = await User.create({
            nom,
            prenom,
            email,
            password,
            role,
            specialite,
            grade
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                nom: user.nom,
                email: user.email,
                role: user.role,
                token: generateToken(user._id), // On envoie le token dès l'inscription
            });
        }
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur lors de l'inscription", error: error.message });
    }
};

// @desc    Authentifier l'utilisateur & obtenir le token
// @route   POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Trouver l'utilisateur par email
        const user = await User.findOne({ email });

        if (!user.isActive) return res.status(401).json({ message: "Compte désactivé. Contactez l'administration." });

        // 2. Vérifier si l'utilisateur existe et si le mot de passe correspond
        if (user && (await user.comparePassword(password))) {
            res.json({
                _id: user._id,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                role: user.role,
                grade: user.grade,        
                specialite: user.specialite,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: "Email ou mot de passe incorrect" });
        }
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur lors de la connexion", error: error.message });
    }
};