const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  type:        { type: String, required: true },
  category:    { type: String, required: true },
  title:       { type: String, required: true },
  location:    { type: String, required: true },
  date:        { type: String, required: true },
  description: { type: String },
  image:       { type: String },
  postedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status:      { type: String, default: 'reported' },  
  createdAt:   { type: Date, default: Date.now, expires: 60 * 60 * 24 * 14 }
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);