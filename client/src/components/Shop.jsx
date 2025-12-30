import React, { useState, useEffect } from 'react';
import { API_URL } from '../socket';
import { UNITS, EMOTES, BOOSTERS } from '../game/constants';

export default function Shop({ user, setUser, onClose }) {
    const [activeTab, setActiveTab] = useState('store'); // 'store', 'emotes', 'boosters', 'collection', 'event'
    const [isOpeningBox, setIsOpeningBox] = useState(false);
    const [boxRewards, setBoxRewards] = useState(null);
    const [loading, setLoading] = useState(false);

    const buyBox = async (boxType = 'silver') => {
        if (loading || !user) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/shop/buy-box`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: user.username, boxType })
            });
            const data = await res.json();
            if (res.ok) {
                setBoxRewards(data.rewards);
                setIsOpeningBox(true);
                const updatedUser = { ...user, coins: data.coins, inventory: data.inventory };
                setUser(updatedUser);
                localStorage.setItem('bibeGameUser', JSON.stringify(updatedUser));
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error("Buy box error:", err);
            alert("서버 통신 오류");
        } finally {
            setLoading(false);
        }
    };

    const buyEmote = async (emoteId) => {
        if (loading || !user) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/shop/buy-emote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: user.username, emoteId })
            });
            const data = await res.json();
            if (res.ok) {
                alert("이모티콘을 구매했습니다!");
                const updatedUser = { ...user, coins: data.coins, inventory: data.inventory };
                setUser(updatedUser);
                localStorage.setItem('bibeGameUser', JSON.stringify(updatedUser));
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error("Buy emote error:", err);
        } finally {
            setLoading(false);
        }
    };

    const buyBooster = async (boosterId) => {
        if (loading || !user) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/shop/buy-booster`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: user.username, boosterId })
            });
            const data = await res.json();
            if (res.ok) {
                alert("부스터를 구매했습니다!");
                const updatedUser = { ...user, coins: data.coins, inventory: data.inventory };
                setUser(updatedUser);
                localStorage.setItem('bibeGameUser', JSON.stringify(updatedUser));
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error("Buy booster error:", err);
        } finally {
            setLoading(false);
        }
    };

    const getCardIcon = (cardId) => {
        const unit = Object.values(UNITS).find(u => u.id === cardId);
        if (unit?.id === 'skeletons') return '💀';
        if (unit?.id === 'goblin') return '👺';
        if (unit?.id === 'knight') return '⚔️';
        if (unit?.id === 'archer') return '🏹';
        if (unit?.id === 'giant') return '👤';
        if (unit?.id === 'wizard') return '🔥';
        if (unit?.id === 'fireball') return '☄️';
        if (unit?.id === 'cannon') return '💣';
        if (unit?.id === 'witch') return '🧙‍♀️';
        if (unit?.id === 'balloon') return '🎈';
        if (unit?.id === 'hog_rider') return '🐗';
        return '🃏';
    };

    const getRarityColor = (rarity) => {
        switch (rarity) {
            case 'normal': return '#bdc3c7';
            case 'rare': return '#3498db';
            case 'epic': return '#9b59b6';
            case 'master': return '#f1c40f';
            default: return 'white';
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.95)',
            backdropFilter: 'blur(20px)',
            zIndex: 3000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: 'white',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Shop Header */}
            <div style={{
                width: '100%',
                maxWidth: '1000px',
                padding: '30px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '900', color: '#f1c40f', letterSpacing: '-1px' }}>SKY SHOP</h1>
                    <div style={{
                        background: 'rgba(255,184,0,0.1)',
                        padding: '10px 20px',
                        borderRadius: '30px',
                        color: '#ffb800',
                        fontWeight: '900',
                        fontSize: '1.2rem',
                        border: '2px solid rgba(255,184,0,0.2)'
                    }}>
                        💰 {user?.coins || 0}
                    </div>
                </div>
                <button
                    onClick={onClose}
                    style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        color: 'white',
                        padding: '12px 25px',
                        borderRadius: '15px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        transition: 'all 0.2s'
                    }}
                >BACK</button>
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                gap: '15px',
                marginBottom: '40px',
                background: 'rgba(255,255,255,0.05)',
                padding: '8px',
                borderRadius: '40px',
                border: '1px solid rgba(255,255,255,0.1)'
            }}>
                {['STORE', 'EMOTES', 'BOOSTERS', 'COLLECTION', 'EVENT'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab.toLowerCase())}
                        style={{
                            padding: '12px 35px',
                            borderRadius: '35px',
                            border: 'none',
                            background: activeTab === tab.toLowerCase() ? '#f1c40f' : 'transparent',
                            color: activeTab === tab.toLowerCase() ? '#000' : '#fff',
                            fontWeight: '900',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                        }}
                    >{tab}</button>
                ))}
            </div>

            {/* Store Content */}
            <div style={{
                width: '95%',
                maxWidth: '1100px',
                height: 'calc(100vh - 280px)',
                overflowY: 'auto',
                padding: '10px',
                scrollbarWidth: 'none'
            }}>
                {activeTab === 'store' && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                        gap: '30px',
                        paddingBottom: '50px'
                    }}>
                        {[
                            { id: 'silver', name: 'Silver Chest', cost: 200, emoji: '📦', desc: 'Unlocks 1 random card!' },
                            { id: 'gold', name: 'Gold Chest', cost: 500, emoji: '🎁', desc: 'Unlocks 3 random cards!' },
                            { id: 'diamond', name: 'Legendary Chest', cost: 1200, emoji: '💎', desc: 'Unlocks 6 random cards!' }
                        ].map(item => (
                            <div key={item.id} style={{
                                background: 'linear-gradient(135deg, rgba(52,73,94,0.6) 0%, rgba(44,62,80,0.8) 100%)',
                                padding: '50px 30px',
                                borderRadius: '40px',
                                textAlign: 'center',
                                border: '1px solid rgba(255,255,255,0.1)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <div style={{ fontSize: '6rem', marginBottom: '20px' }}>{item.emoji}</div>
                                <h3 style={{ margin: '0 0 10px', fontSize: '2rem', fontWeight: '900' }}>{item.name}</h3>
                                <p style={{ fontSize: '1rem', color: '#95a5a6', marginBottom: '35px' }}>{item.desc}</p>
                                <button
                                    onClick={() => buyBox(item.id)}
                                    disabled={loading}
                                    style={{
                                        width: '100%',
                                        padding: '18px',
                                        background: item.id === 'diamond' ? 'linear-gradient(90deg, #f1c40f, #e67e22)' : '#3498db',
                                        border: 'none',
                                        borderRadius: '20px',
                                        fontWeight: '900',
                                        fontSize: '1.4rem',
                                        cursor: 'pointer',
                                        color: '#fff',
                                        boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                                    }}
                                >
                                    💰 {item.cost}
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'emotes' && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                        gap: '20px'
                    }}>
                        {Object.values(EMOTES).map(emote => {
                            const isOwned = user?.inventory?.ownedEmotes?.includes(emote.id) || false;
                            return (
                                <div key={emote.id} style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    padding: '30px 20px',
                                    borderRadius: '30px',
                                    textAlign: 'center',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    opacity: isOwned ? 0.6 : 1
                                }}>
                                    <div style={{ fontSize: '4rem', marginBottom: '15px' }}>{emote.emoji}</div>
                                    <div style={{ fontWeight: '900', marginBottom: '20px' }}>{emote.name}</div>
                                    <button
                                        onClick={() => !isOwned && buyEmote(emote.id)}
                                        disabled={loading || isOwned}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            background: isOwned ? '#bdc3c7' : '#2ecc71',
                                            border: 'none',
                                            borderRadius: '15px',
                                            fontWeight: 'bold',
                                            color: '#fff',
                                            cursor: isOwned ? 'default' : 'pointer'
                                        }}
                                    >
                                        {isOwned ? 'OWNED' : `💰 ${emote.price}`}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

                {activeTab === 'boosters' && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                        gap: '30px'
                    }}>
                        {Object.values(BOOSTERS).map(booster => (
                            <div key={booster.id} style={{
                                background: 'rgba(255,255,255,0.05)',
                                padding: '40px',
                                borderRadius: '40px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '30px'
                            }}>
                                <div style={{ fontSize: '5rem' }}>{booster.id === 'coin_boost' ? '🌕' : '🥚'}</div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: '0 0 10px', fontSize: '1.8rem', fontWeight: '900' }}>{booster.name}</h3>
                                    <p style={{ color: '#95a5a6', marginBottom: '20px' }}>{booster.desc}</p>
                                    <button
                                        onClick={() => buyBooster(booster.id)}
                                        disabled={loading}
                                        style={{
                                            padding: '15px 40px',
                                            background: '#9b59b6',
                                            border: 'none',
                                            borderRadius: '20px',
                                            fontWeight: '900',
                                            color: '#fff',
                                            fontSize: '1.2rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        💰 {booster.cost}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'collection' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#f1c40f', marginBottom: '20px' }}>UNLOCKED CARDS</h2>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                                gap: '20px'
                            }}>
                                {user?.inventory?.unlockedCards?.map(cardId => {
                                    const unit = Object.values(UNITS).find(u => u.id === cardId);
                                    return (
                                        <div key={cardId} style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            padding: '20px',
                                            borderRadius: '25px',
                                            textAlign: 'center',
                                            border: `2px solid ${getRarityColor(unit?.rarity)}`
                                        }}>
                                            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>{getCardIcon(cardId)}</div>
                                            <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{unit?.name || cardId}</div>
                                            <div style={{ fontSize: '0.7rem', color: getRarityColor(unit?.rarity), fontWeight: '900', marginTop: '5px' }}>
                                                {unit?.rarity?.toUpperCase()}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#3498db', marginBottom: '20px' }}>OWNED EMOTES</h2>
                            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                                {user?.inventory?.ownedEmotes?.map(emoteId => (
                                    <div key={emoteId} style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        width: '80px', height: '80px',
                                        borderRadius: '20px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '2.5rem',
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }}>{EMOTES[emoteId]?.emoji}</div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#2ecc71', marginBottom: '20px' }}>ACTIVE BOOSTERS</h2>
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <div style={{ background: 'rgba(52,152,219,0.1)', padding: '20px 30px', borderRadius: '25px', border: '1px solid #3498db' }}>
                                    <div style={{ fontSize: '0.9rem', color: '#3498db', fontWeight: 'bold' }}>COIN BOOST</div>
                                    <div style={{ fontSize: '2rem', fontWeight: '900' }}>{user?.inventory?.boosters?.coinBoost || 0} Matches</div>
                                </div>
                                <div style={{ background: 'rgba(46,204,113,0.1)', padding: '20px 30px', borderRadius: '25px', border: '1px solid #2ecc71' }}>
                                    <div style={{ fontSize: '0.9rem', color: '#2ecc71', fontWeight: 'bold' }}>EGG BOOST</div>
                                    <div style={{ fontSize: '2rem', fontWeight: '900' }}>{user?.inventory?.boosters?.eggBoost || 0} Matches</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'event' && (
                    <div style={{ textAlign: 'center', padding: '100px 0' }}>
                        <div style={{ fontSize: '5rem', marginBottom: '20px' }}>🎪</div>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '900' }}>COMING SOON</h2>
                        <p style={{ color: '#95a5a6', fontSize: '1.2rem' }}>새로운 시즌 이벤트가 준비 중입니다!</p>
                    </div>
                )}
            </div>

            {/* Opening Box Overlay */}
            {isOpeningBox && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.95)',
                    zIndex: 4000,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(30px)'
                }}>
                    <h2 style={{ color: '#f1c40f', fontSize: '3rem', fontWeight: '900', marginBottom: '50px', textShadow: '0 0 20px rgba(241,196,15,0.5)' }}>CARDS UNLOCKED!</h2>
                    <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap', justifyContent: 'center', padding: '0 20px' }}>
                        {boxRewards?.map((cardId, i) => {
                            const unit = Object.values(UNITS).find(u => u.id === cardId);
                            return (
                                <div key={i} style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    padding: '40px 30px',
                                    borderRadius: '32px',
                                    border: `3px solid ${getRarityColor(unit?.rarity)}`,
                                    textAlign: 'center',
                                    minWidth: '160px',
                                    animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) backwards',
                                    animationDelay: `${i * 0.15}s`,
                                    boxShadow: `0 0 30px ${getRarityColor(unit?.rarity)}44`
                                }}>
                                    <div style={{ fontSize: '5rem', marginBottom: '15px' }}>{getCardIcon(cardId)}</div>
                                    <div style={{ fontWeight: '900', fontSize: '1.2rem', marginBottom: '5px' }}>{unit?.name || cardId}</div>
                                    <div style={{ color: getRarityColor(unit?.rarity), fontWeight: 'bold', fontSize: '0.9rem' }}>{unit?.rarity?.toUpperCase()}</div>
                                </div>
                            );
                        })}
                    </div>
                    <button
                        onClick={() => setIsOpeningBox(false)}
                        style={{
                            marginTop: '60px',
                            padding: '18px 80px',
                            borderRadius: '40px',
                            border: 'none',
                            background: '#f1c40f',
                            color: '#000',
                            fontWeight: '900',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            boxShadow: '0 10px 30px rgba(241,196,15,0.3)'
                        }}
                    >CONTINUE</button>

                    <style>{`
                        @keyframes popIn {
                            0% { transform: scale(0) translateY(50px); opacity: 0; }
                            100% { transform: scale(1) translateY(0); opacity: 1; }
                        }
                    `}</style>
                </div>
            )}
        </div>
    );
}
