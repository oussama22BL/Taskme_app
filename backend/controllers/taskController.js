const Task = require('../models/Task');

exports.getAll = async (req, res) => {
  try {
    const tasks = await Task.find().populate('assignee', 'prenom nom email').populate('creator', 'prenom nom email');
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.create = async (req, res) => {
  try {
    // Ensure the creator is the authenticated user (do not trust client-sent creator)
    const taskData = { ...req.body, creator: req.user._id };
    const task = new Task(taskData);
    await task.save();

    // Record history
    try {
      const History = require('../models/History');
      await History.create({ user: req.user._id, task: task._id, action: 'create', details: { title: task.title } });
    } catch (hErr) {
      console.error('History save failed', hErr);
    }

    // Notify coordinators/admins about new task
    try {
      const Notification = require('../models/Notification');
      const User = require('../models/User');
      const recipients = await User.find({ role: { $in: ['admin', 'superAdmin', 'coordinator'] } }).select('_id');
      const notifications = recipients.map(r => ({
        user: r._id,
        actor: req.user._id,
        type: 'task_created',
        message: `${req.user.prenom || req.user.name || 'Un utilisateur'} a créé la tâche: ${task.title}`,
        data: { taskId: task._id }
      }));
      if (notifications.length) await Notification.insertMany(notifications);
    } catch (nErr) {
      console.error('Notification creation failed', nErr);
    }

    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};
