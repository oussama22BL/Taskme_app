const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Verify JWT from Authorization header and attach user to req.user
 */
const authMiddleware = async (req, res, next) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ msg: 'Invalid token' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Token is not valid' });
  }
};

/**
 * Role-based authorization
 * Usage: requireRole('admin', 'superAdmin')
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ msg: 'Not authenticated' });
  if (!roles.includes(req.user.role)) return res.status(403).json({ msg: 'Forbidden' });
  next();
};

module.exports = { authMiddleware, requireRole };
