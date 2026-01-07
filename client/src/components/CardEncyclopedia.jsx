import React, { useState } from 'react';
import { UNITS, EVOLVED_STATS } from '../game/constants';

export default function CardEncyclopedia({ onClose }) {
    const [selectedCard, setSelectedCard] = useState(null);

    // Filter out internal units like King Tower or Side Tower if needed, 
    // but usually, players want to know about everything.
    // Let's focus on playable cards (those with cost).
    const playableCards = Object.values(UNITS).filter(u => u.cost !== undefined && u.type !== 'egg');

    const getImageUrl = (id) => {
        // Special mapping for skeletons if needed, or assume standard naming
        if (id === 'skeletons') id = 'skeleton';
        return `/src/assets/${id}_card.png`;
    };

    const StatItem = ({ label, value, evolvedValue, unit = '' }) => {
        if (value === undefined) return null;
        const hasEvo = evolvedValue !== undefined && evolvedValue !== value;

        return (
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                fontSize: '0.9rem'
            }}>
                <span style={{ color: '#95a5a6' }}>{label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 'bold' }}>{value}{unit}</span>
                    {hasEvo && (
                        <span style={{ color: '#f1c40f', fontSize: '0.8rem', fontWeight: 'bold' }}>
                            → {evolvedValue}{unit}
                        </span>
                    )}
                </div>
            </div>
        );
    };

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
                maxWidth: '1000px',
                height: '85vh',
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
                    padding: '20px 30px',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(0,0,0,0.2)'
                }}>
                    <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        📖 <span style={{ background: 'linear-gradient(90deg, #3498db, #2ecc71)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '900' }}>CARD ENCYCLOPEDIA</span>
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
                </div>

                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                    {/* Card List */}
                    <div style={{
                        flex: selectedCard ? '0.4' : '1',
                        overflowY: 'auto',
                        padding: '20px',
                        borderRight: selectedCard ? '1px solid rgba(255,255,255,0.1)' : 'none',
                        transition: 'all 0.3s ease'
                    }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(auto-fill, minmax(${selectedCard ? '120px' : '160px'}, 1fr))`,
                            gap: '15px'
                        }}>
                            {playableCards.map(card => (
                                <div
                                    key={card.id}
                                    onClick={() => setSelectedCard(card)}
                                    style={{
                                        background: selectedCard?.id === card.id ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                                        borderRadius: '16px',
                                        padding: '12px',
                                        border: selectedCard?.id === card.id ? '2px solid #3498db' : '1px solid rgba(255,255,255,0.05)',
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <img
                                        src={getImageUrl(card.id)}
                                        alt={card.name}
                                        style={{ width: '100%', borderRadius: '8px', marginBottom: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.3)' }}
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=' + card.name; }}
                                    />
                                    <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{card.name}</div>
                                    <div style={{ color: '#f1c40f', fontSize: '0.75rem', fontWeight: 'bold' }}>💧 {card.cost}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Detailed View */}
                    {selectedCard && (
                        <div style={{
                            flex: '0.6',
                            overflowY: 'auto',
                            padding: '30px',
                            background: 'rgba(0,0,0,0.1)',
                            animation: 'fadeIn 0.3s ease'
                        }}>
                            <style>{`
                                @keyframes fadeIn {
                                    from { opacity: 0; transform: translateX(20px); }
                                    to { opacity: 1; transform: translateX(0); }
                                }
                            `}</style>

                            <div style={{ display: 'flex', gap: '30px', marginBottom: '30px' }}>
                                <img
                                    src={getImageUrl(selectedCard.id)}
                                    alt={selectedCard.name}
                                    style={{ width: '180px', height: '240px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', objectFit: 'cover' }}
                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/180x240?text=' + selectedCard.name; }}
                                />
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '900' }}>{selectedCard.name}</h1>
                                        {EVOLVED_STATS[selectedCard.id.toUpperCase()] && (
                                            <span style={{
                                                background: 'linear-gradient(45deg, #f1c40f, #e67e22)',
                                                color: '#000',
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                fontSize: '0.7rem',
                                                fontWeight: 'bold'
                                            }}>EVOLUTION AVAILABLE</span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                            <div style={{ fontSize: '0.7rem', color: '#95a5a6' }}>COST</div>
                                            <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#f1c40f' }}>💧 {selectedCard.cost}</div>
                                        </div>
                                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                            <div style={{ fontSize: '0.7rem', color: '#95a5a6' }}>TYPE</div>
                                            <div style={{ fontSize: '1.2rem', fontWeight: '900', textTransform: 'uppercase' }}>{selectedCard.type}</div>
                                        </div>
                                    </div>
                                    <p style={{ color: '#ccc', lineHeight: '1.6' }}>
                                        {selectedCard.description || `${selectedCard.name} is a powerful ${selectedCard.type} card that can be used strategically in battle.`}
                                    </p>
                                </div>
                            </div>

                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <h3 style={{ margin: '0 0 15px', borderBottom: '2px solid #3498db', display: 'inline-block', paddingBottom: '5px' }}>STATISTICS</h3>

                                {selectedCard.type === 'spell' ? (
                                    <>
                                        <StatItem label="Radius" value={selectedCard.radius} evolvedValue={EVOLVED_STATS[selectedCard.id.toUpperCase()]?.radius} unit=" tiles" />
                                        <StatItem label="Duration" value={selectedCard.duration} evolvedValue={EVOLVED_STATS[selectedCard.id.toUpperCase()]?.duration} unit="s" />
                                        <StatItem label="Damage" value={selectedCard.damage} evolvedValue={EVOLVED_STATS[selectedCard.id.toUpperCase()]?.damage} />
                                        <StatItem label="Heal PS" value={selectedCard.healPerSecond} evolvedValue={EVOLVED_STATS[selectedCard.id.toUpperCase()]?.healPerSecond} />
                                        <StatItem label="Slow Level" value={selectedCard.curseSlow ? `${selectedCard.curseSlow * 100}%` : undefined} />
                                    </>
                                ) : (
                                    <>
                                        <StatItem label="Hitpoints" value={selectedCard.hp} evolvedValue={EVOLVED_STATS[selectedCard.id.toUpperCase()]?.hp} />
                                        {selectedCard.shield && <StatItem label="Shield" value={selectedCard.shield} />}
                                        <StatItem label="Damage" value={selectedCard.damage} evolvedValue={EVOLVED_STATS[selectedCard.id.toUpperCase()]?.damage} />
                                        <StatItem label="Attack Speed" value={selectedCard.attackSpeed} evolvedValue={EVOLVED_STATS[selectedCard.id.toUpperCase()]?.attackSpeed} unit="s" />
                                        <StatItem label="DPS" value={Math.round(selectedCard.damage / selectedCard.attackSpeed)} evolvedValue={EVOLVED_STATS[selectedCard.id.toUpperCase()]?.damage ? Math.round(EVOLVED_STATS[selectedCard.id.toUpperCase()].damage / (EVOLVED_STATS[selectedCard.id.toUpperCase()].attackSpeed || selectedCard.attackSpeed)) : undefined} />
                                        <StatItem label="Range" value={selectedCard.range} evolvedValue={EVOLVED_STATS[selectedCard.id.toUpperCase()]?.range} unit=" tiles" />
                                        <StatItem label="Move Speed" value={selectedCard.speed} evolvedValue={EVOLVED_STATS[selectedCard.id.toUpperCase()]?.speed} />
                                        <StatItem label="Count" value={selectedCard.count} evolvedValue={EVOLVED_STATS[selectedCard.id.toUpperCase()]?.count} />
                                        <StatItem label="Targets" value={selectedCard.targets} />
                                    </>
                                )}

                                {EVOLVED_STATS[selectedCard.id.toUpperCase()] && (
                                    <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(241,196,15,0.1)', borderRadius: '12px', border: '1px solid rgba(241,196,15,0.2)' }}>
                                        <div style={{ color: '#f1c40f', fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '5px' }}>⭐ EVOLUTION BONUS</div>
                                        <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                                            Evolved {selectedCard.name} gains significant stat boosts and special abilities.
                                            The yellow values indicate stats after evolution.
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {!selectedCard && (
                        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                            <div style={{ fontSize: '5rem', marginBottom: '20px' }}>🃏</div>
                            <div style={{ fontSize: '1.2rem' }}>카드를 선택하여 상세 정보를 확인하세요.</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
