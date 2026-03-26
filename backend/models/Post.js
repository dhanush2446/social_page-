const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true },
    authorHandle: { type: String, required: true },
    authorAvatar: { type: String, default: '' },
    text: { type: String },
    imageUrl: { type: String },
    imageUrls: [{ type: String }],
    likes: [{ type: String }],
    comments: [{
        username: { type: String },
        text: { type: String },
        createdAt: { type: Date, default: Date.now }
    }],
    poll: {
        question: { type: String },
        options: [{
            text: { type: String },
            votes: [{ type: String }] // usernames who voted
        }]
    },
    promotion: {
        title: { type: String },
        description: { type: String },
        buttonText: { type: String },
        category: { type: String },
        link: { type: String }
    },
    shares: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
