import React, { useState, useEffect } from 'react';
import { API_URL } from '../socket';
import { UNITS } from '../game/constants';

export default function Shop({ user, setUser, onClose }) {
    const [activeTab, setActiveTab] = useState('store'); // 'store' or 'collection'
    const [isOpeningBox, setIsOpeningBox] = useState(false);
    const [boxRewards, setBoxRewards] = useState(null);
    const [loading, setLoading] = useState(false);

    const buyBox = async (boxType = 'silver') => {
        if (loading) return;
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
                // Update local user state
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

    const buyShards = async (cardId, shards, cost) => {
        if (loading) return;
        if (user.coins < cost) {
            alert("코인이 부족합니다.");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/shop/buy-shards`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: user.username, cardId, shards, cost })
            });
            const data = await res.json();
            if (res.ok) {
                alert(`${cardId} 샤드 ${shards}개를 획득했습니다!`);
                const updatedUser = { ...user, coins: data.coins, inventory: data.inventory };
                setUser(updatedUser);
                localStorage.setItem('bibeGameUser', JSON.stringify(updatedUser));
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error("Buy shards error:", err);
        } finally {
            setLoading(false);
        }
    };

    const upgradeCard = async (cardId) => {
        if (loading) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/shop/upgrade-card`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: user.username, cardId })
            });
            const data = await res.json();
            if (res.ok) {
                alert(data.message);
                const updatedUser = { ...user, coins: data.coins, inventory: data.inventory };
                setUser(updatedUser);
                localStorage.setItem('bibeGameUser', JSON.stringify(updatedUser));
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error("Upgrade error:", err);
            alert("서버 통신 오류");
        } finally {
            setLoading(false);
        }
    };

    const UPGRADE_COSTS = {
        1: { coins: 50, shards: 10 },
        2: { coins: 150, shards: 20 },
        3: { coins: 400, shards: 50 },
        4: { coins: 1000, shards: 100 },
        5: { coins: 2500, shards: 250 }
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
        return '🃏';
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.9)',
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
                maxWidth: '800px',
                padding: '30px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '900', color: '#f1c40f' }}>SHOP</h1>
                    <div style={{ background: 'rgba(255,184,0,0.1)', padding: '5px 15px', borderRadius: '20px', color: '#ffb800', fontWeight: 'bold' }}>
                        💰 {user.coins}
                    </div>
                </div>
                <button
                    onClick={onClose}
                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}
                >닫기</button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                <button
                    onClick={() => setActiveTab('store')}
                    style={{
                        padding: '12px 30px',
                        borderRadius: '30px',
                        border: 'none',
                        background: activeTab === 'store' ? '#f1c40f' : 'rgba(255,255,255,0.05)',
                        color: activeTab === 'store' ? '#000' : '#fff',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                    }}
                >STORE</button>
                <button
                    onClick={() => setActiveTab('collection')}
                    style={{
                        padding: '12px 30px',
                        borderRadius: '30px',
                        border: 'none',
                        background: activeTab === 'collection' ? '#3498db' : 'rgba(255,255,255,0.05)',
                        color: activeTab === 'collection' ? '#000' : '#fff',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                    }}
                >COLLECTION</button>
            </div>

            {/* Store Content */}
            {activeTab === 'store' && (
                <div style={{
                    width: '95%',
                    maxWidth: '1000px',
                    height: 'calc(100vh - 250px)',
                    overflowY: 'auto',
                    padding: '10px',
                    scrollbarWidth: 'none'
                }}>
                    <h2 style={{ fontSize: '1.2rem', color: '#7f8c8d', marginBottom: '20px', textAlign: 'left', marginLeft: '10px' }}>MYSTERY CHESTS</h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '25px',
                        marginBottom: '50px'
                    }}>
                        {[
                            { id: 'silver', name: 'Silver Box', cost: 200, emoji: '📦', desc: 'Random shards for 3 units!' },
                            { id: 'gold', name: 'Gold Box', cost: 500, emoji: '🎁', desc: 'Random shards for 5 units!' },
                            { id: 'diamond', name: 'Diamond Box', cost: 1200, emoji: '💎', desc: 'Random shards for 8 units!' }
                        ].map(item => (
                            <div key={item.id} style={{
                                background: 'linear-gradient(180deg, rgba(52,73,94,0.4) 0%, rgba(44,62,80,0.6) 100%)',
                                padding: '40px 30px',
                                borderRadius: '32px',
                                textAlign: 'center',
                                border: '1px solid rgba(255,255,255,0.08)',
                                backdropFilter: 'blur(10px)',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                                cursor: 'default'
                            }}>
                                <div style={{ fontSize: '5rem', marginBottom: '15px' }}>{item.emoji}</div>
                                <h3 style={{ margin: '0 0 10px', fontSize: '1.6rem' }}>{item.name}</h3>
                                <p style={{ fontSize: '0.9rem', color: '#95a5a6', marginBottom: '25px' }}>{item.desc}</p>
                                <button
                                    onClick={() => buyBox(item.id)}
                                    disabled={loading}
                                    style={{
                                        width: '100%',
                                        padding: '15px',
                                        background: item.id === 'diamond' ? 'linear-gradient(90deg, #3498db, #9b59b6)' : '#f1c40f',
                                        border: 'none',
                                        borderRadius: '16px',
                                        fontWeight: '900',
                                        fontSize: '1.3rem',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        color: item.id === 'diamond' ? '#fff' : '#000'
                                    }}
                                >
                                    💰 {item.cost}
                                </button>
                            </div>
                        ))}
                    </div>

                    <h2 style={{ fontSize: '1.2rem', color: '#7f8c8d', marginBottom: '20px', textAlign: 'left', marginLeft: '10px' }}>DAILY SPECIALS</h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '20px',
                        marginBottom: '40px'
                    }}>
                        {[
                            { id: 'giant', shards: 30, cost: 350 },
                            { id: 'balloon', shards: 20, cost: 600 },
                            { id: 'witch', shards: 25, cost: 450 },
                            { id: 'hog_rider', shards: 40, cost: 500 }
                        ].map(deal => (
                            <div key={deal.id} style={{
                                background: 'rgba(255,255,255,0.05)',
                                padding: '20px',
                                borderRadius: '24px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>{getCardIcon(deal.id)}</div>
                                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{deal.id.replace('_', ' ').toUpperCase()}</div>
                                <div style={{ color: '#2ecc71', fontWeight: '900', marginBottom: '15px' }}>x{deal.shards}</div>
                                <button
                                    onClick={() => buyShards(deal.id, deal.shards, deal.cost)}
                                    disabled={loading}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        background: '#3498db',
                                        border: 'none',
                                        borderRadius: '10px',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        cursor: 'pointer'
                                    }}
                                >
                                    💰 {deal.cost}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Collection Content */}
            {activeTab === 'collection' && (
                <div style={{
                    width: '90%',
                    maxWidth: '800px',
                    height: 'calc(100vh - 250px)',
                    overflowY: 'auto',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                    gap: '15px',
                    padding: '10px',
                    scrollbarWidth: 'none'
                }}>
                    {user.inventory?.map(item => {
                        const unit = Object.values(UNITS).find(u => u.id === item.cardId);
                        const upgrade = UPGRADE_COSTS[item.level];
                        const canUpgrade = upgrade && item.shards >= upgrade.shards && user.coins >= upgrade.coins;

                        return (
                            <div key={item.cardId} style={{
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '18px',
                                padding: '15px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                textAlign: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px'
                            }}>
                                <div style={{ fontSize: '2.5rem' }}>{getCardIcon(item.cardId)}</div>
                                <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{unit?.name || item.cardId}</div>
                                <div style={{ color: '#f1c40f', fontWeight: 'bold' }}>Lv.{item.level}</div>

                                {/* Shard Progress Bar */}
                                {upgrade && (
                                    <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.5)', borderRadius: '4px', overflow: 'hidden', marginTop: '5px' }}>
                                        <div style={{
                                            width: `${Math.min(100, (item.shards / upgrade.shards) * 100)}%`,
                                            height: '100%',
                                            background: '#2ecc71'
                                        }}></div>
                                    </div>
                                )}
                                <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                                    {upgrade ? `${item.shards} / ${upgrade.shards}` : 'MAX LEVEL'}
                                </div>

                                {upgrade && (
                                    <button
                                        onClick={() => upgradeCard(item.cardId)}
                                        disabled={!canUpgrade || loading}
                                        style={{
                                            marginTop: '5px',
                                            padding: '8px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            background: canUpgrade ? '#2ecc71' : 'rgba(255,184,0,0.2)',
                                            color: canUpgrade ? '#fff' : '#7f8c8d',
                                            fontSize: '0.8rem',
                                            fontWeight: 'bold',
                                            cursor: canUpgrade ? 'pointer' : 'not-allowed'
                                        }}
                                    >
                                        💰 {upgrade.coins}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

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
                    justifyContent: 'center'
                }}>
                    <h2 style={{ color: '#f1c40f', fontSize: '2.5rem', marginBottom: '40px' }}>BOX REWARDS!</h2>
                    <div style={{ display: 'flex', gap: '30px', marginBottom: '50px' }}>
                        {boxRewards?.map((reward, i) => (
                            <div key={i} style={{
                                background: 'rgba(255,255,255,0.1)',
                                padding: '30px',
                                borderRadius: '24px',
                                border: '2px solid gold',
                                textAlign: 'center',
                                animation: 'popIn 0.5s ease backwards',
                                animationDelay: `${i * 0.2}s`
                            }}>
                                <div style={{ fontSize: '4rem', marginBottom: '10px' }}>{getCardIcon(reward.cardId)}</div>
                                <div style={{ fontWeight: 'bold' }}>{reward.cardId.toUpperCase()}</div>
                                <h3 style={{ margin: '10px 0', color: '#2ecc71' }}>+{reward.shards}</h3>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={() => setIsOpeningBox(false)}
                        style={{ padding: '15px 50px', borderRadius: '30px', border: 'none', background: '#f1c40f', color: '#000', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer' }}
                    >확인</button>

                    <style>{`
                        @keyframes popIn {
                            0% { transform: scale(0); opacity: 0; }
                            70% { transform: scale(1.1); }
                            100% { transform: scale(1); opacity: 1; }
                        }
                    `}</style>
                </div>
            )}
        </div>
    );
}
