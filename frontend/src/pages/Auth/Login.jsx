import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loginCall } from '../../api';
import toast from 'react-hot-toast';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await loginCall(email, password);
            login(data);
            toast.success('Logged in successfully!');
            navigate('/');
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1 className="auth-title">Welcome Back</h1>
                <p className="auth-subtitle">Login to TaskPlanet Social Clone</p>
                
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <label>Email</label>
                        <input 
                            type="email" 
                            required 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="user@example.com"
                        />
                    </div>
                    <div className="input-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            required 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="••••••••"
                        />
                    </div>
                    <button type="submit" className="auth-button">Login</button>
                </form>
                <div className="auth-footer">
                    Don't have an account? <Link to="/signup">Sign up</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
