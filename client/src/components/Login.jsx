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
                onLogin(data.user);
            } else {
                setError(data.message || '로그인 실패');
            }
        } catch (err) {
            setError('서버 연결 오류');
        }
    };

    return (
        <div className="auth-container">
            <h2>로그인</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>아이디</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>비밀번호</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p className="error-message">{error}</p>}
                <button type="submit" className="auth-btn">로그인</button>
            </form>
            <p className="auth-link">
                계정이 없으신가요? <span onClick={() => onNavigate('signup')}>회원가입</span>
            </p>
        </div>
    );
};

export default Login;
