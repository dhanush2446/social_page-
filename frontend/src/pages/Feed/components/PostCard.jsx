import { Heart, MessageSquare, Share2, Trash2, Send, ExternalLink, Copy } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useState } from 'react';
import toast from 'react-hot-toast';

const WhatsAppIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
  </svg>
);

const InstagramIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const TwitterIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5 2.7 12 2.7 12c.3.2.6.3 1 .3-1.3-.9-2.2-2-2.2-3.8 0-.4.1-.9.3-1.3C4.2 11.4 8 13.5 12 13.5c-.2-2.8 2-5 4.8-5 1.2 0 2.3.5 3 1.3.8-.2 1.6-.5 2.4-.9-.3.8-.9 1.5-1.6 2z"></path>
  </svg>
);

// Generate consistent avatar colors per name
const avatarColors = [
    'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    'linear-gradient(135deg, #ec4899 0%, #f97316 100%)',
    'linear-gradient(135deg, #06b6d4 0%, #6366f1 100%)',
    'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
    'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
    'linear-gradient(135deg, #f97316 0%, #f59e0b 100%)',
    'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
];

const getAvatarColor = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return avatarColors[Math.abs(hash) % avatarColors.length];
};

const PostCard = ({ post, onLike, onComment, onDeleteComment, onDelete, onFollow, onVote, onShare }) => {
    const { user } = useAuth();
    const hasLiked = user && post.likes.includes(user.name);
    const [commentText, setCommentText] = useState('');
    const [showComments, setShowComments] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [justLiked, setJustLiked] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const isOwnPost = user && (user.name === post.authorName || user._id === post.author);
    const isFollowing = user && (user.following || []).includes(post.author);

    const handleLikeClick = () => {
        onLike(post._id);
        if (!hasLiked) {
            setJustLiked(true);
            setTimeout(() => setJustLiked(false), 600);
        }
    };

    const handleCommentSubmit = () => {
        if (commentText.trim()) {
            onComment(post._id, commentText);
            setCommentText('');
        }
    };

    const handleDeleteClick = () => {
        if (confirmDelete) {
            onDelete(post._id);
            setConfirmDelete(false);
        } else {
            setConfirmDelete(true);
            setTimeout(() => setConfirmDelete(false), 3000);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    // Poll helpers
    const hasPoll = post.poll && post.poll.question;
    const totalVotes = hasPoll ? post.poll.options.reduce((sum, opt) => sum + opt.votes.length, 0) : 0;
    const userVotedIndex = hasPoll ? post.poll.options.findIndex(opt => opt.votes.includes(user?.name)) : -1;

    const handleShareOption = (platform) => {
        const postUrl = `${window.location.origin}/post/${post._id}`;
        const encodedUrl = encodeURIComponent(postUrl);
        const text = `Check out this post from ${post.authorName} on TaskPlanet Clone!\n\n${postUrl}`;
        const encodedText = encodeURIComponent(text);

        setShowShareMenu(false);
        onShare(post._id); // Update DB counter

        if (platform === 'whatsapp') {
            window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
        } else if (platform === 'twitter') {
            window.open(`https://twitter.com/intent/tweet?text=${encodedText}`, '_blank');
        } else if (platform === 'instagram') {
            navigator.clipboard.writeText(text);
            toast.success('Text copied! Opening Instagram...');
            setTimeout(() => window.open('https://instagram.com', '_blank'), 1000);
        } else if (platform === 'copy') {
            navigator.clipboard.writeText(postUrl);
            toast.success('Link copied! ✨');
        }
    };

    return (
        <div className="post-card" style={{ zIndex: showShareMenu ? 50 : 1 }}>
            <div className="post-header">
                <div className="post-user-info">
                    <div className="post-avatar">
                        {post.authorAvatar ? (
                            <img src={post.authorAvatar} alt="avatar" />
                        ) : (
                            <div className="avatar-initial" 
                                style={{ background: getAvatarColor(post.authorName) }}>
                                {post.authorName[0]}
                            </div>
                        )}
                    </div>
                    <div className="post-meta">
                        <div className="post-author-row">
                            <span className="post-author">{post.authorName}</span>
                            <span className="post-handle">{post.authorHandle}</span>
                        </div>
                        <span className="post-date">{formatDate(post.createdAt)}</span>
                    </div>
                </div>
                {!isOwnPost && (
                    <button 
                        className={`follow-btn ${isFollowing ? 'following' : ''}`}
                        onClick={() => onFollow(post.author)}
                    >
                        {isFollowing ? 'Following' : 'Follow'}
                    </button>
                )}
            </div>

            <div className="post-content">
                {post.text && <p className="post-text">{post.text}</p>}
                {post.imageUrl && (
                    <div className="post-image-wrapper">
                        <img src={post.imageUrl} alt="post content" className="post-image" />
                    </div>
                )}

                {/* Poll UI */}
                {hasPoll && (
                    <div className="poll-container">
                        <div className="poll-question">{post.poll.question}</div>
                        <div className="poll-options">
                            {post.poll.options.map((option, index) => {
                                const votePercent = totalVotes > 0 ? Math.round((option.votes.length / totalVotes) * 100) : 0;
                                const isVoted = userVotedIndex === index;
                                const hasUserVoted = userVotedIndex !== -1;

                                return (
                                    <button 
                                        key={index}
                                        className={`poll-option ${isVoted ? 'voted' : ''} ${hasUserVoted ? 'show-results' : ''}`}
                                        onClick={() => onVote(post._id, index)}
                                    >
                                        <div 
                                            className="poll-option-bar" 
                                            style={{ width: hasUserVoted ? `${votePercent}%` : '0%' }}
                                        ></div>
                                        <span className="poll-option-text">{option.text}</span>
                                        {hasUserVoted && <span className="poll-option-percent">{votePercent}%</span>}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="poll-footer">{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</div>
                    </div>
                )}

                {/* Promotion UI */}
                {post.promotion && post.promotion.title && (
                    <div className="promo-card">
                        <div className="promo-header">
                            <span className="promo-category">{post.promotion.category}</span>
                            <h4 className="promo-title">{post.promotion.title}</h4>
                        </div>
                        {post.promotion.description && <p className="promo-desc">{post.promotion.description}</p>}
                        <button 
                            className="promo-action-btn" 
                            onClick={() => window.open(post.promotion.link, '_blank')}
                        >
                            {post.promotion.buttonText || 'Visit'} <ExternalLink size={14} />
                        </button>
                    </div>
                )}
            </div>

            <div className="post-actions">
                <button 
                    className={`action-btn ${hasLiked ? 'liked' : ''}`} 
                    onClick={handleLikeClick}
                >
                    <Heart 
                        size={20} 
                        fill={hasLiked ? 'currentColor' : 'none'} 
                        className={justLiked ? 'heart-animate' : ''}
                    />
                    <span>{post.likes.length}</span>
                </button>
                <button className="action-btn" onClick={() => setShowComments(!showComments)}>
                    <MessageSquare size={20} />
                    <span>{post.comments.length}</span>
                </button>
                <div className="spacer"></div>
                {isOwnPost && (
                    <button 
                        className={`action-btn delete ${confirmDelete ? 'confirm-active' : ''}`} 
                        onClick={handleDeleteClick} 
                        title={confirmDelete ? 'Click again to confirm' : 'Delete Post'}
                    >
                        <Trash2 size={20} />
                        {confirmDelete && <span>Delete?</span>}
                    </button>
                )}
                <div className="relative">
                    <button className="action-btn" onClick={() => setShowShareMenu(!showShareMenu)}>
                        <Share2 size={20} />
                        {(post.shares || 0) > 0 && <span>{post.shares}</span>}
                    </button>
                    {showShareMenu && (
                        <div className="share-dropdown">
                            <button className="share-option" onClick={() => handleShareOption('whatsapp')}>
                                <WhatsAppIcon size={16} /> WhatsApp
                            </button>
                            <button className="share-option" onClick={() => handleShareOption('twitter')}>
                                <TwitterIcon size={16} /> X / Twitter
                            </button>
                            <button className="share-option" onClick={() => handleShareOption('instagram')}>
                                <InstagramIcon size={16} /> Instagram
                            </button>
                            <button className="share-option" onClick={() => handleShareOption('copy')}>
                                <Copy size={16} /> Copy Link
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {showComments && (
                <div className="comments-section">
                    <div className="comments-list">
                        {post.comments.map((comment, index) => (
                            <div key={index} className="comment-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <strong>{comment.username}</strong> {comment.text}
                                </div>
                                {user && (user.name === comment.username || isOwnPost) && (
                                    <button 
                                        onClick={() => onDeleteComment(post._id, comment._id)}
                                        style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                                        title="Delete comment"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        ))}
                        {post.comments.length === 0 && (
                            <div style={{ color: 'var(--text-tertiary)', fontSize: '14px', padding: '8px' }}>
                                No comments yet. Be the first!
                            </div>
                        )}
                    </div>
                    <div className="comment-input-area">
                        <textarea 
                            placeholder="Write a comment..." 
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            rows={2}
                        />
                        <button 
                            className="comment-send-btn"
                            onClick={handleCommentSubmit}
                            disabled={!commentText.trim()}
                            title="Send comment"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostCard;
