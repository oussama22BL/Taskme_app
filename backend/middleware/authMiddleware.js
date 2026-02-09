const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Vérifier si l'utilisateur est authentifié (a un token valide)
exports.protect = async (req, res, next) => {
    let token;

    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extraire le token
            token = req.headers.authorization.split(' ')[1];

            // Vérifier et décoder le token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Ajouter l'utilisateur à la requête (sans le mot de passe)
            req.user = await User.findById(decoded.id).select('-password');

            next(); 
        } catch (error) {
            res.status(401).json({ message: "Non autorisé, token invalide" });
        }
    }

    if (!token) {
        res.status(401).json({ message: "Non autorisé, aucun token fourni" });
    }
};

// Vérifier les rôles 
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `Le rôle ${req.user.role} n'est pas autorisé à accéder à cette route` 
            });
        }
        next();
    };
};