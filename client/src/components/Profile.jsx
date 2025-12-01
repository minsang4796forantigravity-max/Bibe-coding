import React, { useEffect, useState } from 'react';
import { API_URL } from '../socket';
import './Profile.css';

const Profile = ({ username, onBack }) => {
    const [userData, setUserData] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOpponent, setSelectedOpponent] = useState(null);
    const [opponentStats, setOpponentStats] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileRes, leaderboardRes] = await Promise.all([
                    fetch(`${API_URL}/api/auth/profile/${username}`),
                    fetch(`${API_URL}/api/auth/leaderboard`)
                ]);

                if (profileRes.ok) {
                    const data = await profileRes.json();
                    setUserData(data);
                }
                if (leaderboardRes.ok) {
                    const lbData = await leaderboardRes.json();
                    setLeaderboard(lbData);
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
        if (opponentName === 'AI') return; // AI stats are not tracked individually per se
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

    const closeStatsModal = () => {
        setSelectedOpponent(null);
        setOpponentStats(null);
    };

    if (loading) return <div className="profile-container">로딩 중...</div>;
    if (!userData) return <div className="profile-container">사용자 정보를 불러올 수 없습니다.</div>;

    return (
        <div className="profile-container">
            <button className="back-btn" onClick={onBack}>뒤로 가기</button>

            <div className="profile-header">
                <h2>{userData.username}님의 전적</h2>
                <div className="rating-badge">
                    <span className="rating-label">Rating</span>
                    <span className="rating-value">{userData.rating || 1000}</span>
                </div>
            </div>

            <div className="content-grid">
                <div className="left-panel">
                    <div className="stats-summary card">
                        <h3>내 정보</h3>
                        <p>가입일: {new Date(userData.createdAt).toLocaleDateString()}</p>
                        <p>총 게임 수: {userData.matchHistory.length}</p>
                    </div>

                    <div className="leaderboard card">
                        <h3>🏆 랭킹 Top 5</h3>
                        <ul>
                            {leaderboard.map((user, index) => (
                                <li key={user._id} className={`rank-item ${user.username === username ? 'me' : ''}`}>
                                    <span className="rank">{index + 1}</span>
                                    <span className="name">{user.username}</span>
                                    <span className="score">{user.rating || 1000}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="right-panel">
                    <div className="match-history card">
                        <h3>최근 전적</h3>
                        {userData.matchHistory.length === 0 ? (
                            <p className="no-data">전적이 없습니다.</p>
                        ) : (
                            <ul className="history-list">
                                {userData.matchHistory.slice().reverse().map((match, index) => (
                                    <li key={index} className={`match-item ${match.result}`}>
                                        <div className="match-info">
                                            <span className="result-badge">{match.result === 'win' ? 'WIN' : 'LOSE'}</span>
                                            <span className="vs">vs</span>
                                            <span
                                                className={`opponent-name ${match.opponent !== 'AI' ? 'clickable' : ''}`}
                                                onClick={() => handleOpponentClick(match.opponent)}
                                            >
                                                {match.opponent}
                                            </span>
                                        </div>
                                        <div className="match-meta">
                                            <span className={`rating-change ${match.ratingChange >= 0 ? 'positive' : 'negative'}`}>
                                                {match.ratingChange > 0 ? '+' : ''}{match.ratingChange}
                                            </span>
                                            <span className="date">{new Date(match.date).toLocaleDateString()}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            {selectedOpponent && opponentStats && (
                <div className="modal-overlay" onClick={closeStatsModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>vs {selectedOpponent} 전적</h3>
                        <div className="modal-stats">
                            <div className="stat-box">
                                <span className="label">승률</span>
                                <span className="value">{opponentStats.winRate}%</span>
                            </div>
                            <div className="stat-box">
                                <span className="label">승</span>
                                <span className="value win">{opponentStats.wins}</span>
                            </div>
                            <div className="stat-box">
                                <span className="label">패</span>
                                <span className="value lose">{opponentStats.losses}</span>
                            </div>
                            <div className="stat-box">
                                <span className="label">총 게임</span>
                                <span className="value">{opponentStats.totalGames}</span>
                            </div>
                        </div>
                        <button className="close-btn" onClick={closeStatsModal}>닫기</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
