// backend/config/db.js - FIXED VERSION
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('🔄 Attempting MongoDB connection...');
    console.log('MongoDB URI:', process.env.MONGO_URI ? 'exists' : 'missing');
    
    // Add connection options to handle timeouts
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000, // 30 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
    });
    
    console.log('✅ MongoDB Connected Successfully');
    console.log('Database:', mongoose.connection.name);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.error('Error details:', error);
    
    // Don't exit, let the app continue
    console.log('⚠️ Server will continue without database connection');
    console.log('⚠️ Please check your MongoDB Atlas:');
    console.log('   1. Network Access - Add your IP address (0.0.0.0/0 for testing)');
    console.log('   2. Database User - Verify username/password');
    console.log('   3. Connection String - Check if it\'s correct');
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('🟢 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('🔴 Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🟡 Mongoose disconnected from MongoDB');
});

module.exports = connectDB;