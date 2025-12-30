import React, { useState, useEffect } from 'react';
import Leaderboard from './Leaderboard';
import Shop from './Shop';
import { API_URL } from '../socket';

export function Lobby({
    user,
    roomId,
    setRoomId,
    difficulty,
    setDifficulty,
    onJoinClick,
    onSinglePlayerClick,
    onProfileClick,
    onLogout
}) {
    const [notices, setNotices] = useState([]);
    const [selectedNotice, setSelectedNotice] = useState(null);
    const [coins, setCoins] = useState(user?.coins || 0);
    const [rating, setRating] = useState(user?.rating || 1000);
    const [adminTitle, setAdminTitle] = useState('');
    const [adminContent, setAdminContent] = useState('');
    const [isAdminMode, setIsAdminMode] = useState(false);
    const [showAttendance, setShowAttendance] = useState(false);
    const [showShop, setShowShop] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const isAdmin = user?.username === 'Grand Warden';

    useEffect(() => {
        fetchNotices();
        if (user?.username) {
            fetch(`${API_URL}/api/auth/profile/${user.username}`)
                .then(res => res.json())
                .then(data => {
                    setCoins(data.coins);
                    if (data.rating) setRating(data.rating);
                })
                .catch(err => console.error("Error fetching profile:", err));
        }
    }, [user]);

    const fetchNotices = async () => {
        try {
            const res = await fetch(`${API_URL}/api/game/notices`);
            const data = await res.json();
            setNotices(data);
        } catch (err) {
            console.error("Error fetching notices:", err);
        }
    };

    const claimDailyReward = async () => {
        if (!user?.username) {
            alert("로그인이 필요합니다.");
            return;
        }
        try {
            const res = await fetch(`${API_URL}/api/game/daily-reward`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: user.username })
            });
            const data = await res.json();
            if (res.ok) {
                alert(data.message);
                setCoins(data.coins);
                setShowAttendance(false); // Close modal on success
            } else {
                alert(data.message || "보상 획득에 실패했습니다.");
            }
        } catch (err) {
            console.error("Daily reward error:", err);
            alert("서버 통신 오류: " + (err.message || "Unknown error"));
        }
    };

    const postNotice = async () => {
        console.log("Post Notice Clicked:", { adminTitle, adminContent });
        if (!adminTitle || !adminContent) {
            alert("제목과 내용을 모두 입력해 주세요.");
            return;
        }
        try {
            const res = await fetch(`${API_URL}/api/game/notices`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: user.username,
                    title: adminTitle,
                    content: adminContent,
                    type: 'news'
                })
            });
            if (res.ok) {
                alert("공지사항 등록 완료!");
                setAdminTitle('');
                setAdminContent('');
                setIsAdminMode(false);
                fetchNotices();
            } else {
                const errData = await res.json();
                alert("등록 실패: " + errData.message);
            }
        } catch (err) {
            console.error("Error posting notice:", err);
            alert("서버 통신 오류");
        }
    };

    const featuredCards = [
        { name: 'Giant', desc: 'Powerful tank with high HP', color: '#e67e22', icon: '👤' },
        { name: 'Hog Rider', desc: 'Fast building attacker', color: '#d35400', icon: '🐗' },
        { name: 'Pekka', desc: 'Heavily armored warrior', color: '#2c3e50', icon: '🤖' },
        { name: 'Balloon', desc: 'Slow but devastating', color: '#c0392b', icon: '🎈' }
    ];

    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            overflowY: 'auto',
            overflowX: 'hidden',
            background: 'linear-gradient(135deg, #1a1c2c 0%, #4a192c 100%)',
            color: 'white',
            fontFamily: "'Inter', sans-serif",
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingBottom: '50px',
            boxSizing: 'border-box'
        }}>
            {/* Viewport scaling & Mobile adjustments */}
            <style>{`
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); borderRadius: 10px; }
        @media (max-width: 600px) {
          h1 { font-size: 1.8rem !important; }
          .hero-content { padding: 15px !important; }
          .hero-title { font-size: 1.8rem !important; }
          .battle-grid { grid-template-columns: 1fr !important; }
          .card-item { min-width: 140px !important; height: 180px !important; }
          .header-controls { flex-wrap: wrap; justify-content: center; margin-top: 10px; }
        }
      `}</style>

            {/* Header Section */}
            <header style={{
                width: '100%',
                maxWidth: '1000px',
                padding: '15px 20px',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(15px)',
                borderBottom: '2px solid rgba(255,255,255,0.05)',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                boxSizing: 'border-box'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'linear-gradient(45deg, #f1c40f, #e67e22)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        boxShadow: '0 0 15px rgba(241,196,15,0.3)'
                    }}>
                        {user?.username?.[0]?.toUpperCase() || 'P'}
                    </div>
                    <div>
                        <div style={{ fontWeight: '800', fontSize: '0.95rem', letterSpacing: '0.5px' }}>{user?.username || 'Guest'}</div>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '2px' }}>
                            <span style={{ fontSize: '0.75rem', color: '#f1c40f', fontWeight: 'bold' }}>🏆 {rating}</span>
                            <span style={{ fontSize: '0.75rem', color: '#2ecc71', fontWeight: 'bold' }}>💰 {coins}</span>
                        </div>
                    </div>
                </div>

                <div className="header-controls" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <button
                        onClick={() => setShowShop(true)}
                        style={{
                            backgroundColor: 'transparent',
                            border: '1px solid rgba(46, 204, 113, 0.5)',
                            color: '#2ecc71',
                            padding: '8px 14px',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.3s ease',
                            background: 'rgba(46, 204, 113, 0.05)'
                        }}
                    >
                        <span style={{ fontSize: '1.1rem' }}>🛒</span> 상점
                    </button>

                    <button
                        onClick={() => setShowAttendance(true)}
                        style={{
                            backgroundColor: 'transparent',
                            border: '1px solid rgba(255,184,0,0.5)',
                            color: '#ffb800',
                            padding: '8px 14px',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.3s ease',
                            background: 'rgba(255,184,0,0.05)'
                        }}
                    >
                        <span style={{ fontSize: '1.1rem' }}>📅</span> 출석보상
                    </button>

                    {isAdmin && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsAdminMode(!isAdminMode);
                            }}
                            style={{
                                backgroundColor: isAdminMode ? '#e74c3c' : '#8e44ad',
                                border: 'none',
                                color: 'white',
                                padding: '8px 14px',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: 'bold'
                            }}
                        >{isAdminMode ? '✕ 닫기' : '👑 관리자'}</button>
                    )}

                    <div style={{ position: 'relative' }}>
                        <div
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            style={{
                                cursor: 'pointer',
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.2rem',
                                border: '1px solid rgba(255,255,255,0.2)'
                            }}
                        >
                            ⚙️
                        </div>
                        {showProfileMenu && (
                            <div style={{
                                position: 'absolute',
                                top: '45px',
                                right: 0,
                                width: '150px',
                                background: '#222',
                                borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                                overflow: 'hidden',
                                zIndex: 200
                            }}>
                                <button onClick={onProfileClick} style={{ width: '100%', padding: '12px', background: 'transparent', border: 'none', color: 'white', textAlign: 'left', cursor: 'pointer', fontSize: '0.9rem' }}>📊 내 전적</button>
                                <button onClick={onLogout} style={{ width: '100%', padding: '12px', background: 'rgba(231,76,60,0.2)', border: 'none', color: '#e74c3c', textAlign: 'left', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}>🚪 로그아웃</button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Admin Panel */}
            {isAdminMode && (
                <div style={{
                    position: 'fixed',
                    top: '80px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '90%',
                    maxWidth: '600px',
                    background: 'rgba(30, 30, 45, 0.95)',
                    backdropFilter: 'blur(20px)',
                    padding: '25px',
                    borderRadius: '24px',
                    border: '2px solid #8e44ad',
                    zIndex: 1000,
                    boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
                }}>
                    <h3 style={{ marginTop: 0, color: '#8e44ad', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span>👑</span> 관리자 공지 등록
                    </h3>
                    <input
                        type="text"
                        placeholder="공지 제목을 입력하세요"
                        value={adminTitle}
                        onChange={e => setAdminTitle(e.target.value)}
                        style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: 'white', boxSizing: 'border-box' }}
                    />
                    <textarea
                        placeholder="상세 내용을 입력하세요..."
                        value={adminContent}
                        onChange={e => setAdminContent(e.target.value)}
                        style={{ width: '100%', height: '120px', padding: '12px', marginBottom: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: 'white', boxSizing: 'border-box', resize: 'none' }}
                    />
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={postNotice}
                            style={{ flex: 1, padding: '14px', backgroundColor: '#8e44ad', border: 'none', color: 'white', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}
                        >등록하기</button>
                        <button
                            onClick={() => setIsAdminMode(false)}
                            style={{ padding: '0 20px', backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '12px', cursor: 'pointer' }}
                        >취소</button>
                    </div>
                </div>
            )}

            {/* Hero Banner Section (Now Clickable) */}
            <section
                onClick={() => setSelectedNotice({
                    title: 'WINTER SEASON IS HERE!',
                    content: 'Frost Peak 시즌이 시작되었습니다! 새로운 얼음 유닛들과 특별한 패스가 여러분을 기다립니다. 지금 바로 상점에서 확인하세요!',
                    type: 'event',
                    date: 'Now'
                })}
                style={{
                    width: '90%',
                    maxWidth: '1000px',
                    marginTop: '20px',
                    borderRadius: '24px',
                    minHeight: '200px',
                    height: '240px',
                    background: 'linear-gradient(135deg, #2980b9 0%, #2c3e50 50%, #c0392b 100%)',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    zIndex: 1,
                    transition: 'transform 0.3s',
                    flexShrink: 0,
                    boxSizing: 'border-box'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
                <div className="hero-content" style={{ padding: '40px', zIndex: 2 }}>
                    <div style={{ display: 'inline-block', padding: '4px 12px', background: '#f1c40f', color: '#111', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '900', marginBottom: '10px' }}>SEASON 24</div>
                    <h1 className="hero-title" style={{ fontSize: '3rem', margin: 0, fontWeight: '900', letterSpacing: '-1px', textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>WINTER SEASON</h1>
                    <p style={{ fontSize: '1.2rem', margin: '8px 0', opacity: 0.9, fontWeight: '500' }}>Click to explore new events & rewards!</p>
                </div>
                <div style={{ position: 'absolute', right: '5%', bottom: '-10%', fontSize: '12rem', opacity: 0.15, transform: 'rotate(-20deg)' }}>❄️</div>
            </section>

            {/* Battle Hub */}
            <section className="battle-grid" style={{
                width: '90%',
                maxWidth: '1000px',
                marginTop: '30px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                zIndex: 1
            }}>
                {/* Ranked Card */}
                <div style={{
                    background: 'rgba(255,255,255,0.04)',
                    padding: '30px',
                    borderRadius: '24px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px'
                }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#3498db', fontWeight: '900' }}>RANKED BATTLE</h2>
                        <p style={{ fontSize: '0.9rem', color: '#95a5a6', margin: '5px 0 0' }}>멀티플레이에 참여하세요!</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            placeholder="방 번호 (예: 123)"
                            value={roomId}
                            onChange={e => setRoomId(e.target.value)}
                            style={{
                                flex: 1,
                                padding: '14px',
                                borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'rgba(0,0,0,0.4)',
                                color: 'white',
                                fontSize: '1rem'
                            }}
                        />
                        <button
                            onClick={onJoinClick}
                            disabled={!roomId.trim()}
                            style={{
                                padding: '0 25px',
                                borderRadius: '12px',
                                border: 'none',
                                backgroundColor: roomId.trim() ? '#3498db' : '#444',
                                color: 'white',
                                fontWeight: '900',
                                cursor: roomId.trim() ? 'pointer' : 'not-allowed',
                                boxShadow: '0 8px 15px rgba(52,152,219,0.3)'
                            }}
                        >참가</button>
                    </div>
                </div>

                {/* AI Card */}
                <div style={{
                    background: 'rgba(255,255,255,0.04)',
                    padding: '30px',
                    borderRadius: '24px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px'
                }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#2ecc71', fontWeight: '900' }}>TRAINING MODE</h2>
                        <p style={{ fontSize: '0.9rem', color: '#95a5a6', margin: '5px 0 0' }}>AI와 연습 경기를 즐겨보세요!</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <select
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value)}
                            style={{
                                flex: 1,
                                padding: '14px',
                                borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'rgba(0,0,0,0.4)',
                                color: 'white'
                            }}
                        >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                            <option value="impossible">Impossible</option>
                        </select>
                        <button
                            onClick={onSinglePlayerClick}
                            style={{
                                padding: '0 25px',
                                borderRadius: '12px',
                                border: 'none',
                                backgroundColor: '#2ecc71',
                                color: 'white',
                                fontWeight: '900',
                                cursor: 'pointer',
                                boxShadow: '0 8px 15px rgba(46,204,113,0.3)'
                            }}
                        >시작</button>
                    </div>
                </div>
            </section>

            {/* Featured Cards (More responsive sizes) */}
            <section style={{ width: '90%', maxWidth: '1000px', marginTop: '40px', zIndex: 1 }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '900', marginBottom: '20px', borderLeft: '5px solid #f1c40f', paddingLeft: '15px' }}>FEATURED UNITS</h2>
                <div style={{
                    display: 'flex',
                    gap: '15px',
                    overflowX: 'auto',
                    paddingBottom: '15px',
                    scrollbarWidth: 'none'
                }}>
                    {featuredCards.map((card, i) => (
                        <div key={i} className="card-item" style={{
                            minWidth: '180px',
                            height: '240px',
                            background: `linear-gradient(135deg, ${card.color} 0%, #111 100%)`,
                            borderRadius: '24px',
                            padding: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            boxSizing: 'border-box'
                        }}>
                            <div style={{ fontSize: '3rem', textAlign: 'center' }}>{card.icon}</div>
                            <div>
                                <div style={{ fontWeight: '900', fontSize: '1.1rem' }}>{card.name}</div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '4px', lineHeight: '1.3' }}>{card.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* News & Leaderboard Grid */}
            <div style={{
                width: '90%',
                maxWidth: '1000px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '30px',
                marginTop: '40px',
                zIndex: 1
            }}>
                {/* Notices */}
                <section>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '900', marginBottom: '20px' }}>NEWS & EVENTS</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {notices.map((notice, i) => (
                            <div
                                key={notice._id || i}
                                onClick={() => setSelectedNotice(notice)}
                                style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    padding: '16px 20px',
                                    borderRadius: '16px',
                                    borderLeft: `4px solid ${notice.type === 'event' ? '#f1c40f' : '#3498db'}`,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                            >
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '800', fontSize: '0.95rem' }}>{notice.title}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#95a5a6', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{notice.content}</div>
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#7f8c8d' }}>{new Date(notice.createdAt).toLocaleDateString()}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Top Players */}
                <section>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '900', marginBottom: '20px' }}>GLOBAL TOP</h2>
                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '24px',
                        overflow: 'hidden',
                        border: '1px solid rgba(255,255,255,0.08)'
                    }}>
                        <Leaderboard currentUsername={user?.username || ''} limit={5} compact={true} />
                    </div>
                </section>
            </div>

            {/* Shop Modal */}
            {showShop && (
                <Shop
                    user={user}
                    onClose={() => setShowShop(false)}
                    onPurchase={(newCoins) => setCoins(newCoins)}
                />
            )}

            {/* Attendance Modal */}
            {showAttendance && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.85)',
                    backdropFilter: 'blur(15px)',
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }} onClick={() => setShowAttendance(false)}>
                    <div style={{
                        background: 'linear-gradient(180deg, #2c3e50 0%, #1a1c2c 100%)',
                        maxWidth: '450px',
                        width: '100%',
                        borderRadius: '28px',
                        padding: '40px 30px',
                        boxSizing: 'border-box',
                        border: '2px solid rgba(255,184,0,0.3)',
                        boxShadow: '0 30px 60px rgba(0,0,0,0.8), 0 0 20px rgba(255,184,0,0.1)',
                        textAlign: 'center'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: '4rem', marginBottom: '10px' }}>🎁</div>
                        <h2 style={{ fontSize: '2rem', fontWeight: '900', margin: '0 0 10px', color: '#ffb800' }}>DAILY REWARDS</h2>
                        <p style={{ color: '#95a5a6', marginBottom: '30px' }}>매일 접속하고 50 코인을 받아가세요!</p>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: '10px',
                            marginBottom: '35px'
                        }}>
                            {[1, 2, 3, 4, 5, 6, 7].map(day => (
                                <div key={day} style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    padding: '12px 5px',
                                    borderRadius: '15px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    opacity: day === 1 ? 1 : 0.5
                                }}>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>DAY {day}</div>
                                    <div style={{ fontSize: '1.2rem', margin: '4px 0' }}>💰</div>
                                    <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>+50</div>
                                </div>
                            ))}
                            <div style={{
                                background: 'linear-gradient(135deg, #f1c40f 0%, #e67e22 100%)',
                                padding: '12px 5px',
                                borderRadius: '15px',
                                color: '#000',
                                fontWeight: 'bold'
                            }}>
                                <div style={{ fontSize: '0.7rem' }}>FINAL</div>
                                <div style={{ fontSize: '1.2rem', margin: '4px 0' }}>💎</div>
                                <div style={{ fontSize: '0.8rem' }}>+200</div>
                            </div>
                        </div>

                        <button
                            onClick={claimDailyReward}
                            style={{
                                width: '100%',
                                padding: '18px',
                                borderRadius: '16px',
                                border: 'none',
                                background: 'linear-gradient(90deg, #27ae60, #2ecc71)',
                                color: '#fff',
                                fontWeight: '900',
                                fontSize: '1.2rem',
                                cursor: 'pointer',
                                boxShadow: '0 8px 20px rgba(39,174,96,0.3)',
                                transition: 'transform 0.2s'
                            }}
                            onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
                            onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
                        >보상 받기</button>
                        <p onClick={() => setShowAttendance(false)} style={{ marginTop: '20px', color: '#7f8c8d', fontSize: '0.9rem', cursor: 'pointer' }}>나중에 받기</p>
                    </div>
                </div>
            )}

            {/* Notice Details Modal */}
            {selectedNotice && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.85)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }} onClick={() => setSelectedNotice(null)}>
                    <div style={{
                        background: '#222',
                        maxWidth: '500px',
                        width: '100%',
                        borderRadius: '24px',
                        padding: '30px',
                        boxSizing: 'border-box',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                            <div style={{ padding: '4px 12px', background: selectedNotice.type === 'event' ? '#f1c40f' : '#3498db', color: '#111', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '900' }}>
                                {selectedNotice.type?.toUpperCase()}
                            </div>
                            <span style={{ fontSize: '0.8rem', color: '#777' }}>{selectedNotice.date || new Date(selectedNotice.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h2 style={{ margin: '0 0 20px', fontSize: '1.8rem', fontWeight: '900', color: '#fff' }}>{selectedNotice.title}</h2>
                        <p style={{ lineHeight: '1.8', fontSize: '1rem', color: '#ccc', margin: '0 0 30px' }}>{selectedNotice.content}</p>
                        <button
                            onClick={() => setSelectedNotice(null)}
                            style={{ width: '100%', padding: '15px', borderRadius: '12px', border: 'none', background: '#333', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
                        >Close</button>
                    </div>
                </div>
            )}

            {/* Tip Section */}
            <section style={{
                width: '90%',
                maxWidth: '1000px',
                marginTop: '60px',
                padding: '30px',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '24px',
                border: '1px dashed rgba(255,255,255,0.1)',
                textAlign: 'center',
                zIndex: 1
            }}>
                <div style={{ color: '#f1c40f', fontWeight: '900', letterSpacing: '2px', marginBottom: '10px' }}>💡 BIEROYALE TIP</div>
                <p style={{ margin: 0, opacity: 0.8, fontStyle: 'italic', fontSize: '1.1rem' }}>
                    "Wait for the 2x Mana period at 30s to overwhelm your opponent with a massive push!"
                </p>
            </section>

            <footer style={{ marginTop: '50px', opacity: 0.3, fontSize: '0.7rem', paddingBottom: '30px' }}>
                © 2025 BIEROYALE ENGINE • PROUDLY DEVELOPED BY ANTIGRAVITY
            </footer>
        </div>
    );
}

export default Lobby;
