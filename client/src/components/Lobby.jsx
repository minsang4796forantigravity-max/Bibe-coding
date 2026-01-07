import React, { useState, useEffect } from 'react';
import Leaderboard from './Leaderboard';
import Shop from './Shop';
import CardEncyclopedia from './CardEncyclopedia';
import { DeckSelector } from './DeckSelector';
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
    onLogout,
    activeDeck,
    setActiveDeck
}) {
    const [notices, setNotices] = useState([]);
    const [selectedNotice, setSelectedNotice] = useState(null);
    const [coins, setCoins] = useState(user?.coins || 0);
    const [rating, setRating] = useState(user?.rating || 1000);
    const [adminTitle, setAdminTitle] = useState('');
    const [adminContent, setAdminContent] = useState('');
    const [isAdminMode, setIsAdminMode] = useState(false);
    const [showAttendance, setShowAttendance] = useState(false);
    const [showEncyclopedia, setShowEncyclopedia] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [currentTab, setCurrentTab] = useState('battle'); // 'shop', 'deck', 'battle', 'events'

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
            alert("Login required.");
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
                setShowAttendance(false);
            } else {
                alert(data.message || "Failed to claim reward.");
            }
        } catch (err) {
            console.error("Daily reward error:", err);
            alert("Network error.");
        }
    };

    const postNotice = async () => {
        if (!adminTitle || !adminContent) {
            alert("Please enter title and content.");
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
                alert("Notice posted!");
                setAdminTitle('');
                setAdminContent('');
                setIsAdminMode(false);
                fetchNotices();
            } else {
                const errData = await res.json();
                alert("Failed code: " + errData.message);
            }
        } catch (err) {
            console.error("Error posting notice:", err);
            alert("Network error.");
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
            background: 'var(--color-bg-deep)',
            color: 'white',
            fontFamily: "var(--font-main)",
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minHeight: '100vh',
            width: '100vw',
            overflowX: 'hidden',
            overflowY: 'auto',
            boxSizing: 'border-box',
            WebkitOverflowScrolling: 'touch'
        }}>
            <div style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'radial-gradient(circle at 50% 50%, #4a192c 0%, #1a1c2c 100%)',
                zIndex: -1,
                opacity: 0.8
            }} />

            <style>{`
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); borderRadius: 10px; }
                h1, h2, h3 { font-family: var(--font-title); letter-spacing: 1px; margin: 0; }
                .hero-slide { animation: bibeFloating 4s infinite ease-in-out; }
                .game-card {
                    background: var(--color-glass);
                    backdrop-filter: blur(15px);
                    border: 1px solid var(--color-glass-border);
                    border-radius: 24px;
                    box-shadow: var(--shadow-soft);
                    transition: var(--transition-bouncy);
                }
                .game-card:hover { border-color: rgba(255,255,255,0.2); transform: translateY(-5px); }
                .premium-button {
                    background: var(--color-gold);
                    border: none;
                    color: white;
                    font-weight: 900;
                    text-transform: uppercase;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: var(--transition-bouncy);
                    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }
                .premium-button:hover { transform: scale(1.05); box-shadow: var(--shadow-glow-accent); }
                .glass-panel {
                    background: rgba(0,0,0,0.6);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255,255,255,0.05);
                }
            `}</style>

            <header className="glass-panel" style={{
                width: '100%',
                maxWidth: '1000px',
                padding: '12px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                boxSizing: 'border-box',
                borderBottomLeftRadius: '20px',
                borderBottomRightRadius: '20px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.6)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 15px)', flexWrap: 'nowrap' }}>
                    <div style={{
                        width: 'clamp(35px, 10vw, 45px)',
                        height: 'clamp(35px, 10vw, 45px)',
                        borderRadius: '12px',
                        background: 'var(--color-gold)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 'clamp(1rem, 4vw, 1.4rem)',
                        fontWeight: 'bold',
                        boxShadow: 'var(--shadow-glow-accent)',
                        flexShrink: 0
                    }}>
                        {user?.username?.[0]?.toUpperCase() || 'P'}
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: '900', fontSize: 'clamp(0.85rem, 3vw, 1rem)', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.username || 'Guest'}</div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-accent)', fontWeight: 'bold' }}>🏆 {rating}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary)', fontWeight: 'bold' }}>💰 {coins}</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button onClick={() => setShowEncyclopedia(true)} className="glass-panel" style={{ border: 'none', color: '#fff', padding: '8px 12px', borderRadius: '20px', cursor: 'pointer', fontSize: 'clamp(0.7rem, 2.5vw, 0.85rem)', fontWeight: 'bold' }}>
                        <span className="hide-mobile">📖 ENCYCLOPEDIA</span>
                        <span className="show-mobile">📖</span>
                    </button>
                    <button onClick={() => setShowAttendance(true)} className="premium-button" style={{ padding: '8px 12px', borderRadius: '20px', fontSize: 'clamp(0.7rem, 2.5vw, 0.85rem)', fontWeight: '900' }}>
                        <span className="hide-mobile">🎁 REWARD</span>
                        <span className="show-mobile">🎁</span>
                    </button>
                    <div style={{ position: 'relative' }}>
                        <div onClick={() => setShowProfileMenu(!showProfileMenu)} style={{ cursor: 'pointer', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', border: '1px solid rgba(255,255,255,0.2)' }}>⚙️</div>
                        {showProfileMenu && (
                            <div className="glass-panel" style={{ position: 'absolute', top: '40px', right: 0, width: '140px', borderRadius: '15px', overflow: 'hidden', zIndex: 200 }}>
                                <button onClick={onProfileClick} style={{ width: '100%', padding: '10px', background: 'transparent', border: 'none', color: 'white', textAlign: 'left', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>📊 STATS</button>
                                <button onClick={onLogout} style={{ width: '100%', padding: '10px', background: 'rgba(231,76,60,0.2)', border: 'none', color: '#e74c3c', textAlign: 'left', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>🚪 LOGOUT</button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '120px' }}>
                {currentTab === 'battle' && (
                    <div style={{ width: '100%', maxWidth: '1000px', padding: '20px', boxSizing: 'border-box' }}>
                        <section className="hero-slide" style={{
                            width: '100%',
                            height: '240px',
                            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                            borderRadius: '30px',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
                            border: '2px solid rgba(255,255,255,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                        }}>
                            <div style={{ padding: '40px', zIndex: 2 }}>
                                <div style={{ background: 'var(--color-accent)', color: '#000', display: 'inline-block', padding: '6px 16px', borderRadius: '20px', fontWeight: '900', fontSize: '0.8rem', marginBottom: '15px' }}>NEW SEASON</div>
                                <h1 style={{ fontSize: '3.5rem', margin: 0, textShadow: '0 0 20px rgba(0,0,0,0.8)' }}>FROST PEAK</h1>
                                <p style={{ fontSize: '1.2rem', opacity: 0.9, marginTop: '10px', fontWeight: '700' }}>Master the elements in the frozen arena!</p>
                            </div>
                            <div style={{ position: 'absolute', right: '-5%', bottom: '-15%', fontSize: '18rem', opacity: 0.1, transform: 'rotate(-20deg)', filter: 'blur(3px)' }}>❄️</div>
                        </section>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginTop: '40px' }}>
                            <div className="game-card" style={{ padding: '30px', borderTop: '6px solid var(--color-primary)' }}>
                                <h2 style={{ color: 'var(--color-primary)', fontSize: '1.8rem', marginBottom: '25px' }}>RANKED BATTLE</h2>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <input
                                        type="text" placeholder="MATCH ID" value={roomId} onChange={e => setRoomId(e.target.value)}
                                        style={{ flex: 1, padding: '18px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.6)', color: 'white', fontWeight: '900', fontSize: '1.1rem' }}
                                    />
                                    <button onClick={onJoinClick} className="premium-button" style={{ background: 'var(--color-primary)', padding: '0 35px', fontWeight: '900' }}>JOIN</button>
                                </div>
                            </div>
                            <div className="game-card" style={{ padding: '30px', borderTop: '6px solid var(--color-secondary)' }}>
                                <h2 style={{ color: 'var(--color-secondary)', fontSize: '1.8rem', marginBottom: '25px' }}>TRAINING</h2>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <select value={difficulty} onChange={e => setDifficulty(e.target.value)} style={{ flex: 1, padding: '18px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.6)', color: 'white', fontWeight: '900', fontSize: '1.1rem' }}>
                                        <option value="easy">EASY</option>
                                        <option value="medium">NORMAL</option>
                                        <option value="hard">HARD</option>
                                        <option value="impossible">IMPOSSIBLE</option>
                                    </select>
                                    <button onClick={onSinglePlayerClick} className="premium-button" style={{ background: 'var(--color-secondary)', padding: '0 35px', fontWeight: '900' }}>BATTLE</button>
                                </div>
                            </div>
                        </div>

                        <section style={{ marginTop: '60px' }}>
                            <h3 style={{ fontSize: '1.4rem', color: 'rgba(255,255,255,0.5)', marginBottom: '25px', textTransform: 'uppercase' }}>Featured Units</h3>
                            <div style={{ display: 'flex', gap: '25px', overflowX: 'auto', paddingBottom: '20px', scrollbarWidth: 'none' }}>
                                {featuredCards.map((card, i) => (
                                    <div key={i} className="game-card" style={{ minWidth: '200px', height: '280px', background: `linear-gradient(180deg, ${card.color}44 0%, #1a1c2c 100%)`, border: `2px solid ${card.color}aa`, padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                        <div style={{ fontSize: '5rem', textAlign: 'center', filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.5))' }}>{card.icon}</div>
                                        <div>
                                            <div style={{ fontWeight: '900', fontSize: '1.3rem', color: '#fff' }}>{card.name.toUpperCase()}</div>
                                            <div style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '5px' }}>{card.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}

                {currentTab === 'deck' && (
                    <div style={{ width: '100%', maxWidth: '1000px', padding: '20px' }}>
                        <DeckSelector username={user?.username} activeDeck={activeDeck} onActiveDeckChange={setActiveDeck} />
                    </div>
                )}

                {currentTab === 'shop' && (
                    <div style={{ width: '100%', maxWidth: '1000px', padding: '20px' }}>
                        <Shop user={user} onClose={() => setCurrentTab('battle')} onPurchase={setCoins} />
                    </div>
                )}

                {currentTab === 'events' && (
                    <div style={{ width: '100%', maxWidth: '1000px', padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px' }}>
                        <section>
                            <h2 style={{ fontSize: '1.8rem', marginBottom: '30px' }}>GLOBAL NEWS</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {notices.map((notice, i) => (
                                    <div key={i} onClick={() => setSelectedNotice(notice)} className="game-card" style={{ padding: '25px', cursor: 'pointer', borderLeft: `8px solid ${notice.type === 'event' ? 'var(--color-accent)' : 'var(--color-primary)'}` }}>
                                        <div style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '8px' }}>{new Date(notice.createdAt).toLocaleDateString()}</div>
                                        <h3 style={{ fontSize: '1.2rem' }}>{notice.title}</h3>
                                    </div>
                                ))}
                            </div>
                        </section>
                        <section>
                            <h2 style={{ fontSize: '1.8rem', marginBottom: '30px' }}>CHAMPIONS</h2>
                            <div className="game-card" style={{ overflow: 'hidden' }}>
                                <Leaderboard currentUsername={user?.username || ''} limit={10} compact={true} />
                            </div>
                        </section>
                    </div>
                )}
            </main>

            <nav className="glass-panel" style={{
                position: 'fixed',
                bottom: '15px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '95%',
                maxWidth: '600px',
                height: '85px',
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                borderRadius: '30px',
                zIndex: 1000,
                boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
                padding: '0 10px'
            }}>
                <TabButton active={currentTab === 'shop'} icon="🛒" label="SHOP" onClick={() => setCurrentTab('shop')} />
                <TabButton active={currentTab === 'deck'} icon="🃏" label="DECK" onClick={() => setCurrentTab('deck')} />
                <TabButton active={currentTab === 'battle'} icon="⚔️" label="BATTLE" onClick={() => setCurrentTab('battle')} />
                <TabButton active={currentTab === 'events'} icon="🏆" label="SOCIAL" onClick={() => setCurrentTab('events')} />
            </nav>

            {showEncyclopedia && <CardEncyclopedia onClose={() => setShowEncyclopedia(false)} />}

            {showAttendance && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(30px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="game-card" style={{ maxWidth: '400px', padding: '50px', textAlign: 'center', border: '3px solid var(--color-accent)' }}>
                        <div style={{ fontSize: '7rem', marginBottom: '20px' }}>🎁</div>
                        <h2 style={{ fontSize: '2.5rem', color: 'var(--color-accent)', marginBottom: '15px' }}>DAILY GIFT</h2>
                        <p style={{ marginBottom: '40px', fontSize: '1.2rem', opacity: 0.7 }}>Collect your daily 50 gold coins!</p>
                        <button onClick={claimDailyReward} className="premium-button" style={{ width: '100%', padding: '25px', fontSize: '1.4rem' }}>COLLECT NOW</button>
                        <p onClick={() => setShowAttendance(false)} style={{ marginTop: '30px', opacity: 0.4, cursor: 'pointer', fontWeight: 'bold' }}>LATER</p>
                    </div>
                </div>
            )}

            {selectedNotice && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="game-card" style={{ maxWidth: '600px', width: '90%', padding: '50px' }}>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{selectedNotice.title}</h2>
                        <div style={{ opacity: 0.5, marginBottom: '30px' }}>{new Date(selectedNotice.createdAt || Date.now()).toLocaleDateString()}</div>
                        <p style={{ lineHeight: '1.8', fontSize: '1.2rem', marginBottom: '50px', opacity: 0.9 }}>{selectedNotice.content}</p>
                        <button onClick={() => setSelectedNotice(null)} className="premium-button" style={{ width: '100%', padding: '20px', fontSize: '1.2rem' }}>DISMISS</button>
                    </div>
                </div>
            )}
        </div>
    );
}

const TabButton = ({ active, icon, label, onClick }) => (
    <button onClick={onClick} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', transition: 'var(--transition-bouncy)', transform: active ? 'translateY(-15px) scale(1.15)' : 'none', color: active ? 'var(--color-accent)' : 'rgba(255,255,255,0.4)' }}>
        <div style={{ fontSize: '2rem', marginBottom: '4px', filter: active ? 'drop-shadow(0 0 15px var(--color-accent))' : 'none' }}>{icon}</div>
        <div style={{ fontSize: '0.8rem', fontWeight: '900', letterSpacing: '1px' }}>{label}</div>
    </button>
);

export default Lobby;
