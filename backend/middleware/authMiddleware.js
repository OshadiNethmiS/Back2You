const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ── Basic auth: verifies JWT, attaches req.userId ──
// Use this for any route that just needs a logged-in user
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// ── Admin auth: verifies JWT + checks role is admin/superadmin ──
// Use this for all /api/admin/* routes
const adminAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Access Denied: Admin credentials required' });
    }

    req.userId = user._id;
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = { authMiddleware, adminAuth };
