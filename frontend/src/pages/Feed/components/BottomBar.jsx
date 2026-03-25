import { Home, ClipboardList, Users, Trophy, User as UserIcon } from 'lucide-react';

const BottomBar = () => {
    return (
        <div className="bottom-bar">
            <div className="bottom-nav-item">
                <Home size={24} />
            </div>
            <div className="bottom-nav-item">
                <ClipboardList size={24} />
            </div>
            <div className="bottom-nav-item active-social">
                <div className="social-bubble">
                    <Users size={24} color="white" />
                </div>
                <span>Social</span>
            </div>
            <div className="bottom-nav-item relative">
                <Trophy size={24} />
                <span className="rank-badge">1</span>
            </div>
            <div className="bottom-nav-item">
                <UserIcon size={24} />
            </div>
        </div>
    );
};

export default BottomBar;
