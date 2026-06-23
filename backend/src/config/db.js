const mongoose = require('mongoose');

/**
 * Connects to MongoDB using the URI supplied in the environment.
 * Exits the process on failure since the API is unusable without a database.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[db] MongoDB connected -> ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[db] MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
