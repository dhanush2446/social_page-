const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI || process.env.MONGO_URL;

        if (!uri) {
            console.error('Neither MONGO_URI nor MONGO_URL is defined in Render Environment Variables!');
            process.exit(1);
        }

        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        throw new Error(`MongoDB Connection Error: ${error.message}`);
    }
}

module.exports = connectDB;
