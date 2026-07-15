const express = require('express');
const router = express.Router();

const Claim = require('../models/claim');
const Item = require('../models/Item');
const User = require('../models/User');
const AdminNotification = require('../models/AdminNotification');
const { authMiddleware } = require('../middleware/authMiddleware');
const { sendClaimEmails } = require('../utils/mailer');

// POST /api/claims - Submit a claim
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { itemId } = req.body;
    if (!itemId) return res.status(400).json({ message: 'itemId is required' });

    // Prevent duplicate claims
    const existing = await Claim.findOne({ itemId, claimedBy: req.userId });
    if (existing) return res.status(400).json({ message: 'You already claimed this item' });

    const claim = await Claim.create({
      itemId,
      claimedBy: req.userId
    });

    // ── Fetch item + owner + claimant details for the email ──
    const item = await Item.findById(itemId).populate('postedBy', 'name email');
    const claimant = await User.findById(req.userId);

    console.log('🙋 Claim submitted by:', {
      name: claimant?.name,
      email: claimant?.email,
      userId: req.userId,
      item: item?.title
    });

    await AdminNotification.create({
      message: `Claim submitted for "${item?.title || 'item'}" by ${claimant?.name || 'student'}`,
      type: 'new_claim',
      referenceId: claim._id
    });

    // ── Send emails (don't block the response if email fails) ──
    try {
      await sendClaimEmails({
        item,
        claimant,
        owner: item?.postedBy || null
      });
    } catch (mailErr) {
      console.error('⚠️ EMAIL SEND FAILED:', mailErr.message);
      // claim is already saved, so we still return success to the user
    }

    res.json({ message: 'Claim submitted successfully!', claim });
  } catch (err) {
    console.error('❌ CLAIM ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/claims - Get all claims (admin)
// 🔧 FIXED: nested populate so itemId.postedBy (the original poster / finder)
// comes back as a full user object instead of a raw ObjectId string.
router.get('/', authMiddleware, async (req, res) => {
  try {
    const claims = await Claim.find()
      .populate({
        path: 'itemId',
        select: 'title category location image type status',
        populate: {
          path: 'postedBy',
          select: 'name email studentId phone faculty'
        }
      })
      .populate('claimedBy', 'name email studentId phone faculty')
      .sort({ createdAt: -1 });
    res.json(claims);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/claims/:id - Update claim status (admin)
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const claim = await Claim.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!claim) return res.status(404).json({ message: 'Claim not found' });
    res.json({ message: 'Claim updated!', claim });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
