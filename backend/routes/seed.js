const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');

// Seed sample data
router.post('/seed', async (req, res) => {
    try {
        // Check if seed data already exists
        const existingPosts = await Post.countDocuments();
        if (existingPosts > 0) {
            return res.json({ message: 'Seed data already exists', count: existingPosts });
        }

        // Create sample users
        const sampleUsers = [
            { name: 'Priya Sharma', email: 'priya@demo.com', password: 'demo123', handle: '@priyasharma', avatarUrl: '' },
            { name: 'Arjun Patel', email: 'arjun@demo.com', password: 'demo123', handle: '@arjunpatel', avatarUrl: '' },
            { name: 'Neha Gupta', email: 'neha@demo.com', password: 'demo123', handle: '@nehagupta', avatarUrl: '' },
            { name: 'Rohan Singh', email: 'rohan@demo.com', password: 'demo123', handle: '@rohansingh', avatarUrl: '' },
            { name: 'Ananya Reddy', email: 'ananya@demo.com', password: 'demo123', handle: '@ananyareddy', avatarUrl: '' },
        ];

        const createdUsers = [];
        for (const u of sampleUsers) {
            const existing = await User.findOne({ email: u.email });
            if (existing) {
                createdUsers.push(existing);
            } else {
                const user = await User.create(u);
                createdUsers.push(user);
            }
        }

        // Create sample posts with varied likes, comments, and content
        const samplePosts = [
            {
                author: createdUsers[0]._id,
                authorName: 'Priya Sharma',
                authorHandle: '@priyasharma',
                authorAvatar: '',
                text: '🏆 LEADERBOARD ACHIEVEMENT 🏆\n🎯 I secured rank in TaskPlanet Leaderboard!\n\n💪 Play now and join the competition!\n\n#TaskPlanet #Leaderboard #Winning',
                imageUrl: '',
                likes: ['Arjun Patel', 'Neha Gupta', 'Rohan Singh', 'Ananya Reddy'],
                comments: [
                    { username: 'Arjun Patel', text: 'Amazing achievement! Keep it up! 🔥' },
                    { username: 'Neha Gupta', text: 'Congratulations Priya! Well deserved 👏' },
                    { username: 'Rohan Singh', text: 'Incredible! I need to step up my game 😄' },
                ]
            },
            {
                author: createdUsers[1]._id,
                authorName: 'Arjun Patel',
                authorHandle: '@arjunpatel',
                authorAvatar: '',
                text: '🚀 Just completed my 30-day coding challenge!\n\nBuilt 30 projects in 30 days using React, Node.js, and MongoDB. The journey was incredible!\n\n#CodingChallenge #WebDev #React #NodeJS',
                imageUrl: '',
                likes: ['Priya Sharma', 'Neha Gupta', 'Ananya Reddy', 'Rohan Singh'],
                comments: [
                    { username: 'Priya Sharma', text: 'This is so inspiring! Can you share the repo?' },
                    { username: 'Neha Gupta', text: 'Wow, 30 projects! That\'s dedication 💪' },
                    { username: 'Ananya Reddy', text: 'Following your journey has been amazing!' },
                    { username: 'Rohan Singh', text: 'You should write a blog about this experience!' },
                    { username: 'Priya Sharma', text: 'Bookmarked for future reference 📌' },
                ]
            },
            {
                author: createdUsers[2]._id,
                authorName: 'Neha Gupta',
                authorHandle: '@nehagupta',
                authorAvatar: '',
                text: '☕ Morning vibes at my favorite café!\n\nNothing beats a hot cappuccino and a good book on a rainy day. What are you all reading these days? 📚',
                imageUrl: '',
                likes: ['Priya Sharma', 'Arjun Patel'],
                comments: [
                    { username: 'Priya Sharma', text: 'Currently reading Atomic Habits! Highly recommend 📖' },
                    { username: 'Arjun Patel', text: 'That café looks cozy! Where is it?' },
                ]
            },
            {
                author: createdUsers[3]._id,
                authorName: 'Rohan Singh',
                authorHandle: '@rohansingh',
                authorAvatar: '',
                text: '🎨 Just finished my latest digital art piece!\n\nSpent 12 hours on this one. The theme is "Future Cities". Let me know what you think!\n\n#DigitalArt #CreativeDesign #FutureCities',
                imageUrl: '',
                likes: ['Priya Sharma', 'Arjun Patel', 'Neha Gupta', 'Ananya Reddy'],
                comments: [
                    { username: 'Ananya Reddy', text: 'The color palette is absolutely stunning! 🎨' },
                    { username: 'Priya Sharma', text: 'You should sell NFTs of your art!' },
                    { username: 'Neha Gupta', text: '12 hours well spent. This is a masterpiece!' },
                    { username: 'Arjun Patel', text: 'Can I use this as my wallpaper? 😍' },
                    { username: 'Priya Sharma', text: 'Would love to see a timelapse of your process!' },
                    { username: 'Neha Gupta', text: 'Please do a tutorial! I want to learn this style' },
                    { username: 'Rohan Singh', text: 'Thanks everyone! Tutorial coming soon 🙌' },
                ]
            },
            {
                author: createdUsers[4]._id,
                authorName: 'Ananya Reddy',
                authorHandle: '@ananyareddy',
                authorAvatar: '',
                text: '🎓 Excited to announce that I got selected for Google Summer of Code 2026!\n\nI\'ll be contributing to an open-source ML project. Dreams do come true if you keep working hard! ✨\n\n#GSoC2026 #OpenSource #MachineLearning',
                imageUrl: '',
                likes: ['Priya Sharma', 'Arjun Patel', 'Neha Gupta', 'Rohan Singh'],
                comments: [
                    { username: 'Arjun Patel', text: 'HUGE congratulations Ananya!! 🎉🎉' },
                    { username: 'Priya Sharma', text: 'So proud of you! You deserve this!' },
                    { username: 'Rohan Singh', text: 'GSoC is a massive achievement. Well done!' },
                    { username: 'Neha Gupta', text: 'This is incredible! Can you share your proposal?' },
                    { username: 'Arjun Patel', text: 'The ML community is lucky to have you!' },
                    { username: 'Priya Sharma', text: 'Party time! 🥳🥳' },
                ]
            },
            {
                author: createdUsers[0]._id,
                authorName: 'Priya Sharma',
                authorHandle: '@priyasharma',
                authorAvatar: '',
                text: '💡 Pro tip for developers:\n\nAlways write code as if the person who will maintain it is a violent psychopath who knows where you live. 😂\n\nSeriously though, clean code saves lives (and weekends).\n\n#DevHumor #CleanCode #Programming',
                imageUrl: '',
                likes: ['Arjun Patel', 'Rohan Singh', 'Ananya Reddy'],
                comments: [
                    { username: 'Arjun Patel', text: '😂😂 This is so accurate!' },
                    { username: 'Rohan Singh', text: 'I feel personally attacked by this post lol' },
                ]
            },
        ];

        await Post.insertMany(samplePosts);

        res.status(201).json({ message: 'Seed data created successfully!', posts: samplePosts.length, users: createdUsers.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
