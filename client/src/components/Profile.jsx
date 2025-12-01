import React, { useEffect, useState } from 'react';
import { API_URL } from '../socket';
import Leaderboard from './Leaderboard';
import TierBadge from './TierBadge';
import './Profile.css';

const Profile = ({ username, onBack }) => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedOpponent, setSelectedOpponent] = useState(null);
    const [opponentStats, setOpponentStats] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${API_URL}/api/auth/profile/${username}`);
                if (response.ok) {
                    const data = await response.json();
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

    // Card data for the info section
    const cards = [
        { name: '기사', cost: 3, desc: '균형 잡힌 근접 유닛' },
        { name: '아처', cost: 3, desc: '원거리 공격 유닛' },
        { name: '자이언트', cost: 5, desc: '건물만 공격하는 탱커' },
        { name: '미니 P.E.K.K.A', cost: 4, desc: '강력한 한 방 공격' },
        { name: '파이어볼', cost: 4, desc: '범위 마법 피해' },
        { name: '머스킷병', cost: 4, desc: '강력한 원거리 딜러' },
        { name: '베이비 드래곤', cost: 4, desc: '범위 공격 공중 유닛' },
        { name: '스켈레톤 군대', cost: 3, desc: '다수의 해골 소환' }
    ];

    if (loading) return <div className="profile-container">로딩 중...</div>;
    if (!userData) return <div className="profile-container">사용자 정보를 불러올 수 없습니다.</div>;

    return (
        <div className="profile-page">
            <div className="profile-container">
                <div className="profile-header-section">
                    <button className="back-btn" onClick={onBack}>뒤로 가기</button>
                    <div className="header-content">
                        <h2>{userData.username}님의 전적</h2>
                        <div className="rating-badge">
                            <span className="rating-label">Current Rating</span>
                            <span className="rating-value">
                                {userData.rating || 1000} <TierBadge rating={userData.rating || 1000} />
                            </span>
                        </div>
                        {userData.peakRating && userData.peakRating > (userData.rating || 1000) && (
                            <div className="rating-badge" style={{ marginTop: '8px', opacity: 0.8 }}>
                                <span className="rating-label">Peak Rating</span>
                                <span className="rating-value">
                                    {userData.peakRating} <TierBadge rating={userData.peakRating} size="small" />
                                </span>
                            </div>
                        )}
                        <div className="rating-badge" style={{ marginTop: '8px', background: 'linear-gradient(135deg, #f39c12 0%, #f1c40f 100%)' }}>
                            <span className="rating-label">💰 코인</span>
                            <span className="rating-value">
                                {(userData.coins || 500).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="scrollable-content">
                    <div className="content-grid">
                        <div className="left-panel">
                            <div className="stats-summary card">
                                <h3>내 정보</h3>
                                <div className="info-row">
                                    <span className="label">가입일</span>
                                    <span className="value">{new Date(userData.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">총 게임</span>
                                    <span className="value">{userData.matchHistory.length}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">최고 레이팅</span>
                                    <span className="value">{userData.peakRating || 1000}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">💰 보유 코인</span>
                                    <span className="value">{(userData.coins || 500).toLocaleString()}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">🔥 현재 연승</span>
                                    <span className="value">{userData.winStreak || 0}</span>
                                </div>
                            </div>

                            <div className="leaderboard-wrapper">
                                <Leaderboard currentUsername={username} limit={5} />
                            </div>

                            <div className="rating-rules card">
                                <h3>ℹ️ 레이팅 규칙</h3>
                                <ul className="rules-list">
                                    <li><span className="rule-label">승리</span> <span className="rule-value win">+30 (기본)</span></li>
                                    <li><span className="rule-label">패배</span> <span className="rule-value lose">-10 (기본)</span></li>
                                    <li><span className="rule-desc">* 상대와의 점수 차이에 따라 변동폭이 달라집니다.</span></li>
                                    <li><span className="rule-desc">* AI 난이도에 따라 추가 보정이 적용됩니다.</span></li>
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
                                                    <div className="opponent-info">
                                                        <span className="vs">vs</span>
                                                        <span
                                                            className={`opponent-name ${match.opponent !== 'AI' ? 'clickable' : ''}`}
                                                            onClick={() => handleOpponentClick(match.opponent)}
                                                        >
                                                            {match.opponent}
                                                            {match.aiDifficulty && (
                                                                <span className="ai-info">
                                                                    (AI: {match.aiDifficulty})
                                                                    {match.aiDeck && <span className="ai-deck-name"> - {match.aiDeck}</span>}
                                                                </span>
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="match-meta">
                                                    <span className={`rating-change ${match.ratingChange >= 0 ? 'positive' : 'negative'}`}>
                                                        {match.ratingChange > 0 ? '+' : ''}{match.ratingChange} MMR
                                                    </span>
                                                    {match.coinsEarned !== undefined && (
                                                        <span className={`coins-earned ${match.coinsEarned >= 0 ? 'positive' : 'negative'}`} style={{ marginLeft: '8px' }}>
                                                            {match.coinsEarned > 0 ? '+' : ''}{match.coinsEarned} 💰
                                                        </span>
                                                    )}
                                                    <span className="date">{new Date(match.date).toLocaleDateString()}</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="card-info-section card">
                                <h3>🃏 카드 정보</h3>
                                <div className="card-grid">
                                    {cards.map((card, idx) => (
                                        <div key={idx} className="card-item">
                                            <div className="card-header">
                                                <span className="card-name">{card.name}</span>
                                                <span className="card-cost">{card.cost}</span>
                                            </div>
                                            <p className="card-desc">{card.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
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
        </div>
    );
};

export default Profile;
