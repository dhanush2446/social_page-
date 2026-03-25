require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI)
.then(async () => {
    try {
        const users = await User.find({});
        console.log('Users count:', users.length);
        
        const a = users.find(u => u.handle.includes('a187'));
        const e = users.find(u => u.handle.includes('e206'));
        const admin = users.find(u => u.handle.includes('atlas'));
        
        console.log('Admin:', admin?._id, 'A:', a?._id, 'E:', e?._id);
        
        if (admin && e) {
            console.log('Attempting simulated follow admin -> e');
            const currentUser = await User.findById(admin._id);
            const targetUser = await User.findById(e._id);
            
            if (!currentUser.following) currentUser.following = [];
            if (!targetUser.followers) targetUser.followers = [];
            
            const isFollowing = currentUser.following.some(id => id.toString() === targetUser._id.toString());
            console.log('Initial isFollowing:', isFollowing);
            
            if (isFollowing) {
                currentUser.following = currentUser.following.filter(id => id.toString() !== targetUser._id.toString());
                targetUser.followers = targetUser.followers.filter(id => id.toString() !== admin._id.toString());
            } else {
                currentUser.following.push(targetUser._id);
                targetUser.followers.push(admin._id);
            }
            
            await currentUser.save();
            await targetUser.save();
            console.log('Follow logic executed successfully!');
            console.log('New following count:', currentUser.following.length);
        } else {
            console.log('Users not found in DB!');
        }
    } catch (err) {
        console.error('ERROR OCCURRED:', err.message, err.stack);
    }
    process.exit(0);
})
.catch(err => {
    console.error('DB connect err:', err);
    process.exit(1);
});
