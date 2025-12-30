const mongoose = require('mongoose');

/**
 * MongoDB connection helper
 * - Uses modern mongoose.connect signature (no deprecated options)
 * - Reuses existing connection if already established
 */
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/codeshield';

    const conn = await mongoose.connect(uri);

    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;


