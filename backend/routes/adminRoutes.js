const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Item = require('../models/Item');
const Claim = require('../models/claim');
const Report = require('../models/Report');
const AdminNotification = require('../models/AdminNotification');
const AuditLog = require('../models/AuditLog');
const { adminAuth } = require('../middleware/authMiddleware');

// Helper: Get counts grouped by date for last 7 days (Sparkline)
async function getWeeklySparkline(model, baseQuery = {}) {
  const sparkline = [];
  for (let i = 6; i >= 0; i--) {
    const start = new Date();
    start.setDate(start.getDate() - i);
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setDate(end.getDate() - i);
    end.setHours(23, 59, 59, 999);

    const query = {
      ...baseQuery,
      createdAt: { $gte: start, $lte: end }
    };
    const count = await model.countDocuments(query);
    sparkline.push(count);
  }
  return sparkline;
}

// ── 1. Setup / Seed Route (Create Admin Account) ──
router.post('/setup', async (req, res) => {
  try {
    const adminEmail = 'admin@university.edu';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      const hashed = await bcrypt.hash('admin123', 10);
      admin = await User.create({
        name: 'Super Admin',
        email: adminEmail,
        password: hashed,
        role: 'superadmin',
        studentId: 'ADMIN-001',
        phone: '123-456-7890',
        faculty: 'IT'
      });
      return res.json({ message: 'Admin seeded successfully!', email: adminEmail, password: 'admin123' });
    }
    res.json({ message: 'Admin account already exists.', email: adminEmail });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── 2. Dashboard Stats ──
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalLost = await Item.countDocuments({ type: 'lost' });
    const totalFound = await Item.countDocuments({ type: 'found' });
    const matched = await Item.countDocuments({ status: 'matched' });
    const returned = await Item.countDocuments({ status: 'resolved' });
    const pendingClaims = await Claim.countDocuments({ status: 'pending' });

    const studentsSparkline = await getWeeklySparkline(User, { role: 'student' });
    const lostSparkline = await getWeeklySparkline(Item, { type: 'lost' });
    const foundSparkline = await getWeeklySparkline(Item, { type: 'found' });
    const matchedSparkline = await getWeeklySparkline(Item, { status: 'matched' });
    const returnedSparkline = await getWeeklySparkline(Item, { status: 'resolved' });
    const pendingSparkline = await getWeeklySparkline(Claim, { status: 'pending' });

    res.json({
      totalStudents,
      totalLost,
      totalFound,
      matched,
      returned,
      pendingClaims,
      sparklines: {
        totalStudents: studentsSparkline,
        totalLost: lostSparkline,
        totalFound: foundSparkline,
        matched: matchedSparkline,
        returned: returnedSparkline,
        pendingClaims: pendingSparkline
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── 3. Recent Activity ──
router.get('/recent-activity', adminAuth, async (req, res) => {
  try {
    const recentItems = await Item.find().sort({ createdAt: -1 }).limit(5).populate('postedBy', 'name');
    const recentClaims = await Claim.find().sort({ createdAt: -1 }).limit(5).populate('itemId claimedBy');
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);

    const activities = [];

    recentItems.forEach(item => {
      activities.push({
        _id: item._id,
        type: 'item',
        title: item.type === 'lost' ? 'Lost Item Reported' : 'Found Item Reported',
        description: `"${item.title}" reported at ${item.location} by ${item.postedBy?.name || 'Anonymous'}`,
        createdAt: item.createdAt,
        statusType: item.type === 'lost' ? 'danger' : 'success'
      });
    });

    recentClaims.forEach(claim => {
      activities.push({
        _id: claim._id,
        type: 'claim',
        title: 'Claim Submitted',
        description: `${claim.claimedBy?.name || 'A student'} claimed "${claim.itemId?.title || 'an item'}"`,
        createdAt: claim.createdAt,
        statusType: 'warning'
      });
    });

    recentUsers.forEach(user => {
      activities.push({
        _id: user._id,
        type: 'user',
        title: 'New Student Registered',
        description: `${user.name} (${user.studentId || 'No ID'}) registered`,
        createdAt: user.createdAt,
        statusType: 'info'
      });
    });

    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(activities.slice(0, 8));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── 4. Unclaimed High Value Items ──
router.get('/unclaimed-high-value', adminAuth, async (req, res) => {
  try {
    const items = await Item.find({ type: 'found', status: 'reported' })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ══════════════════════════════════════════════
// 5. USERS
// ══════════════════════════════════════════════
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { studentId: { $regex: search, $options: 'i' } }
        ]
      };
    }
    const users = await User.find(query).sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/users/:id/suspend', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.status = 'suspended';
    await user.save();

    await AuditLog.create({
      action: 'SUSPEND_USER',
      details: `Suspended user ${user.name} (${user.email})`,
      performedBy: req.userId
    });

    res.json({ message: 'User suspended successfully', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/users/:id/activate', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.status = 'active';
    await user.save();

    await AuditLog.create({
      action: 'ACTIVATE_USER',
      details: `Re-activated user ${user.name} (${user.email})`,
      performedBy: req.userId
    });

    res.json({ message: 'User activated successfully', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/users/:id/role', adminAuth, async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.role = role;
    await user.save();

    await AuditLog.create({
      action: 'CHANGE_ROLE',
      details: `Changed role of user ${user.name} to ${role}`,
      performedBy: req.userId
    });

    res.json({ message: 'User role updated successfully', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await AuditLog.create({
      action: 'DELETE_USER',
      details: `Deleted user account ${user.name} (${user.email})`,
      performedBy: req.userId
    });

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/users/:id/posts — restored from old server.js
router.get('/users/:id/posts', adminAuth, async (req, res) => {
  try {
    const items = await Item.find({ postedBy: req.params.id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ══════════════════════════════════════════════
// 6. POSTS (Lost & Found management)
// ══════════════════════════════════════════════
router.get('/posts', adminAuth, async (req, res) => {
  try {
    const { type, status, category, dateFilter, search } = req.query;
    const filter = {};

    if (type && type !== 'all') filter.type = type;

    if (status && status !== 'all') {
      if (status === 'pending') {
        filter.status = 'reported';
      } else if (status === 'approved') {
        filter.status = { $in: ['approved', 'matched', 'resolved'] };
      } else {
        filter.status = status;
      }
    }

    if (category && category !== 'All Categories') filter.category = category;

    if (dateFilter && dateFilter === 'Last 30 Days') {
      const dateLimit = new Date();
      dateLimit.setDate(dateLimit.getDate() - 30);
      filter.createdAt = { $gte: dateLimit };
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const posts = await Item.find(filter)
      .sort({ createdAt: -1 })
      .populate('postedBy', 'name email studentId');

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/posts', adminAuth, async (req, res) => {
  try {
    const { type, category, title, location, date, description, studentEmail } = req.body;
    let postedBy = req.userId; // Default to admin

    if (studentEmail) {
      const student = await User.findOne({ email: studentEmail });
      if (student) postedBy = student._id;
    }

    const item = await Item.create({
      type,
      category,
      title,
      location,
      date,
      description,
      postedBy,
      status: 'approved' // Manually entered by admin, so pre-approved
    });

    await AuditLog.create({
      action: 'MANUAL_ENTRY',
      details: `Created manual post "${title}" (${type})`,
      performedBy: req.userId
    });

    res.json({ message: 'Manual post created!', item });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/admin/posts/:id/status — quick status change
router.patch('/posts/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const post = await Item.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!post) return res.status(404).json({ message: 'Post not found' });

    await AuditLog.create({
      action: 'UPDATE_POST_STATUS',
      details: `Updated post "${post.title}" status to ${status}`,
      performedBy: req.userId
    });

    res.json({ message: 'Post status updated', post });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/admin/posts/:id — full edit (restored from old server.js)
router.patch('/posts/:id', adminAuth, async (req, res) => {
  try {
    const { itemName, title, category, location, description } = req.body;
    const updatedFields = {
      title: itemName || title,
      category,
      location,
      description
    };
    const post = await Item.findByIdAndUpdate(req.params.id, updatedFields, { new: true });
    if (!post) return res.status(404).json({ message: 'Post not found' });

    await AuditLog.create({
      action: 'EDIT_POST',
      details: `Edited post "${post.title}"`,
      performedBy: req.userId
    });

    res.json({ message: 'Post updated', post });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/posts/:id', adminAuth, async (req, res) => {
  try {
    const post = await Item.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    await AuditLog.create({
      action: 'DELETE_POST',
      details: `Deleted post "${post.title}"`,
      performedBy: req.userId
    });

    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/admin/posts/bulk-delete — restored from old server.js
router.post('/posts/bulk-delete', adminAuth, async (req, res) => {
  try {
    const { ids } = req.body;
    await Item.deleteMany({ _id: { $in: ids } });

    await AuditLog.create({
      action: 'BULK_DELETE_POSTS',
      details: `Bulk deleted ${ids?.length || 0} posts`,
      performedBy: req.userId
    });

    res.json({ message: 'Posts deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ══════════════════════════════════════════════
// 7. CLAIMS MANAGEMENT
// ══════════════════════════════════════════════

// GET /api/admin/claims
// 🔧 FIXED: nested populate so item.postedBy (the finder/owner who made the
// original Lost/Found post) comes back as a full user object instead of a
// raw ObjectId string. Without this nested populate, the frontend's
// `item.postedBy.name` / `.studentId` / `.phone` fields are all undefined,
// which is why the admin dashboard was showing "N/A" everywhere.
router.get('/claims', adminAuth, async (req, res) => {
  try {
    const claims = await Claim.find()
      .populate({
        path: 'itemId',
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

router.patch('/claims/:id', adminAuth, async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
    const claim = await Claim.findById(req.params.id).populate('itemId');
    if (!claim) return res.status(404).json({ message: 'Claim not found' });

    claim.status = status;
    await claim.save();

    if (status === 'approved' && claim.itemId) {
      await Item.findByIdAndUpdate(claim.itemId._id, { status: 'resolved' });
    }

    await AuditLog.create({
      action: `CLAIM_${status.toUpperCase()}`,
      details: `${status === 'approved' ? 'Approved' : 'Rejected'} claim on item "${claim.itemId?.title || 'Unknown'}"`,
      performedBy: req.userId
    });

    res.json({ message: `Claim ${status} successfully`, claim });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ══════════════════════════════════════════════
// 8. FLAGGED CONTENT REPORTS (restored from old server.js, uses Report model)
// ══════════════════════════════════════════════
router.get('/flagged-reports', adminAuth, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const reports = await Report.find(filter)
      .populate({ path: 'post', select: 'title location category status image' })
      .populate('flaggedBy', 'name email')
      .sort({ createdAt: -1 });

    const mappedReports = reports.map(r => {
      const obj = r.toObject();
      if (obj.post) obj.post.itemName = obj.post.title;
      return obj;
    });
    res.json(mappedReports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/flagged-reports/:id', adminAuth, async (req, res) => {
  try {
    const { action } = req.body;
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    if (action === 'remove') {
      await Item.findByIdAndDelete(report.post);
      report.status = 'resolved';
      await report.save();
    } else if (action === 'dismiss') {
      report.status = 'resolved';
      await report.save();
    }

    await AuditLog.create({
      action: `FLAGGED_REPORT_${action?.toUpperCase() || 'HANDLED'}`,
      details: `Handled flagged report ${req.params.id}`,
      performedBy: req.userId
    });

    res.json({ message: 'Report handled', report });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ══════════════════════════════════════════════
// 9. ANALYTICS / REPORTS TAB
// ══════════════════════════════════════════════
router.get('/reports', adminAuth, async (req, res) => {
  try {
    const { period } = req.query; // 'Today', 'Week', 'Month'

    const weeklyTrends = [];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const getStartOfWeek = () => {
      const d = new Date();
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const mon = new Date(d.setDate(diff));
      mon.setHours(0, 0, 0, 0);
      return mon;
    };

    const startOfWeek = getStartOfWeek();

    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(startOfWeek);
      dayStart.setDate(startOfWeek.getDate() + i);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const lostCount = await Item.countDocuments({ type: 'lost', createdAt: { $gte: dayStart, $lte: dayEnd } });
      const foundCount = await Item.countDocuments({ type: 'found', createdAt: { $gte: dayStart, $lte: dayEnd } });

      weeklyTrends.push({ day: days[i], lost: lostCount, found: foundCount });
    }

    const categoriesData = await Item.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const totalItems = await Item.countDocuments();
    const categoriesBreakdown = categoriesData.map(c => ({
      category: c._id || 'Other',
      count: c.count,
      percentage: totalItems > 0 ? Math.round((c.count / totalItems) * 100) : 0
    })).sort((a, b) => b.count - a.count);

    const resolutionRates = [];
    for (let i = 4; i >= 0; i--) {
      const start = new Date();
      start.setDate(start.getDate() - (i + 1) * 7);
      const end = new Date();
      end.setDate(end.getDate() - i * 7);

      const totalInWeek = await Item.countDocuments({ createdAt: { $gte: start, $lte: end } });
      const resolvedInWeek = await Item.countDocuments({
        status: { $in: ['resolved', 'matched', 'approved'] },
        createdAt: { $gte: start, $lte: end }
      });

      const rate = totalInWeek > 0 ? Math.round((resolvedInWeek / totalInWeek) * 100) : 0;
      resolutionRates.push({ week: i === 0 ? 'Current' : `Week ${5 - i}`, rate });
    }

    const auditLogs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .populate('performedBy', 'name email')
      .limit(50);

    res.json({ weeklyTrends, categoriesBreakdown, resolutionRates, auditLogs, totalItems });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/weekly-report — legacy endpoint, restored for backwards compatibility
router.get('/weekly-report', adminAuth, async (req, res) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const lostCount = await Item.countDocuments({ type: 'lost', createdAt: { $gte: oneWeekAgo } });
    const foundCount = await Item.countDocuments({ type: 'found', createdAt: { $gte: oneWeekAgo } });
    const matchedCount = await Item.countDocuments({ status: 'matched', updatedAt: { $gte: oneWeekAgo } });
    const resolvedCount = await Item.countDocuments({ status: 'resolved', updatedAt: { $gte: oneWeekAgo } });

    const totalPostsThisWeek = lostCount + foundCount;
    const successRate = totalPostsThisWeek > 0
      ? Math.round((matchedCount / totalPostsThisWeek) * 100)
      : 0;

    const categoryData = await Item.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { category: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } }
    ]);

    const locationData = await Item.aggregate([
      { $group: { _id: '$location', count: { $sum: 1 } } },
      { $project: { location: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      weekStart: oneWeekAgo,
      weekEnd: new Date(),
      lostCount,
      foundCount,
      matchedCount,
      successRate,
      categoryBreakdown: categoryData,
      locationBreakdown: locationData
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ══════════════════════════════════════════════
// 10. NOTIFICATIONS
// ══════════════════════════════════════════════
router.get('/notifications', adminAuth, async (req, res) => {
  try {
    const notifications = await AdminNotification.find()
      .sort({ createdAt: -1 })
      .limit(30);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/notifications/:id/read', adminAuth, async (req, res) => {
  try {
    const notif = await AdminNotification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    res.json(notif);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/notifications/read-all', adminAuth, async (req, res) => {
  try {
    await AdminNotification.updateMany({ read: false }, { read: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
