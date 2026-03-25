import { useState, useEffect, useRef } from 'react';
import TopBar from './components/TopBar';
import CreatePost from './components/CreatePost';
import PostCard from './components/PostCard';
import BottomBar from './components/BottomBar';
import { Plus, Search } from 'lucide-react';
import { fetchPosts, createPost, likePost, commentPost, deleteComment, deletePost, followUser, searchUsers, votePoll, sharePost } from '../../api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './Feed.css';

const API_URL = 'http://localhost:5000/api';

const SkeletonLoader = () => (
    <div className="loading-container">
        {[1, 2, 3].map(i => (
            <div className="skeleton-card" key={i}>
                <div className="skeleton-header">
                    <div className="skeleton-avatar"></div>
                    <div style={{ flex: 1 }}>
                        <div className="skeleton-line medium"></div>
                        <div className="skeleton-line short"></div>
                    </div>
                </div>
                <div className="skeleton-line full"></div>
                <div className="skeleton-line full"></div>
                <div className="skeleton-line medium"></div>
            </div>
        ))}
    </div>
);

const Feed = () => {
    const { user, login } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [mainTab, setMainTab] = useState('all'); // 'all' | 'promotions'
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const searchTimeout = useRef(null);

    const seedData = async () => {
        try {
            await fetch(`${API_URL}/seed/seed`, { method: 'POST' });
        } catch (e) {}
    };

    const loadPosts = async () => {
        try {
            await seedData();
            const data = await fetchPosts(user.token);
            setPosts(data);
        } catch (error) {
            toast.error('Failed to fetch posts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPosts();
    }, []);

    // Search users with debounce
    useEffect(() => {
        if (searchQuery.trim().length >= 1) {
            clearTimeout(searchTimeout.current);
            searchTimeout.current = setTimeout(async () => {
                try {
                    const results = await searchUsers(user.token, searchQuery);
                    setSearchResults(results);
                    setShowSearchDropdown(true);
                } catch (e) {
                    setSearchResults([]);
                }
            }, 300);
        } else {
            setSearchResults([]);
            setShowSearchDropdown(false);
            setSelectedUser(null);
        }
        return () => clearTimeout(searchTimeout.current);
    }, [searchQuery]);

    const handleSelectUser = (selectedUserResult) => {
        setSelectedUser(selectedUserResult);
        setSearchQuery(selectedUserResult.name);
        setShowSearchDropdown(false);
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSelectedUser(null);
        setSearchResults([]);
        setShowSearchDropdown(false);
    };

    const handleCreatePost = async (postData) => {
        const loadingToast = toast.loading('Posting...');
        try {
            const newPost = await createPost(user.token, postData);
            setPosts([newPost, ...posts]);
            toast.success('Posted! 🎉', { id: loadingToast });
        } catch (error) {
            toast.error('Failed to create post', { id: loadingToast });
        }
    };

    const handleLike = async (postId) => {
        try {
            const updatedPost = await likePost(user.token, postId);
            setPosts(posts.map(p => p._id === postId ? updatedPost : p));
        } catch (error) {
            toast.error('Action failed');
        }
    };

    const handleComment = async (postId, text) => {
        try {
            const updatedPost = await commentPost(user.token, postId, text);
            setPosts(posts.map(p => p._id === postId ? updatedPost : p));
            toast.success('Comment added!');
        } catch (error) {
            toast.error('Failed to comment');
        }
    };

    const handleDeleteComment = async (postId, commentId) => {
        try {
            const updatedPost = await deleteComment(user.token, postId, commentId);
            setPosts(posts.map(p => p._id === postId ? updatedPost : p));
            toast.success('Comment deleted');
        } catch (error) {
            toast.error('Failed to delete comment');
        }
    };

    const handleDelete = async (postId) => {
        try {
            await deletePost(user.token, postId);
            setPosts(posts.filter(p => p._id !== postId));
            toast.success('Post removed into the void ☄️');
        } catch (error) {
            toast.error('Failed to delete post');
        }
    };

    const handleFollow = async (userId) => {
        try {
            const result = await followUser(user.token, userId);
            // Update local user following list
            const updatedFollowing = result.isFollowing
                ? [...(user.following || []), userId]
                : (user.following || []).filter(id => id !== userId);
            login({ ...user, following: updatedFollowing });
            toast.success(result.isFollowing ? 'Following! ✨' : 'Unfollowed');
        } catch (error) {
            toast.error(`Action failed: ${error.message}`);
        }
    };

    const handleVote = async (postId, optionIndex) => {
        try {
            const updatedPost = await votePoll(user.token, postId, optionIndex);
            setPosts(posts.map(p => p._id === postId ? updatedPost : p));
        } catch (error) {
            toast.error('Failed to vote');
        }
    };

    const handleShare = async (postId) => {
        try {
            const updatedPost = await sharePost(user.token, postId);
            setPosts(posts.map(p => p._id === postId ? updatedPost : p));
        } catch (error) {
            toast.error('Failed to register share');
        }
    };

    // Filter logic
    const getFilteredPosts = () => {
        let filtered = [...posts];

        // If a user is selected from search, filter to their posts only
        if (selectedUser) {
            filtered = filtered.filter(p => p.author === selectedUser._id);
        }

        // Main Tab logic (All Posts vs Promotions)
        if (mainTab === 'promotions') {
            filtered = filtered.filter(p => p.promotion && p.promotion.title);
        }

        switch (activeFilter) {
            case 'foryou':
                // Show posts from users the current user follows
                filtered = filtered.filter(p => (user.following || []).includes(p.author));
                break;
            case 'mostliked':
                filtered.sort((a, b) => b.likes.length - a.likes.length);
                break;
            case 'mostcommented':
                filtered.sort((a, b) => b.comments.length - a.comments.length);
                break;
            case 'mostshared':
                filtered.sort((a, b) => (b.shares || 0) - (a.shares || 0));
                break;
            default: // 'all' — newest first
                break;
        }

        // If no user selected and there's a text search, also filter by text
        if (!selectedUser && searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(post =>
                post.authorName.toLowerCase().includes(q) ||
                post.authorHandle.toLowerCase().includes(q) ||
                (post.text && post.text.toLowerCase().includes(q))
            );
        }

        return filtered;
    };

    const filteredPosts = getFilteredPosts();
    const filters = [
        { key: 'all', label: 'All Post' },
        { key: 'foryou', label: 'For You' },
        { key: 'mostliked', label: 'Most Liked' },
        { key: 'mostcommented', label: 'Most Commented' },
        { key: 'mostshared', label: 'Most Shared' },
    ];

    return (
        <div className="feed-layout">
            <TopBar />
            
            <div className="main-content feed-scroll">
                {/* Search Bar */}
                <div className="search-container" style={{ position: 'relative' }}>
                    <Search size={20} className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search for accounts or keywords..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => searchResults.length > 0 && setShowSearchDropdown(true)}
                    />
                    {searchQuery && (
                        <button className="search-clear-btn" onClick={clearSearch}>&times;</button>
                    )}
                    {showSearchDropdown && searchResults.length > 0 && (
                        <div className="search-dropdown">
                            {searchResults.map(u => (
                                <div key={u._id} className="search-result-item" onClick={() => handleSelectUser(u)}>
                                    <div className="search-result-avatar">
                                        {u.name[0]}
                                    </div>
                                    <div>
                                        <div className="search-result-name">{u.name}</div>
                                        <div className="search-result-handle">{u.handle}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <CreatePost onPostCreate={handleCreatePost} mainTab={mainTab} setMainTab={setMainTab} />
                
                <div className="filters-row hide-scrollbar">
                    {filters.map(f => (
                        <button 
                            key={f.key}
                            className={`filter-chip ${activeFilter === f.key ? 'active' : ''}`}
                            onClick={() => setActiveFilter(f.key)}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                <div className="posts-container">
                    {loading ? (
                        <SkeletonLoader />
                    ) : filteredPosts.length === 0 ? (
                        <div className="text-center" style={{ marginTop: '2rem', color: 'var(--text-dust)', fontSize: '15px' }}>
                            {activeFilter === 'foryou' 
                                ? 'Follow some accounts to see their posts here! 🌟' 
                                : searchQuery 
                                    ? 'No accounts or posts found. 🛸' 
                                    : 'No posts yet. Be the first to post! 🚀'}
                        </div>
                    ) : (
                        filteredPosts.map(post => (
                            <PostCard 
                                key={post._id} 
                                post={post} 
                                onLike={handleLike} 
                                onComment={handleComment} 
                                onDeleteComment={handleDeleteComment}
                                onDelete={handleDelete}
                                onFollow={handleFollow}
                                onVote={handleVote}
                                onShare={handleShare}
                            />
                        ))
                    )}
                </div>
            </div>

            <button className="circular-add-btn" title="Create post" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <Plus size={24} color="white" />
            </button>

            <BottomBar />
        </div>
    );
};

export default Feed;
