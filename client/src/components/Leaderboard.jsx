import React, { useEffect, useState } from 'react';
import { API_URL } from '../socket';
import './Leaderboard.css';

const Leaderboard = ({ currentUsername, limit = 5, compact = false }) => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await fetch(`${API_URL}/api/auth/leaderboard`);
                if (response.ok) {
                    const data = await response.json();
                    setLeaderboard(data);
                }
            } catch (error) {
                console.error('Error fetching leaderboard:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    if (loading) return <div className="leaderboard-loading">랭킹 로딩 중...</div>;

    const displayData = limit ? leaderboard.slice(0, limit) : leaderboard;

    return (
        <div className={`leaderboard-container ${compact ? 'compact' : ''}`}>
            <h3 className="leaderboard-title">🏆 랭킹 Top {limit}</h3>
            <ul className="leaderboard-list">
                {displayData.map((user, index) => (
                    <li key={user._id} className={`leaderboard-item ${user.username === currentUsername ? 'me' : ''}`}>
                        <div className={`rank-badge rank-${index + 1}`}>{index + 1}</div>
                        <div className="user-info">
                            <span className="username">{user.username}</span>
                            <span className="rating">{user.rating || 1000} MMR</span>
                        </div>
                    </li>
                ))}
            </ul>
            {leaderboard.length === 0 && <div className="no-data">데이터가 없습니다.</div>}
        </div>
    );
};

export default Leaderboard;
