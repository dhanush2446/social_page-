import { Bell, Moon, Sun, LogOut, Search } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const getAvatarGradient = (name) => {
    const gradients = [
        'linear-gradient(135deg, #6366f1, #8b5cf6)',
        'linear-gradient(135deg, #ec4899, #f97316)',
        'linear-gradient(135deg, #06b6d4, #6366f1)',
        'linear-gradient(135deg, #10b981, #06b6d4)',
        'linear-gradient(135deg, #f59e0b, #ef4444)',
        'linear-gradient(135deg, #8b5cf6, #ec4899)',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return gradients[Math.abs(hash) % gradients.length];
};

const TopBar = () => {
    const { theme, toggleTheme } = useTheme();
    const { user, logout, refreshUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        refreshUser();
    }, []);

    const hasUnread = user?.notifications?.some(n => !n.read) || false;

    return (
        <div className="top-bar-container">
            <div className="top-header">
                <h2>Social</h2>
                <div className="top-actions">
                    <div className="points-badge">
                        <span className="coin">{user?.stars !== undefined ? user.stars : 60} ⭐</span>
                        <span className="cash">₹{user?.money !== undefined ? user.money.toFixed(2) : '0.00'}</span>
                    </div>
                    <div className="icon-wrapper" onClick={toggleTheme} title="Toggle theme">
                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    </div>
                    <div 
                        className={`icon-wrapper ${hasUnread ? 'badge-active' : ''}`} 
                        onClick={() => navigate('/notifications')} 
                        title="Notifications"
                        style={{ cursor: 'pointer' }}
                    >
                        <Bell size={18} />
                    </div>
                    <button className="logout-btn" onClick={logout} title="Logout">
                        <LogOut size={16} /> <span>Logout</span>
                    </button>
                    <div className="avatar-wrapper" style={{ background: getAvatarGradient(user?.name || 'U') }}>
                        <div className="avatar-placeholder" style={{ background: getAvatarGradient(user?.name || 'U') }}>
                            {user?.name?.[0] || 'U'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopBar;
