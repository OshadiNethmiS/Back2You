const mongoose = require('mongoose');

const adminNotificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['new_post', 'new_user', 'new_claim', 'new_report', 'match'],
    default: 'new_post'
  },
  referenceId: { type: mongoose.Schema.Types.ObjectId },
  read: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('AdminNotification', adminNotificationSchema);
