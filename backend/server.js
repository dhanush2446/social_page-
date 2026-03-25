const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

app.use(cors());
// increase limits for base64 image uploads
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/seed', require('./routes/seed'));

app.get('/', (req, res) => {
    res.send('TaskPlanet Clone API is running');
});

const PORT = process.env.PORT || 5000;

// Connect to DB and start server
if (process.env.NODE_ENV !== 'test') {
    connectDB().then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    }).catch(err => {
        console.log("FATAL MONGODB ERROR:", err.message);
        setTimeout(() => process.exit(1), 1000);
    });
}

module.exports = app;
