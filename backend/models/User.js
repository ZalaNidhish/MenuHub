// backend/models/User.js - FIXED VERSION
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: false,  // NOT REQUIRED - can be null
    sparse: true      // Allows multiple null values
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      // Password required only if not using Google
      return !this.googleId;
    }
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  picture: {
    type: String
  },
  role: {
    type: String,
    enum: ['user', 'owner', 'admin'],
    default: 'user'
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant'
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash if password is modified or new
  if (!this.isModified('password')) {
    return next();
  }
  
  // Skip if no password (Google users)
  if (!this.password) {
    return next();
  }
  
  try {
    console.log('🔐 Hashing password...');
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('✅ Password hashed');
    next();
  } catch (error) {
    console.error('❌ Error hashing password:', error);
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) {
    console.log('⚠️ No password stored for this user');
    return false;
  }
  
  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
  } catch (error) {
    console.error('❌ Error comparing password:', error);
    return false;
  }
};

module.exports = mongoose.model('User', userSchema);