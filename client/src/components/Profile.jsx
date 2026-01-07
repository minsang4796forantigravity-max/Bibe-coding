import React, { useEffect, useState } from 'react';
import { API_URL } from '../socket';
import Leaderboard from './Leaderboard';
import './Profile.css';

const Profile = ({ username, onBack }) => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedOpponent, setSelectedOpponent] = useState(null);
    const [opponentStats, setOpponentStats] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const profileRes = await fetch(`${API_URL}/api/auth/profile/${username}`);
                if (profileRes.ok) {
                    const data = await profileRes.json();
                    setUserData(data);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [username]);

    const handleOpponentClick = async (opponentName) => {
        if (opponentName === 'AI') return;
        try {
            const response = await fetch(`${API_URL}/api/auth/stats/${username}/${opponentName}`);
            if (response.ok) {
                const data = await response.json();
                setOpponentStats(data);
                setSelectedOpponent(opponentName);
            }
        } catch (error) {
            console.error('Error fetching opponent stats:', error);
        }
    };

    if (loading) return <div className="profile-page"><div className="profile-container"><h2>LOADING PROFILE...</h2></div></div>;
    if (!userData) return <div className="profile-page"><div className="profile-container"><h2>USER NOT FOUND</h2><button onClick={onBack} className="premium-button">BACK</button></div></div>;

    const winCount = userData.matchHistory.filter(m => m.result === 'win').length;
    const lossCount = userData.matchHistory.filter(m => m.result === 'lose').length;
    const winRate = userData.matchHistory.length > 0 ? Math.round((winCount / userData.matchHistory.length) * 100) : 0;

    return (
        <div className="profile-page">
            <div className="profile-container">
                <div className="profile-header-section">
                    <button className="glass-panel" onClick={onBack} style={{ width: 'fit-content', border: 'none', color: '#fff', padding: '12px 25px', borderRadius: '15px', cursor: 'pointer', fontWeight: '900', fontSize: '0.9rem' }}>← BACK TO LOBBY</button>
                    <div className="header-content">
                        <div>
                            <h2>{userData.username.toUpperCase()}</h2>
                            <p style={{ margin: '8px 0 0', opacity: 0.5, fontWeight: 'bold' }}>Active since {new Date(userData.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="rating-badge">
                            <span className="rating-label">Global Rank</span>
                            <span className="rating-value">🏆 {userData.rating || 1000}</span>
                        </div>
                    </div>
                </div>

                <div className="content-grid">
                    <div className="left-panel">
                        <div className="card">
                            <h3>📊 CAREER STATS</h3>
                            <div className="info-row"><span className="label">Win Rate</span><span className="value">{winRate}%</span></div>
                            <div className="info-row"><span className="label">Battles Won</span><span className="value" style={{ color: 'var(--color-secondary)' }}>{winCount}</span></div>
                            <div className="info-row"><span className="label">Battles Lost</span><span className="value" style={{ color: 'var(--color-danger)' }}>{lossCount}</span></div>
                            <div className="info-row"><span className="label">Total Matches</span><span className="value">{userData.matchHistory.length}</span></div>
                        </div>

                        <div className="card">
                            <h3>🏆 TOP PLAYERS</h3>
                            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                <Leaderboard currentUsername={username} limit={10} compact={true} />
                            </div>
                        </div>
                    </div>

                    <div className="right-panel">
                        <div className="card">
                            <h3>⚔️ BATTLE LOG</h3>
                            {userData.matchHistory.length === 0 ? (
                                <p style={{ opacity: 0.3, textAlign: 'center', padding: '40px' }}>No battle history found. Go out there and fight!</p>
                            ) : (
                                <ul className="history-list">
                                    {userData.matchHistory.slice().reverse().map((match, index) => (
                                        <li key={index} className={`match-item ${match.result}`}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                <span className="result-badge">{match.result.toUpperCase()}</span>
                                                <div>
                                                    <div style={{ fontSize: '0.75rem', opacity: 0.5, marginBottom: '2px' }}>{new Date(match.date).toLocaleDateString()}</div>
                                                    <div style={{ fontWeight: '900' }}>
                                                        <span style={{ opacity: 0.4, marginRight: '10px' }}>VS</span>
                                                        <span className={`opponent-name ${match.opponent !== 'AI' ? 'clickable' : ''}`} onClick={() => handleOpponentClick(match.opponent)}>
                                                            {match.opponent}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div className={`rating-change ${match.ratingChange >= 0 ? 'positive' : 'negative'}`}>
                                                    {match.ratingChange >= 0 ? '+' : ''}{match.ratingChange}
                                                </div>
                                                <div style={{ fontSize: '0.7rem', opacity: 0.3 }}>Rating</div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                {selectedOpponent && opponentStats && (
                    <div className="modal-overlay" onClick={() => setSelectedOpponent(null)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '1.5rem', marginBottom: '30px' }}>VS {selectedOpponent.toUpperCase()}</h2>
                            <div className="modal-stats" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                                <div className="stat-box"><div className="rating-label">WIN RATE</div><div className="rating-value" style={{ color: 'var(--color-primary)' }}>{opponentStats.winRate}%</div></div>
                                <div className="stat-box"><div className="rating-label">TOTAL</div><div className="rating-value">{opponentStats.totalGames}</div></div>
                                <div className="stat-box"><div className="rating-label">WINS</div><div className="rating-value" style={{ color: 'var(--color-secondary)' }}>{opponentStats.wins}</div></div>
                                <div className="stat-box"><div className="rating-label">LOSSES</div><div className="rating-value" style={{ color: 'var(--color-danger)' }}>{opponentStats.losses}</div></div>
                            </div>
                            <button className="premium-button" style={{ width: '100%', padding: '15px' }} onClick={() => setSelectedOpponent(null)}>CLOSE</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
