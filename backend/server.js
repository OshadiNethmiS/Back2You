require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');
const adminRoutes = require('./routes/adminRoutes');
const claimRoutes = require('./routes/claimRoutes');

const app = express();

// ── Uploads folder auto-create ────────────────
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// ── Middleware ────────────────────────────────
// The frontend uses `withCredentials: true` on its axios instance.
// Browsers reject `origin: '*'` when credentials are involved, so we
// send back the EXACT origin instead, and set credentials: true here.
const allowedOrigins = (process.env.CLIENT_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // curl, mobile apps, Postman
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS: ' + origin));
  },
  credentials: true,
}));

app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// ── Database Connection ───────────────────────
connectDB();

// ══════════════════════════════════════════════
// ROUTES
// ══════════════════════════════════════════════
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/claims', claimRoutes);

// ── Test Route ────────────────────────────────
app.get('/test', (req, res) => {
  res.json({ message: 'Backend working!' });
});

// ── Start Server ──────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
