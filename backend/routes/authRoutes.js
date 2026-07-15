const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const AdminNotification = require('../models/AdminNotification');
const { authMiddleware } = require('../middleware/authMiddleware');

// ══════════════════════════════════════════════
// POST /api/auth/register
// ══════════════════════════════════════════════
router.post('/register', async (req, res) => {
  console.log('📩 Register request:', req.body);
  const { name, email, password, studentId, phone, faculty } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      studentId: studentId || '',
      phone: phone || '',
      faculty: faculty || '',
    });

    await AdminNotification.create({
      message: `New student registration: ${name} (${studentId || 'No ID'})`,
      type: 'new_user',
      referenceId: user._id
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '7d' });
    res.json({
      token,
      user: {
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        phone: user.phone,
        faculty: user.faculty,
      },
    });
  } catch (err) {
    console.error('❌ REGISTER ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ══════════════════════════════════════════════
// POST /api/auth/login
// ══════════════════════════════════════════════
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid password' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '7d' });
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('❌ LOGIN ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me — full profile (used by UserAcc page)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/profile — same data as /me, used by AdminDashboard.jsx and UserAcc.js on load
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error('❌ GET PROFILE ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/auth/profile — used by "Save Changes" in Settings tab
router.patch('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, email, phone, faculty } = req.body;

    if (email) {
      const existing = await User.findOne({ email, _id: { $ne: req.userId } });
      if (existing) return res.status(400).json({ message: 'Email already in use' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (faculty !== undefined) user.faculty = faculty;

    await user.save();

    const safeUser = await User.findById(req.userId).select('-password');
    res.json({ message: 'Profile updated!', user: safeUser });
  } catch (err) {
    console.error('❌ UPDATE PROFILE ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/auth/update-password — used by Security tab
router.put('/update-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).json({ message: 'Current password is incorrect' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password updated successfully!' });
  } catch (err) {
    console.error('❌ UPDATE PASSWORD ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
