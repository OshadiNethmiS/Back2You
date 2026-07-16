const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const Item = require('../models/Item');
const User = require('../models/User');
const Comment = require('../models/Comment');
const AdminNotification = require('../models/AdminNotification');
const { authMiddleware } = require('../middleware/authMiddleware');
const { findMatchesForItem } = require('../services/matchService');
const { sendMatchEmails } = require('../utils/mailer');

// ── Multer Setup (saves into ../uploads folder at project root) ──
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// ══════════════════════════════════════════════
// POST /api/items — create item (with optional image)
// ══════════════════════════════════════════════
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { type, category, title, location, date, description } = req.body;
    const item = await Item.create({
      type,
      category,
      title,
      location,
      date,
      description,
      image: req.file ? req.file.filename : null,
      postedBy: req.userId
    });

    const user = await User.findById(req.userId);
    await AdminNotification.create({
      message: `New ${type} item "${title}" reported by ${user ? user.name : 'a student'}`,
      type: 'new_post',
      referenceId: item._id
    });

    // ── Auto-match check: mee item ekata gälapena opposite-type item
    // (lost -> found, found -> lost) thiyenawada balanawa ──
    let matches = [];
    try {
      matches = await findMatchesForItem(item);

      if (matches.length > 0) {
        await sendMatchEmails({ newItem: item, matches, poster: user });

        await AdminNotification.create({
          message: `Possible match found for "${title}" (${matches.length} match(es))`,
          type: 'match_found',
          referenceId: item._id
        });
      }
    } catch (matchErr) {
      // Match/email eka fail unath, item post eka success wenna one —
      // ee nisa mekata wenama try/catch ekak
      console.error('❌ MATCH/EMAIL ERROR:', matchErr.message);
    }

    res.json({ message: 'Item posted!', item, matchesFound: matches.length });
  } catch (err) {
    console.error('❌ ITEM ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/items — list all (optionally filtered by ?type=)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    const items = await Item.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/items/my — logged-in user's own posts.
// Must be defined BEFORE '/:id', otherwise Express matches "my" as an :id value.
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const items = await Item.find({ postedBy: req.userId }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error('❌ MY ITEMS ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('postedBy', 'name email');
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/items/:id — edit (PostItem.js edit mode)
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (item.postedBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to edit this item' });
    }

    const { type, category, title, location, date, description } = req.body;

    item.type = type || item.type;
    item.category = category || item.category;
    item.title = title || item.title;
    item.location = location || item.location;
    item.date = date || item.date;
    item.description = description || item.description;
    if (req.file) item.image = req.file.filename;

    await item.save();
    res.json({ message: 'Item updated!', item });
  } catch (err) {
    console.error('❌ UPDATE ITEM ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/items/:id/status — owner updates status (Reported/Matched/Resolved)
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['reported', 'matched', 'resolved'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (item.postedBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }

    item.status = status;
    await item.save();

    res.json({ message: 'Status updated!', item });
  } catch (err) {
    console.error('❌ STATUS UPDATE ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/items/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (item.postedBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }

    await item.deleteOne();
    res.json({ message: 'Item deleted!' });
  } catch (err) {
    console.error('❌ DELETE ITEM ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/items/:id/comments - Add a comment (guest/user)
router.post('/:id/comments', async (req, res) => {
  try {
    const { email, phone, content } = req.body;
    if (!email || !content) {
      return res.status(400).json({ message: 'Email and comment content are required' });
    }

    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const comment = await Comment.create({
      itemId: req.params.id,
      email,
      phone,
      content
    });

    // Create an admin notification for the guest comment
    await AdminNotification.create({
      message: `Guest comment on "${item.title}" by ${email}: "${content.substring(0, 30)}${content.length > 30 ? '...' : ''}"`,
      type: 'new_report',
      referenceId: comment._id
    });

    res.json({ message: 'Comment submitted successfully!', comment });
  } catch (err) {
    console.error('❌ COMMENT ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/items/:id/comments - Get comments for an item
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ itemId: req.params.id }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
