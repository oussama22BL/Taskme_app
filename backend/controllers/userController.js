const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper to remove sensitive fields
const sanitize = (user) => {
  const u = user.toObject ? user.toObject() : user;
  delete u.password;
  return u;
};

exports.register = async (req, res) => {
  const { name, nom, prenom, email, password, role, specialite, grade } = req.body;
  try {
    // Accept either a single `name` or `nom` + `prenom`
    if ((!name && !(nom && prenom)) || !email || !password) return res.status(400).json({ msg: 'Missing fields' });

    // SECURITY: prevent public users from creating admin/superAdmin accounts.
    // If client requests elevated role, verify the requestor has an admin token.
    const requestedRole = role || 'user';
    if (requestedRole !== 'user') {
      // Try to extract token from Authorization header
      const auth = req.headers.authorization || '';
      const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
      if (!token) return res.status(403).json({ msg: 'Not authorized to assign elevated role' });
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        const requestingUser = await User.findById(decoded.id);
        if (!requestingUser || !(requestingUser.role === 'admin' || requestingUser.role === 'superAdmin')) {
          return res.status(403).json({ msg: 'Not authorized to assign elevated role' });
        }
      } catch (err) {
        return res.status(403).json({ msg: 'Invalid authorization token' });
      }
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const userData = {
      name: name || `${prenom} ${nom}`,
      nom: nom || null,
      prenom: prenom || null,
      email,
      password: hashed,
      role: requestedRole,
      specialite: specialite || null,
      grade: grade || null,
    };

    const user = new User(userData);
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

    res.json({ user: { id: user._id, nom: user.nom, prenom: user.prenom, email: user.email, role: user.role, specialite: user.specialite, grade: user.grade }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Admin creates user (used by ManageUsers)
exports.createUser = async (req, res) => {
  const { nom, prenom, email, password, role, specialite, grade } = req.body;
  try {
    if (!nom || !prenom || !email || !password) return res.status(400).json({ msg: 'Missing fields' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: 'User already exists' });
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    // Enforce role constraints: coordinators may only create 'user' accounts
    let assignedRole = role || 'user';
    if (req.user && req.user.role === 'coordinator') {
      assignedRole = 'user';
    }

    const user = new User({ name: `${prenom} ${nom}`, nom, prenom, email, password: hashed, role: assignedRole, specialite, grade });
    await user.save();
    res.json(sanitize(user));
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.listUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Returns minimal contact list usable by chat for authenticated users
exports.listContacts = async (req, res) => {
  try {
    // Expose only minimal fields and omit password
    const users = await User.find({}).select('nom prenom _id role email');
    const mapped = users.map(u => ({ id: u._id, name: `${u.prenom || ''} ${u.nom || ''}`.trim(), role: u.role, email: u.email }));
    res.json(mapped);
  } catch (err) {
    console.error('listContacts error', err);
    res.status(500).json({ msg: 'Server error' });
  }
};
exports.getUser = async (req, res) => {
  try {
    const id = req.params.id;
    // allow admin or owner
    if (!(req.user.role === 'admin' || req.user.role === 'superAdmin' || String(req.user._id) === String(id))) {
      return res.status(403).json({ msg: 'Forbidden' });
    }
    const user = await User.findById(id).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    // allow admin or owner
    if (!(req.user.role === 'admin' || req.user.role === 'superAdmin' || String(req.user._id) === String(id))) {
      return res.status(403).json({ msg: 'Forbidden' });
    }
    const update = { ...req.body };
    // prevent role escalation unless admin
    if (update.role && !(req.user.role === 'admin' || req.user.role === 'superAdmin')) {
      delete update.role;
    }
    if (update.password) {
      const salt = await bcrypt.genSalt(10);
      update.password = await bcrypt.hash(update.password, salt);
    }
    const user = await User.findByIdAndUpdate(id, update, { new: true }).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    await User.deleteOne({ _id: id });
    res.json({ msg: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

    res.json({ user: { id: user._id, nom: user.nom, prenom: user.prenom, email: user.email, role: user.role, specialite: user.specialite, grade: user.grade }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Vérifier le token et renvoyer l'utilisateur courant (validation manuelle pour des messages d'erreur clairs)
exports.verify = async (req, res) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ msg: 'No token provided' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return res.status(401).json({ msg: 'Invalid token' });

      // return a fresh token and user info
      const newToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
      res.json({ user: { id: user._id, nom: user.nom, prenom: user.prenom, email: user.email, role: user.role, specialite: user.specialite, grade: user.grade }, token: newToken });
    } catch (err) {
      return res.status(401).json({ msg: 'Token verification failed' });
    }
  } catch (err) {
    console.error('Error in verify:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};
