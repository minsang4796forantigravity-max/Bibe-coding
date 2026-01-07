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
                if (onPurchase) onPurchase(data.coins);
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
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '25px' }}>
            <style>{`
                .shop-tab-btn { flex: 1; padding: 15px; border: none; background: rgba(255,255,255,0.05); color: #fff; cursor: pointer; border-radius: 15px; font-weight: 900; transition: var(--transition-smooth); }
                .shop-tab-btn.active { background: var(--color-gold); color: #fff; transform: scale(1.05); box-shadow: var(--shadow-glow-accent); }
                .item-card { background: var(--color-glass); border: 1px solid var(--color-glass-border); border-radius: 25px; padding: 30px; display: flex; flexDirection: column; alignItems: center; textAlign: center; transition: var(--transition-bouncy); }
                .item-card:hover { transform: translateY(-10px); background: rgba(255,255,255,0.1); }
            `}</style>

            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontSize: '2.5rem' }}>🛒</span> <span style={{ background: 'var(--color-gold)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>TRADER'S OUTPOST</span>
                </h2>
            </header>

            <div style={{ display: 'flex', gap: '15px' }}>
                <button onClick={() => setTab('items')} className={`shop-tab-btn ${tab === 'items' ? 'active' : ''}`}>💎 TREASURES</button>
                <button onClick={() => setTab('emotes')} className={`shop-tab-btn ${tab === 'emotes' ? 'active' : ''}`}>😀 EMOTES</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '25px' }}>
                {displayedItems.map(item => {
                    const isOwned = user?.inventory?.includes(item.id);
                    return (
                        <div key={item.id} className="item-card">
                            <div style={{ fontSize: '4.5rem', marginBottom: '20px', filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.5))' }}>{item.icon}</div>
                            <h3 style={{ margin: '0 0 10px', fontSize: '1.3rem', color: '#fff' }}>{item.name}</h3>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '25px', minHeight: '40px' }}>{item.desc}</p>

                            <button
                                onClick={() => handleBuy(item)}
                                disabled={loading || (item.type === 'emote' && isOwned)}
                                className="premium-button"
                                style={{
                                    width: '100%',
                                    padding: '15px',
                                    background: (item.type === 'emote' && isOwned) ? '#444' : 'var(--color-gold)',
                                    opacity: (item.type === 'emote' && isOwned) ? 0.5 : 1
                                }}
                            >
                                {item.type === 'emote' && isOwned ? 'OWNED' : `💰 ${item.price}`}
                            </button>
                        </div>
                    );
                })}
                {displayedItems.length === 0 && <p style={{ textAlign: 'center', width: '100%', opacity: 0.5 }}>Currently out of stock. Check back later!</p>}
            </div>

            <div style={{ marginTop: '50px', padding: '30px', background: 'rgba(241, 196, 15, 0.05)', borderRadius: '25px', border: '1px dashed rgba(241, 196, 15, 0.2)', textAlign: 'center' }}>
                <h4 style={{ color: 'var(--color-accent)', margin: '0 0 10px' }}>SPECIAL OFFER</h4>
                <p style={{ margin: 0, opacity: 0.8 }}>Login every day to collect free gold at the Attendance reward!</p>
            </div>
        </div>
    );
}
