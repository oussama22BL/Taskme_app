const Message = require('../models/Message');
const User = require('../models/User');

// Create a new message
const mongoose = require('mongoose');

exports.createMessage = async (req, res) => {
  try {
    const { receiverId, content, type = 'text', fileUrl, fileName } = req.body;
    if (!receiverId) return res.status(400).json({ msg: 'receiverId is required' });

    // Validate ids to avoid Mongoose CastError
    if (!mongoose.Types.ObjectId.isValid(receiverId)) return res.status(400).json({ msg: 'Invalid receiverId' });
    const senderId = req.user?._id;
    if (!senderId || !mongoose.Types.ObjectId.isValid(senderId)) return res.status(400).json({ msg: 'Invalid sender' });

    const conversationId = `conv_${[senderId.toString(), receiverId].sort().join('_')}`;

    const message = new Message({
      conversationId,
      sender: senderId,
      receiver: receiverId,
      content: content || '',
      type,
      fileUrl,
      fileName
    });

    await message.save();

    const populated = await Message.findById(message._id).populate('sender', 'name email').populate('receiver', 'name email');

    return res.status(201).json(populated);
  } catch (err) {
    console.error('createMessage error', err && err.stack ? err.stack : err);
    const payload = { msg: 'Server error' };
    if (process.env.NODE_ENV !== 'production') payload.error = err?.message || String(err);
    return res.status(500).json(payload);
  }
};

// Get conversations for the authenticated user
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Aggregate to get last message per conversation
    const agg = await Message.aggregate([
      { $match: { $or: [{ sender: userId }, { receiver: userId }] } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: '$conversationId', lastMessage: { $first: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$lastMessage' } }
    ]);

    // Map to desired shape
    const conversations = await Promise.all(agg.map(async (m) => {
      const unreadCount = await Message.countDocuments({ conversationId: m.conversationId, receiver: userId, read: false });
      return {
        id: m.conversationId,
        participantIds: [m.sender.toString(), m.receiver.toString()],
        lastMessage: {
          id: m._id,
          senderId: m.sender,
          receiverId: m.receiver,
          content: m.content,
          timestamp: m.createdAt,
          read: m.read,
          type: m.type
        },
        unreadCount,
        createdAt: m.createdAt
      };
    }));

    return res.json(conversations);
  } catch (err) {
    console.error('getConversations error', err && err.stack ? err.stack : err);
    const payload = { msg: 'Server error' };
    if (process.env.NODE_ENV !== 'production') payload.error = err?.message || String(err);
    return res.status(500).json(payload);
  }
};

// Get messages for a conversation
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    if (!conversationId) return res.status(400).json({ msg: 'conversationId required' });

    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 }).populate('sender', 'name email').populate('receiver', 'name email');

    return res.json(messages.map(m => ({
      id: m._id,
      senderId: m.sender._id,
      receiverId: m.receiver._id,
      content: m.content,
      timestamp: m.createdAt,
      read: m.read,
      type: m.type,
      fileUrl: m.fileUrl,
      fileName: m.fileName
    })));
  } catch (err) {
    console.error('getMessages error', err && err.stack ? err.stack : err);
    const payload = { msg: 'Server error' };
    if (process.env.NODE_ENV !== 'production') payload.error = err?.message || String(err);
    return res.status(500).json(payload);
  }
};

// Mark conversation messages as read for current user
exports.markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    if (!conversationId) return res.status(400).json({ msg: 'conversationId required' });

    await Message.updateMany({ conversationId, receiver: req.user._id, read: false }, { $set: { read: true } });

    return res.json({ ok: true });
  } catch (err) {
    console.error('markAsRead error', err && err.stack ? err.stack : err);
    const payload = { msg: 'Server error' };
    if (process.env.NODE_ENV !== 'production') payload.error = err?.message || String(err);
    return res.status(500).json(payload);
  }
};