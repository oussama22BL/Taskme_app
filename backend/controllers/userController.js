const User = require('../models/User');


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