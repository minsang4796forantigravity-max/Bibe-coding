import React, { useEffect, useState } from 'react';
import './Profile.css'; // We'll create this CSS file

const Profile = ({ username, onBack }) => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/auth/profile/${username}`);
                const data = await response.json();
                if (response.ok) {
                    setUserData(data);
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [username]);

    if (loading) return <div className="profile-container">로딩 중...</div>;
    if (!userData) return <div className="profile-container">사용자 정보를 불러올 수 없습니다.</div>;

    return (
        <div className="profile-container">
            <button className="back-btn" onClick={onBack}>뒤로 가기</button>
            <h2>{userData.username}님의 전적</h2>
            <div className="stats-summary">
                <p>가입일: {new Date(userData.createdAt).toLocaleDateString()}</p>
                <p>총 게임 수: {userData.matchHistory.length}</p>
            </div>

            <div className="match-history">
                <h3>최근 전적</h3>
                {userData.matchHistory.length === 0 ? (
                    <p>전적이 없습니다.</p>
                ) : (
                    <ul>
                        {userData.matchHistory.slice().reverse().map((match, index) => (
                            <li key={index} className={`match-item ${match.result}`}>
                                <span className="result">{match.result === 'win' ? '승리' : '패배'}</span>
                                <span className="opponent">vs {match.opponent}</span>
                                <span className="date">{new Date(match.date).toLocaleDateString()}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Profile;
