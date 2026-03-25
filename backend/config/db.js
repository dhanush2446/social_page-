const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI || process.env.MONGO_URL;

        if (!uri) {
            throw new Error('CRITICAL FATAL: You definitely did NOT add MONGO_URI to the Render Environment Variables tab! It is completely missing!');
        }

        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        throw new Error(`MongoDB Connection Error: ${error.message}`);
    }
}

module.exports = connectDB;
