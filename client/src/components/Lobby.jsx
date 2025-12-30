import React, { useState, useEffect } from 'react';
import Leaderboard from './Leaderboard';

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
    const [adminTitle, setAdminTitle] = useState('');
    const [adminContent, setAdminContent] = useState('');
    const [isAdminMode, setIsAdminMode] = useState(false);

    const isAdmin = user?.username === 'Grand Warden';

    useEffect(() => {
        fetchNotices();
        // Update local coins from user prop
        if (user?.username) {
            fetch(`/api/auth/profile/${user.username}`)
                .then(res => res.json())
                .then(data => setCoins(data.coins))
                .catch(err => console.error("Error fetching coins:", err));
        }
    }, [user]);

    const fetchNotices = async () => {
        try {
            const res = await fetch('/api/game/notices');
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
            const res = await fetch('/api/game/daily-reward', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: user.username })
            });
            const data = await res.json();
            if (res.ok) {
                alert(data.message);
                setCoins(data.coins);
            } else {
                alert(data.message || "보상 획득에 실패했습니다.");
            }
        } catch (err) {
            console.error("Daily reward error:", err);
            alert("서버와 통신 중 오류가 발생했습니다.");
        }
    };

    const postNotice = async () => {
        if (!adminTitle || !adminContent) return;
        try {
            const res = await fetch('/api/game/notices', {
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
                fetchNotices();
            }
        } catch (err) {
            alert("Error posting notice");
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
                            <span style={{ fontSize: '0.75rem', color: '#f1c40f', fontWeight: 'bold' }}>🏆 {user?.rating || 1000}</span>
                            <span style={{ fontSize: '0.75rem', color: '#2ecc71', fontWeight: 'bold' }}>💰 {coins}</span>
                        </div>
                    </div>
                </div>

                <div className="header-controls" style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={claimDailyReward}
                        style={{
                            backgroundColor: '#27ae60',
                            border: 'none',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            transition: 'transform 0.2s'
                        }}
                        onMouseDown={e => e.target.style.transform = 'scale(0.9)'}
                        onMouseUp={e => e.target.style.transform = 'scale(1)'}
                    >📅 출석체크</button>

                    {isAdmin && (
                        <button
                            onClick={() => setIsAdminMode(!isAdminMode)}
                            style={{
                                backgroundColor: isAdminMode ? '#e74c3c' : '#8e44ad',
                                border: 'none',
                                color: 'white',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: 'bold'
                            }}
                        >{isAdminMode ? 'Close Admin' : 'Admin Panel'}</button>
                    )}
                </div>
            </header>

            {/* Admin Panel */}
            {isAdminMode && (
                <section style={{
                    width: '90%',
                    maxWidth: '800px',
                    marginTop: '20px',
                    background: 'rgba(142, 68, 173, 0.2)',
                    padding: '20px',
                    borderRadius: '20px',
                    border: '1px solid #8e44ad',
                    zIndex: 10
                }}>
                    <h3>👑 Admin: Post Announcement</h3>
                    <input
                        type="text"
                        placeholder="제목"
                        value={adminTitle}
                        onChange={e => setAdminTitle(e.target.value)}
                        style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: 'none', color: '#111' }}
                    />
                    <textarea
                        placeholder="내용"
                        value={adminContent}
                        onChange={e => setAdminContent(e.target.value)}
                        style={{ width: '100%', height: '100px', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: 'none', color: '#111' }}
                    />
                    <button onClick={postNotice} style={{ padding: '10px 20px', backgroundColor: '#8e44ad', border: 'none', color: 'white', borderRadius: '5px', fontWeight: 'bold' }}>등록하기</button>
                </section>
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
