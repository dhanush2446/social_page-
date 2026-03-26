import { useState, useRef } from 'react';
import { Camera, Smile, AlignLeft, Megaphone, X, Plus, Trash2 } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';

const CreatePost = ({ onPostCreate, mainTab, setMainTab }) => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [text, setText] = useState('');
    const [images, setImages] = useState([]);
    const [showEmoji, setShowEmoji] = useState(false);
    
    // Poll state
    const [showPoll, setShowPoll] = useState(false);
    const [pollQuestion, setPollQuestion] = useState('');
    const [pollOptions, setPollOptions] = useState(['', '']);

    // Promotion state
    const [showPromotion, setShowPromotion] = useState(false);
    const [promoTitle, setPromoTitle] = useState('');
    const [promoDesc, setPromoDesc] = useState('');
    const [promoBtnText, setPromoBtnText] = useState('Visit');
    const [promoCategory, setPromoCategory] = useState('Refer and Earn');
    const [promoLink, setPromoLink] = useState('');
    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        if (images.length + files.length > 4) {
            toast.error("You can only attach up to 4 images per post.");
            return;
        }

        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImages(prev => {
                    if (prev.length >= 4) return prev;
                    return [...prev, reader.result];
                });
            };
            reader.readAsDataURL(file);
        });
        
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleRemoveImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleRemoveAllImages = () => {
        setImages([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleEmojiClick = (emojiData) => {
        setText(prev => prev + emojiData.emoji);
        textareaRef.current?.focus();
    };

    const addPollOption = () => {
        if (pollOptions.length < 4) {
            setPollOptions([...pollOptions, '']);
        }
    };

    const removePollOption = (index) => {
        if (pollOptions.length > 2) {
            setPollOptions(pollOptions.filter((_, i) => i !== index));
        }
    };

    const updatePollOption = (index, value) => {
        const newOpts = [...pollOptions];
        newOpts[index] = value;
        setPollOptions(newOpts);
    };

    const handleSubmit = () => {
        const hasPoll = showPoll && pollQuestion.trim() && pollOptions.filter(o => o.trim()).length >= 2;
        const hasPromo = showPromotion && promoTitle.trim() && promoLink.trim();
        if (!text && images.length === 0 && !hasPoll && !hasPromo) return;

        const postData = { text, imageUrls: images };
        if (hasPoll) {
            postData.poll = {
                question: pollQuestion.trim(),
                options: pollOptions.filter(o => o.trim())
            };
        }
        if (hasPromo) {
            postData.promotion = {
                title: promoTitle.trim(),
                description: promoDesc.trim(),
                buttonText: promoBtnText.trim(),
                category: promoCategory,
                link: promoLink.trim()
            };
        }

        onPostCreate(postData);
        setText('');
        setImages([]);
        setShowEmoji(false);
        setShowPoll(false);
        setPollQuestion('');
        setPollOptions(['', '']);
        setShowPromotion(false);
        setPromoTitle('');
        setPromoDesc('');
        setPromoBtnText('Visit');
        setPromoLink('');
    };

    const hasPollContent = showPoll && pollQuestion.trim() && pollOptions.filter(o => o.trim()).length >= 2;
    const hasPromoContent = showPromotion && promoTitle.trim() && promoLink.trim();
    const isButtonDisabled = !text.trim() && images.length === 0 && !hasPollContent && !hasPromoContent;

    return (
        <div className="create-post-card">
            <div className="cp-header">
                <h3>Create Post</h3>
                <div className="cp-tabs">
                    <span className={`cp-tab ${mainTab === 'all' ? 'active' : ''}`} onClick={() => setMainTab('all')}>All Posts</span>
                    <span className={`cp-tab ${mainTab === 'promotions' ? 'active' : ''}`} onClick={() => setMainTab('promotions')}>Promotions</span>
                </div>
            </div>
            
            <div className="cp-input-area">
                <textarea 
                    ref={textareaRef}
                    placeholder="What's on your mind?" 
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={3}
                />

                {showEmoji && (
                    <div className="emoji-picker-wrapper">
                        <EmojiPicker 
                            onEmojiClick={handleEmojiClick} 
                            theme={theme === 'dark' ? 'dark' : 'light'}
                            width={320}
                            height={380}
                            searchDisabled={false}
                            skinTonesDisabled
                            previewConfig={{ showPreview: false }}
                        />
                    </div>
                )}
            </div>

            {images.length > 0 && (
                <div className="image-preview-section">
                    <div className="images-header">
                        <span>Selected Images ({images.length}/4)</span>
                        <button className="remove-all" onClick={handleRemoveAllImages}>Remove All</button>
                    </div>
                    <div className="image-thumbnail-list" style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '8px 0' }}>
                        {images.map((img, index) => (
                            <div key={index} className="image-thumbnail" style={{ position: 'relative', minWidth: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden' }}>
                                <img src={img} alt={`upload preview ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <button className="remove-btn" onClick={() => handleRemoveImage(index)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', borderRadius: '50%', padding: '4px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <X size={14} color="white" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Poll Builder */}
            {showPoll && (
                <div className="poll-builder">
                    <div className="poll-builder-header">
                        <span>📊 Create a Poll</span>
                        <button className="poll-close-btn" onClick={() => { setShowPoll(false); setPollQuestion(''); setPollOptions(['', '']); }}>
                            <X size={16} />
                        </button>
                    </div>
                    <input 
                        type="text"
                        className="poll-question-input"
                        placeholder="Ask a question..."
                        value={pollQuestion}
                        onChange={(e) => setPollQuestion(e.target.value)}
                    />
                    <div className="poll-options-list">
                        {pollOptions.map((opt, index) => (
                            <div key={index} className="poll-option-input-row">
                                <input 
                                    type="text"
                                    placeholder={`Option ${index + 1}`}
                                    value={opt}
                                    onChange={(e) => updatePollOption(index, e.target.value)}
                                />
                                {pollOptions.length > 2 && (
                                    <button className="poll-remove-option" onClick={() => removePollOption(index)}>
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    {pollOptions.length < 4 && (
                        <button className="poll-add-option" onClick={addPollOption}>
                            <Plus size={14} /> Add option
                        </button>
                    )}
                </div>
            )}

            {/* Promotion Builder */}
            {showPromotion && (
                <div className="poll-builder promotion-builder">
                    <div className="poll-builder-header">
                        <span>🚀 Add a Promotion</span>
                        <button className="poll-close-btn" onClick={() => setShowPromotion(false)}>
                            <X size={16} />
                        </button>
                    </div>
                    <div className="promo-inputs">
                        <input type="text" className="poll-question-input" placeholder="Title (App/Website Name)" value={promoTitle} onChange={e => setPromoTitle(e.target.value)} />
                        <textarea className="poll-question-input" placeholder="Description" rows={2} value={promoDesc} onChange={e => setPromoDesc(e.target.value)} style={{ resize: 'none' }} />
                        <div className="promo-row">
                            <input type="text" className="poll-question-input" placeholder="Button Text (e.g., Download)" value={promoBtnText} onChange={e => setPromoBtnText(e.target.value)} style={{ flex: 1 }} />
                            <select className="poll-question-input promo-select" value={promoCategory} onChange={e => setPromoCategory(e.target.value)} style={{ flex: 1, cursor: 'pointer' }}>
                                <option value="Refer and Earn">Refer and Earn</option>
                                <option value="Crypto">Crypto</option>
                            </select>
                        </div>
                        <input type="url" className="poll-question-input" placeholder="Link (https://...)" value={promoLink} onChange={e => setPromoLink(e.target.value)} />
                    </div>
                </div>
            )}

            <div className="cp-footer">
                <div className="cp-actions">
                    <input 
                        type="file" 
                        accept="image/*" 
                        hidden 
                        multiple
                        ref={fileInputRef} 
                        onChange={handleImageChange}
                    />
                    <button className="icon-btn" onClick={() => fileInputRef.current.click()} title="Add images">
                        <Camera size={20} className="text-primary" />
                        {images.length > 0 && <span className="badge">{images.length}</span>}
                    </button>
                    <button className="icon-btn" onClick={() => setShowEmoji(!showEmoji)} title="Add emoji">
                        <Smile size={20} className={showEmoji ? 'text-primary' : ''} style={{ color: showEmoji ? 'var(--primary-color)' : 'var(--text-secondary)' }} />
                    </button>
                    <button className={`icon-btn ${showPoll ? 'poll-active' : ''}`} onClick={() => { setShowPoll(!showPoll); setShowPromotion(false); }} title="Create poll">
                        <AlignLeft size={20} style={{ color: showPoll ? 'var(--primary-color)' : 'var(--text-secondary)' }} />
                    </button>
                    <button className={`promote-btn ${showPromotion ? 'active-promo' : ''}`} onClick={() => { setShowPromotion(!showPromotion); setShowPoll(false); }}>
                        <Megaphone size={16} /> Promote
                    </button>
                </div>
                <button 
                    className={`post-submit-btn ${isButtonDisabled ? 'disabled' : ''}`}
                    disabled={isButtonDisabled}
                    onClick={handleSubmit}
                >
                    ▶ Post
                </button>
            </div>
        </div>
    );
};

export default CreatePost;
