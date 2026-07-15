const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  password:  { type: String, required: true },
  role:      { type: String, default: 'student' },
  studentId: { type: String, default: '' },
  phone:     { type: String, default: '' },
  faculty:   { type: String, default: '' },
  status:    { type: String, default: 'active' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
