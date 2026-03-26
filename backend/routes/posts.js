const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   GET /api/posts
router.get('/', async (req, res) => {
    try {
        // Fetch all posts, sort by newest
        const posts = await Post.find({}).sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/posts
router.post('/', protect, async (req, res) => {
    try {
        const { text, imageUrl, imageUrls, poll, promotion } = req.body;
        
        if (!text && !imageUrl && (!imageUrls || imageUrls.length === 0) && !poll && !promotion) {
            return res.status(400).json({ message: 'Post must contain text, an image, a poll, or a promotion' });
        }

        const postData = {
            author: req.user._id,
            authorName: req.user.name,
            authorHandle: req.user.handle,
            authorAvatar: req.user.avatarUrl,
            text,
            imageUrl,
            imageUrls: imageUrls || []
        };

        if (poll && poll.question && poll.options && poll.options.length >= 2) {
            postData.poll = {
                question: poll.question,
                options: poll.options.map(opt => ({ text: opt, votes: [] }))
            };
        }

        if (promotion && promotion.title && promotion.link) {
            postData.promotion = {
                title: promotion.title,
                description: promotion.description || '',
                buttonText: promotion.buttonText || 'Visit',
                category: promotion.category || 'General',
                link: promotion.link
            };
        }

        const post = new Post(postData);
        const createdPost = await post.save();
        res.status(201).json(createdPost);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/posts/:id/like
router.post('/:id/like', protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const username = req.user.name; // Requirements say store username
        
        if (post.likes.includes(username)) {
            // Unlike
            post.likes = post.likes.filter(name => name !== username);
        } else {
            // Like
            post.likes.push(username);
        }
        
        await post.save();
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/posts/:id/comment
router.post('/:id/comment', protect, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ message: 'Comment text is required' });
        }

        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const comment = {
            username: req.user.name,
            text
        };

        post.comments.push(comment);
        await post.save();
        
        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/posts/:id/comment/:commentId
router.delete('/:id/comment/:commentId', protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const comment = post.comments.id(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Allow delete if user is comment author OR post author
        if (comment.username !== req.user.name && post.author.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to delete' });
        }

        post.comments.pull({ _id: req.params.commentId });
        await post.save();
        
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/posts/:id
router.delete('/:id', protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check user ownership
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'User not authorized to delete this post' });
        }

        await post.deleteOne();
        res.json({ message: 'Post removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/posts/follow/:userId
router.post('/follow/:userId', protect, async (req, res) => {
    try {
        if (req.user._id.toString() === req.params.userId) {
            return res.status(400).json({ message: 'Cannot follow yourself' });
        }

        const targetUser = await User.findById(req.params.userId);
        if (!targetUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const currentUser = await User.findById(req.user._id);
        
        // Safety initialization for users created before this feature existed
        if (!currentUser.following) currentUser.following = [];
        if (!targetUser.followers) targetUser.followers = [];
        
        const isFollowing = currentUser.following.some(id => id.toString() === req.params.userId);

        if (isFollowing) {
            currentUser.following = currentUser.following.filter(id => id.toString() !== req.params.userId);
            targetUser.followers = targetUser.followers.filter(id => id.toString() !== req.user._id.toString());
        } else {
            currentUser.following.push(req.params.userId);
            targetUser.followers.push(req.user._id);
        }

        currentUser.followingCount = currentUser.following.length;
        targetUser.followersCount = targetUser.followers.length;

        await currentUser.save();
        await targetUser.save();

        res.json({ isFollowing: !isFollowing, followingCount: currentUser.following.length, followersCount: targetUser.followers.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/posts/:id/vote/:optionIndex
router.post('/:id/vote/:optionIndex', protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post || !post.poll || !post.poll.question) {
            return res.status(404).json({ message: 'Poll not found' });
        }

        const optionIndex = parseInt(req.params.optionIndex);
        if (optionIndex < 0 || optionIndex >= post.poll.options.length) {
            return res.status(400).json({ message: 'Invalid option' });
        }

        const username = req.user.name;

        // Remove previous vote if any
        post.poll.options.forEach(opt => {
            opt.votes = opt.votes.filter(v => v !== username);
        });

        // Cast new vote
        post.poll.options[optionIndex].votes.push(username);

        await post.save();
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/posts/:id/share
router.post('/:id/share', protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        post.shares = (post.shares || 0) + 1;
        await post.save();
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
