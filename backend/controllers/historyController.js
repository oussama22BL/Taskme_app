const History = require('../models/History');

exports.getUserHistory = async (req, res) => {
  try {
    const hist = await History.find({ user: req.user._id }).populate('task').sort('-createdAt');
    res.json(hist);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};
