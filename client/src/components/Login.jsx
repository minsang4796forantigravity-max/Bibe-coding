import React, { useState } from 'react';
import { API_URL } from '../socket';
import './Login.css'; // We'll create this CSS file

const Login = ({ onLogin, onNavigate }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Save to localStorage for auto-login
                localStorage.setItem('bibeGameUser', JSON.stringify(data.user));
                onLogin(data.user);
            } else {
                setError(data.message || '로그인 실패');
            }
        } catch (err) {
            setError('서버 연결 오류');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <h2>LOGIN</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your hero name"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="auth-btn">ENTER ARENA</button>
                </form>
                <p className="auth-link">
                    New warrior? <span onClick={() => onNavigate('signup')}>Create Account</span>
                </p>
            </div>
        </div>
    );
};

export default Login;
