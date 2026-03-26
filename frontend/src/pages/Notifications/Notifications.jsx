import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Gift, Info, ShieldAlert, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { readNotifications } from '../../api';
import './Notifications.css';

const Notifications = () => {
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const markAsRead = async () => {
            if (user?.token && user?.notifications?.some(n => !n.read)) {
                try {
                    await readNotifications(user.token);
                    await refreshUser();
                } catch (e) {
                    console.error("Failed to mark notifications read", e);
                }
            }
            setLoading(false);
        };
        markAsRead();
    }, [user?.token]);

    const getIcon = (type) => {
        switch(type) {
            case 'reward': return <Gift size={20} className="text-pink" />;
            case 'follow': return <UserPlus size={20} className="text-cyan" />;
            case 'system': return <ShieldAlert size={20} className="text-violet" />;
            default: return <Info size={20} className="text-dust" />;
        }
    };

    return (
        <div className="feed-layout">
            <div className="top-bar-container">
                <div className="top-header">
                    <button className="icon-wrapper" onClick={() => navigate('/')} style={{ border: 'none', background: 'transparent' }}>
                        <ArrowLeft size={20} />
                    </button>
                    <h2>Notifications</h2>
                    <div className="top-actions"></div>
                </div>
            </div>

            <div className="feed-scroll-area">
                <div className="notifications-container">
                    {!user?.notifications || user.notifications.length === 0 ? (
                        <div className="empty-state">
                            <Bell size={48} className="empty-icon" />
                            <p>You have no notifications yet.</p>
                        </div>
                    ) : (
                        user.notifications.slice().reverse().map((n, idx) => (
                            <div key={idx} className={`notification-card ${!n.read ? 'unread' : ''}`}>
                                <div className="notif-icon-area">
                                    {getIcon(n.type)}
                                </div>
                                <div className="notif-content">
                                    <p className="notif-message">{n.message}</p>
                                    <span className="notif-time">{new Date(n.createdAt).toLocaleDateString()}</span>
                                </div>
                                {!n.read && <div className="unread-dot"></div>}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notifications;
