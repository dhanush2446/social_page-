const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

// @route   POST /api/auth/signup
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const handle = '@' + name.toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 1000);
        
        const user = await User.create({
            name,
            email,
            password,
            handle
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                handle: user.handle,
                following: user.following,
                followersCount: user.followersCount || 0,
                followingCount: user.followingCount || 0,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                handle: user.handle,
                following: user.following,
                followersCount: user.followersCount || 0,
                followingCount: user.followingCount || 0,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/auth/search?q=
router.get('/search', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query || query.trim().length < 1) {
            return res.json([]);
        }
        const regex = new RegExp(query, 'i');
        const users = await User.find({
            $or: [{ name: regex }, { handle: regex }]
        }).select('name handle avatarUrl followers following followersCount followingCount').limit(10);
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
