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
            setError('Passwords do not match.');
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
                        alert('Signup successful! Auto-logging in...');
                        // Reload page to trigger auto-login
                        window.location.reload();
                    } else {
                        alert('Signup successful! Please login.');
                        onNavigate('login');
                    }
                } catch (loginErr) {
                    alert('Signup successful! Please login.');
                    onNavigate('login');
                }
            } else {
                setError(data.message || 'Signup failed');
            }
        } catch (err) {
            setError('Server connection error');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <h2>SIGN UP</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Choose your handle"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min 6 characters"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-type password"
                            required
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="auth-btn">JOIN GUILD</button>
                </form>
                <p className="auth-link">
                    Already a member? <span onClick={() => onNavigate('login')}>Login</span>
                </p>
            </div>
        </div>
    );
};

export default Signup;
