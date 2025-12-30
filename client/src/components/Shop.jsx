import React, { useState, useEffect } from 'react';
import { API_URL } from '../socket';

export default function Shop({ user, onClose, onPurchase }) {
    const [items, setItems] = useState([]);
    const [tab, setTab] = useState('items'); // 'items' or 'emotes'
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch(`${API_URL}/api/shop/items`)
            .then(res => res.json())
            .then(data => setItems(data))
            .catch(err => console.error(err));
    }, []);

    const handleBuy = async (item) => {
        if (!user) return alert('로그인이 필요합니다.');
        if (user.coins < item.price) return alert('코인이 부족합니다.');
        if (item.type === 'emote' && user.inventory.includes(item.id)) return alert('이미 보유 중인 이모티콘입니다.');

        if (!confirm(`${item.name}을(를) ${item.price} 코인에 구매하시겠습니까?`)) return;

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/shop/buy`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: user.username, itemId: item.id })
            });
            const data = await res.json();
            if (res.ok) {
                alert(data.message);
                if (onPurchase) onPurchase(data.coins); // Update coins in parent
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert('구매 오류');
        } finally {
            setLoading(false);
        }
    };

    const displayedItems = items.filter(item =>
        tab === 'emotes' ? item.type === 'emote' : item.type !== 'emote'
    );

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(10px)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }} onClick={onClose}>
            <div style={{
                width: '100%',
                maxWidth: '800px',
                height: '80vh',
                background: 'linear-gradient(180deg, #1a1c2c 0%, #2c3e50 100%)',
                borderRadius: '24px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{
                    padding: '20px',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(0,0,0,0.2)'
                }}>
                    <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        🛒 <span style={{ background: 'linear-gradient(90deg, #f1c40f, #e67e22)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '900' }}>PREMIUM SHOP</span>
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', padding: '10px 20px', gap: '10px' }}>
                    <button
                        onClick={() => setTab('items')}
                        style={{
                            flex: 1,
                            padding: '12px',
                            background: tab === 'items' ? 'rgba(255,255,255,0.1)' : 'transparent',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            transition: 'all 0.2s'
                        }}
                    >💎 Items & Buffs</button>
                    <button
                        onClick={() => setTab('emotes')}
                        style={{
                            flex: 1,
                            padding: '12px',
                            background: tab === 'emotes' ? 'rgba(255,255,255,0.1)' : 'transparent',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            transition: 'all 0.2s'
                        }}
                    >😀 Emotes</button>
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                        {displayedItems.map(item => {
                            const isOwned = user?.inventory?.includes(item.id);
                            return (
                                <div key={item.id} style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '16px',
                                    padding: '20px',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    position: 'relative',
                                    transition: 'transform 0.2s'
                                }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>

                                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>{item.icon}</div>
                                    <h3 style={{ margin: '0 0 5px', fontSize: '1.1rem' }}>{item.name}</h3>
                                    <p style={{ color: '#aaa', fontSize: '0.8rem', margin: '0 0 15px', flex: 1 }}>{item.desc}</p>

                                    <button
                                        onClick={() => handleBuy(item)}
                                        disabled={loading || (item.type === 'emote' && isOwned)}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            background: (item.type === 'emote' && isOwned) ? '#555' : 'linear-gradient(90deg, #f1c40f, #e67e22)',
                                            color: (item.type === 'emote' && isOwned) ? '#888' : 'white',
                                            fontWeight: 'bold',
                                            cursor: (item.type === 'emote' && isOwned) ? 'default' : 'pointer',
                                            boxShadow: (item.type === 'emote' && isOwned) ? 'none' : '0 4px 10px rgba(241,196,15,0.3)'
                                        }}
                                    >
                                        {item.type === 'emote' && isOwned ? 'OWNED' : `💰 ${item.price}`}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
