const Message = require('../models/Message');

exports.getMessagesByTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        // Si taskId est "general", on cherche les messages sans taskId
        const filter = taskId === 'general' ? { taskId: null } : { taskId };
        
        const messages = await Message.find(filter)
            .populate('sender', 'nom prenom')
            .sort('createdAt');
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};