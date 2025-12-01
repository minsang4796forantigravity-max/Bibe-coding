import React, { useState } from 'react';
import { API_URL } from '../socket';
import './Login.css'; // Reuse Login CSS

const Signup = ({ onNavigate }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Auto-login after successful signup
                try {
                    const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, password }),
                    });
                    const loginData = await loginResponse.json();

                    if (loginResponse.ok) {
                        // Save to localStorage for auto-login
                        localStorage.setItem('bibeGameUser', JSON.stringify(loginData.user));
                        alert('회원가입 성공! 자동 로그인됩니다.');
                        // Reload page to trigger auto-login
                        window.location.reload();
                    } else {
                        alert('회원가입 성공! 로그인해주세요.');
                        onNavigate('login');
                    }
                } catch (loginErr) {
                    alert('회원가입 성공! 로그인해주세요.');
                    onNavigate('login');
                }
            } else {
                setError(data.message || '회원가입 실패');
            }
        } catch (err) {
            setError('서버 연결 오류');
        }
    };

    return (
        <div className="auth-container">
            <h2>회원가입</h2>
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
                <div className="form-group">
                    <label>비밀번호 확인</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p className="error-message">{error}</p>}
                <button type="submit" className="auth-btn">가입하기</button>
            </form>
            <p className="auth-link">
                이미 계정이 있으신가요? <span onClick={() => onNavigate('login')}>로그인</span>
            </p>
        </div>
    );
};

export default Signup;
