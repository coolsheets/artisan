const mongoose = require('mongoose');

const PromptSchema = new mongoose.Schema({
  original: { type: String, required: true },
  optimized: { type: String },
  atomized: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Prompt', PromptSchema);
