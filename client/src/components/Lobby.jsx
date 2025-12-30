import React from 'react';
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
    const featuredCards = [
        { name: 'Giant', desc: 'Powerful tank with high HP', color: '#e67e22', icon: '👤' },
        { name: 'Hog Rider', desc: 'Fast building attacker', color: '#d35400', icon: '🐗' },
        { name: 'Pekka', desc: 'Heavily armored warrior', color: '#2c3e50', icon: '🤖' },
        { name: 'Balloon', desc: 'Slow but devastating', color: '#c0392b', icon: '🎈' }
    ];

    const newsItems = [
        { title: 'Season 24: Frost Peak!', date: 'Dec 28', content: 'New evolution cards and winter arena are here!' },
        { title: 'Balance Update', date: 'Dec 25', content: 'Goblin Hut and Cannon adjustments live now.' },
        { title: 'New Year Event', date: 'Jan 1', content: 'Log in on New Year for a free Legendary Egg!' }
    ];

    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            overflowY: 'auto',
            background: 'linear-gradient(135deg, #2c3e50 0%, #000000 100%)',
            color: 'white',
            fontFamily: "'Inter', sans-serif",
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingBottom: '50px'
        }}>
            {/* Premium Background Pattern Overlay */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
                backgroundSize: '30px 30px',
                pointerEvents: 'none',
                zIndex: 0
            }} />

            {/* Header Section */}
            <header style={{
                width: '100%',
                maxWidth: '800px',
                padding: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                position: 'sticky',
                top: 0,
                zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{
                        width: '45px',
                        height: '45px',
                        borderRadius: '50%',
                        background: 'linear-gradient(45deg, #f1c40f, #f39c12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        border: '2px solid white',
                        boxShadow: '0 0 10px rgba(241,196,15,0.5)'
                    }}>
                        {user?.username?.[0]?.toUpperCase() || 'P'}
                    </div>
                    <div>
                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{user?.username || 'Guest'}</div>
                        <div style={{ fontSize: '0.8rem', color: '#f1c40f' }}>🏆 {user?.trophies || 0} Trophies</div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={onProfileClick}
                        style={{
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            color: 'white',
                            padding: '8px 15px',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            transition: 'background 0.3s'
                        }}
                    >⚙ Profile</button>
                    <button
                        onClick={onLogout}
                        style={{
                            backgroundColor: '#c0392b',
                            border: 'none',
                            color: 'white',
                            padding: '8px 15px',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                        }}
                    >Logout</button>
                </div>
            </header>

            {/* Hero Banner Section */}
            <section style={{
                width: '90%',
                maxWidth: '800px',
                marginTop: '20px',
                borderRadius: '20px',
                height: '220px',
                background: 'linear-gradient(45deg, #2980b9, #8e44ad)',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                padding: '30px',
                zIndex: 1
            }}>
                <div style={{ zIndex: 2 }}>
                    <h1 style={{ fontSize: '2.5rem', margin: 0, textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>FROST PEAK</h1>
                    <p style={{ fontSize: '1.2rem', margin: '10px 0', opacity: 0.9 }}>Winter Season is Here!</p>
                    <button style={{
                        backgroundColor: '#f1c40f',
                        color: '#333',
                        border: 'none',
                        padding: '12px 25px',
                        borderRadius: '10px',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(241,196,15,0.4)'
                    }}>GO TO SHOP</button>
                </div>
                <div style={{
                    position: 'absolute',
                    right: '-20px',
                    bottom: '-20px',
                    fontSize: '10rem',
                    opacity: 0.2,
                    transform: 'rotate(-15deg)',
                    zIndex: 1
                }}>❄️</div>
            </section>

            {/* Battle Hub (The Core Game Controls) */}
            <section style={{
                width: '90%',
                maxWidth: '800px',
                marginTop: '30px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '20px',
                zIndex: 1
            }}>
                {/* Ranked / Multiplayer */}
                <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    padding: '25px',
                    borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(5px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '15px'
                }}>
                    <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#3498db' }}>Multiplayer</h2>
                    <div style={{ width: '100%', display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            placeholder="Room ID (e.g. 123)"
                            value={roomId}
                            onChange={e => setRoomId(e.target.value)}
                            style={{
                                flex: 1,
                                padding: '12px',
                                borderRadius: '10px',
                                border: '1px solid rgba(255,255,255,0.2)',
                                background: 'rgba(0,0,0,0.3)',
                                color: 'white',
                                fontSize: '1rem'
                            }}
                        />
                        <button
                            onClick={onJoinClick}
                            disabled={!roomId.trim()}
                            style={{
                                padding: '12px 20px',
                                borderRadius: '10px',
                                border: 'none',
                                backgroundColor: roomId.trim() ? '#3498db' : '#555',
                                color: 'white',
                                fontWeight: 'bold',
                                cursor: roomId.trim() ? 'pointer' : 'not-allowed',
                                transition: 'transform 0.2s',
                                boxShadow: '0 4px 15px rgba(52,152,219,0.3)'
                            }}
                            onMouseDown={e => e.target.style.transform = 'scale(0.95)'}
                            onMouseUp={e => e.target.style.transform = 'scale(1)'}
                        >JOIN</button>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#95a5a6' }}>Battle against players worldwide</div>
                </div>

                {/* Training / AI */}
                <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    padding: '25px',
                    borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(5px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '15px'
                }}>
                    <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#2ecc71' }}>AI Training</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                        <label style={{ fontSize: '0.9rem', color: '#ccc' }}>Difficulty:</label>
                        <select
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value)}
                            style={{
                                flex: 1,
                                padding: '10px',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.2)',
                                background: 'rgba(0,0,0,0.3)',
                                color: 'white'
                            }}
                        >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                            <option value="impossible">Impossible</option>
                        </select>
                    </div>
                    <button
                        onClick={onSinglePlayerClick}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '10px',
                            border: 'none',
                            backgroundColor: '#2ecc71',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1.1rem',
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(46,204,113,0.3)',
                            transition: 'background 0.3s'
                        }}
                    >BATTLE AI</button>
                </div>
            </section>

            {/* Featured Cards Horizontal Section */}
            <section style={{
                width: '90%',
                maxWidth: '800px',
                marginTop: '40px',
                zIndex: 1
            }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', borderLeft: '4px solid #f1c40f', paddingLeft: '15px' }}>Featured Units</h2>
                <div style={{
                    display: 'flex',
                    gap: '20px',
                    overflowX: 'auto',
                    paddingBottom: '10px',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                }}>
                    {featuredCards.map((card, i) => (
                        <div key={i} style={{
                            minWidth: '180px',
                            height: '240px',
                            background: `linear-gradient(135deg, ${card.color} 0%, #1a1a1a 100%)`,
                            borderRadius: '20px',
                            padding: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <div style={{ fontSize: '3rem', textAlign: 'center' }}>{card.icon}</div>
                            <div>
                                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{card.name}</div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '5px' }}>{card.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Leaderboard Section */}
            <section style={{
                width: '90%',
                maxWidth: '800px',
                marginTop: '40px',
                zIndex: 1
            }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Global Leaderboard</h2>
                <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <Leaderboard currentUsername={user?.username || ''} limit={5} compact={true} />
                </div>
            </section>

            {/* News Section */}
            <section style={{
                width: '90%',
                maxWidth: '800px',
                marginTop: '40px',
                zIndex: 1
            }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>News & Events</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {newsItems.map((item, i) => (
                        <div key={i} style={{
                            background: 'rgba(255,255,255,0.03)',
                            padding: '15px 20px',
                            borderRadius: '15px',
                            borderLeft: '4px solid #3498db',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{item.title}</div>
                                <div style={{ fontSize: '0.85rem', color: '#bdc3c7', marginTop: '3px' }}>{item.content}</div>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#7f8c8d', marginLeft: '20px' }}>{item.date}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Tips section */}
            <section style={{
                width: '90%',
                maxWidth: '800px',
                marginTop: '40px',
                padding: '30px',
                background: 'rgba(241,196,15,0.1)',
                borderRadius: '20px',
                border: '1px dashed #f1c40f',
                position: 'relative',
                zIndex: 1
            }}>
                <h3 style={{ margin: 0, color: '#f1c40f' }}>💡 Game Tip</h3>
                <p style={{ margin: '10px 0 0', fontStyle: 'italic', color: '#ecf0f1' }}>
                    "Wait for 10 mana before starting your first push to ensure you have enough to support your tank!"
                </p>
            </section>

            <footer style={{ marginTop: '50px', opacity: 0.5, fontSize: '0.8rem' }}>
                © 2025 Bibe Royale • Version 2.1.0
            </footer>
        </div>
    );
}

export default Lobby;
