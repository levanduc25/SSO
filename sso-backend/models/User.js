const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    provider: { type: String, enum: ['google', 'github'], required: true },
    provider_id: { type: String, required: true },
    email: { type: String, index: true },
    name: String,
    avatar_url: String,
    last_login: { type: Date },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
);

userSchema.index({ provider: 1, provider_id: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);


