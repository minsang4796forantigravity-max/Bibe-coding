import React, { useState } from 'react';
import { UNITS, EVOLVED_STATS } from '../game/constants';

// 카드 이미지 import
import knightImg from '../assets/knight_card.png';
import archerImg from '../assets/archer_card.png';
import giantImg from '../assets/giant_card.png';
import wizardImg from '../assets/wizard_card.png';
import skeletonImg from '../assets/skeleton_card.png';
import cannonImg from '../assets/cannon_card.png';
import bomberImg from '../assets/bomber_card.png';
import kamikazeImg from '../assets/kamikaze_card.png';
import fireballImg from '../assets/fireball_card.png';
import manaCollectorImg from '../assets/mana_collector_card.png';
import sniperImg from '../assets/sniper_card.png';
import goblinHutImg from '../assets/goblin_hut_card.png';
import goblinImg from '../assets/goblin_card.png';
import valkyrieImg from '../assets/valkyrie_card.png';
import hogRiderImg from '../assets/hog_rider_card.png';
import witchImg from '../assets/witch_card.png';
import babyDragonImg from '../assets/baby_dragon_card.png';
import barbariansImg from '../assets/barbarians_card.png';
import tornadoImg from '../assets/tornado_card.png';
import rageImg from '../assets/rage_card.png';
import healImg from '../assets/heal_card.png';
import balloonImg from '../assets/balloon_card.png';
import logImg from '../assets/log_card.png';
import freezeImg from '../assets/freeze_card.png';
import electroWizardImg from '../assets/electro_wizard_card.png';
import goblinBarrelImg from '../assets/goblin_barrel_card.png';
import airDefenseImg from '../assets/air_defense_card.png';

const CARD_IMAGES = {
    knight: knightImg,
    archer: archerImg,
    giant: giantImg,
    wizard: wizardImg,
    skeletons: skeletonImg,
    cannon: cannonImg,
    bomber: bomberImg,
    kamikaze: kamikazeImg,
    fireball: fireballImg,
    mana_collector: manaCollectorImg,
    sniper: sniperImg,
    goblin_hut: goblinHutImg,
    goblin: goblinImg,
    valkyrie: valkyrieImg,
    hog_rider: hogRiderImg,
    witch: witchImg,
    baby_dragon: babyDragonImg,
    barbarians: barbariansImg,
    tornado: tornadoImg,
    rage: rageImg,
    heal: healImg,
    balloon: balloonImg,
    log: logImg,
    freeze: freezeImg,
    electro_wizard: electroWizardImg,
    goblin_barrel: goblinBarrelImg,
    air_defense: airDefenseImg,
};

export default function CardEncyclopedia({ onClose }) {
    const [selectedCard, setSelectedCard] = useState(null);

    // Filter out internal units like King Tower or Side Tower if needed, 
    // but usually, players want to know about everything.
    // Let's focus on playable cards (those with cost).
    const playableCards = Object.values(UNITS).filter(u => u.cost !== undefined && u.type !== 'egg');

    const getImageUrl = (id) => {
        return CARD_IMAGES[id];
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
                    padding: '24px 40px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(0,0,0,0.3)',
                    backdropFilter: 'blur(30px)'
                }}>
                    <h2 style={{ margin: 0, fontFamily: 'var(--font-title)', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ fontSize: '2rem' }}>📖</span>
                        <span style={{ background: 'var(--color-gold)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CARD ENCYCLOPEDIA</span>
                    </h2>
                    <button onClick={onClose} className="premium-button" style={{ background: 'var(--color-danger)', width: '40px', height: '40px', borderRadius: '50%', padding: 0 }}>✕</button>
                </div>

                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                    {/* Card List */}
                    <div style={{
                        flex: selectedCard ? '0.35' : '1',
                        overflowY: 'auto',
                        padding: '30px',
                        borderRight: selectedCard ? '1px solid rgba(255,255,255,0.05)' : 'none',
                        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(auto-fill, minmax(${selectedCard ? '100px' : '150px'}, 1fr))`,
                            gap: '20px'
                        }}>
                            {playableCards.map(card => (
                                <div
                                    key={card.id}
                                    onClick={() => setSelectedCard(card)}
                                    className="game-card"
                                    style={{
                                        position: 'relative',
                                        padding: '10px',
                                        cursor: 'pointer',
                                        border: selectedCard?.id === card.id ? '3px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.1)',
                                        background: selectedCard?.id === card.id ? 'rgba(52, 152, 219, 0.1)' : 'rgba(255,255,255,0.03)',
                                        boxShadow: selectedCard?.id === card.id ? 'var(--shadow-glow-primary)' : 'none'
                                    }}
                                >
                                    <img
                                        src={getImageUrl(card.id)}
                                        alt={card.name}
                                        style={{ width: '100%', borderRadius: '12px', marginBottom: '8px', filter: selectedCard?.id === card.id ? 'none' : 'grayscale(30%)' }}
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=' + card.name; }}
                                    />
                                    <div style={{ fontWeight: '900', fontSize: '0.8rem', color: '#fff' }}>{card.name.toUpperCase()}</div>
                                    <div style={{ color: 'var(--color-accent)', fontSize: '0.75rem', fontWeight: '900', marginTop: '4px' }}>💧 {card.cost}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Detailed View */}
                    {selectedCard && (
                        <div style={{
                            flex: '0.65',
                            overflowY: 'auto',
                            padding: '40px',
                            background: 'rgba(0,0,0,0.2)',
                            animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}>
                            <style>{`
                                @keyframes slideUp {
                                    from { opacity: 0; transform: translateY(40px); }
                                    to { opacity: 1; transform: translateY(0); }
                                }
                            `}</style>

                            <div style={{ display: 'flex', gap: '40px', marginBottom: '40px', alignItems: 'flex-start' }}>
                                <div style={{ position: 'relative' }}>
                                    <img
                                        src={getImageUrl(selectedCard.id)}
                                        alt={selectedCard.name}
                                        style={{ width: '220px', borderRadius: '30px', boxShadow: '0 30px 60px rgba(0,0,0,0.8)', border: '2px solid rgba(255,255,255,0.1)' }}
                                    />
                                    {EVOLVED_STATS[selectedCard.id.toUpperCase()] && (
                                        <div style={{ position: 'absolute', top: '-15px', right: '-15px', width: '50px', height: '50px', background: 'var(--color-gold)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', boxShadow: 'var(--shadow-glow-accent)', border: '4px solid #1a1c2c' }}>⭐</div>
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h1 style={{ fontFamily: 'var(--font-title)', fontSize: '2.5rem', margin: '0 0 15px', color: '#fff' }}>{selectedCard.name.toUpperCase()}</h1>
                                    <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
                                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px 25px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                            <div style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--color-accent)', marginBottom: '5px' }}>ELIXIR</div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: '900' }}>💧 {selectedCard.cost}</div>
                                        </div>
                                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px 25px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                            <div style={{ fontSize: '0.7rem', fontWeight: '900', color: 'rgba(255,255,255,0.4)', marginBottom: '5px' }}>TYPE</div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: '900', textTransform: 'uppercase' }}>{selectedCard.type}</div>
                                        </div>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '25px', borderRadius: '25px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.8', fontSize: '1.05rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        {selectedCard.description || `${selectedCard.name} is a high-impact ${selectedCard.type} deployment. Position wisely to dominate the arena flow.`}
                                    </div>
                                </div>
                            </div>

                            <div style={{ background: 'var(--color-glass)', padding: '35px', borderRadius: '35px', border: '1px solid var(--color-glass-border)' }}>
                                <h3 style={{ margin: '0 0 25px', fontFamily: 'var(--font-title)', color: 'var(--color-primary)' }}>CARD ATTRIBUTES</h3>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 40px' }}>
                                    {selectedCard.type === 'spell' ? (
                                        <>
                                            <StatItem label="Radius" value={selectedCard.radius} evolvedValue={EVOLVED_STATS[selectedCard.id.toUpperCase()]?.radius} unit=" tiles" />
                                            <StatItem label="Duration" value={selectedCard.duration} evolvedValue={EVOLVED_STATS[selectedCard.id.toUpperCase()]?.duration} unit="s" />
                                            <StatItem label="Damage" value={selectedCard.damage} evolvedValue={EVOLVED_STATS[selectedCard.id.toUpperCase()]?.damage} />
                                            <StatItem label="Heal PS" value={selectedCard.healPerSecond} evolvedValue={EVOLVED_STATS[selectedCard.id.toUpperCase()]?.healPerSecond} />
                                        </>
                                    ) : (
                                        <>
                                            <StatItem label="Hitpoints" value={selectedCard.hp} evolvedValue={EVOLVED_STATS[selectedCard.id.toUpperCase()]?.hp} />
                                            <StatItem label="Shield" value={selectedCard.shield} />
                                            <StatItem label="Damage" value={selectedCard.damage} evolvedValue={EVOLVED_STATS[selectedCard.id.toUpperCase()]?.damage} />
                                            <StatItem label="Attack Speed" value={selectedCard.attackSpeed} evolvedValue={EVOLVED_STATS[selectedCard.id.toUpperCase()]?.attackSpeed} unit="s" />
                                            <StatItem label="Range" value={selectedCard.range} evolvedValue={EVOLVED_STATS[selectedCard.id.toUpperCase()]?.range} unit=" tiles" />
                                            <StatItem label="Move Speed" value={selectedCard.speed} evolvedValue={EVOLVED_STATS[selectedCard.id.toUpperCase()]?.speed} />
                                            <StatItem label="Count" value={selectedCard.count} evolvedValue={EVOLVED_STATS[selectedCard.id.toUpperCase()]?.count} />
                                            <StatItem label="Targets" value={selectedCard.targets} />
                                        </>
                                    )}
                                </div>

                                {EVOLVED_STATS[selectedCard.id.toUpperCase()] && (
                                    <div style={{ marginTop: '30px', padding: '25px', background: 'rgba(241, 196, 15, 0.05)', borderRadius: '20px', border: '1px solid rgba(241, 196, 15, 0.2)', display: 'flex', gap: '20px', alignItems: 'center' }}>
                                        <div style={{ fontSize: '2.5rem' }}>🔥</div>
                                        <div>
                                            <div style={{ color: 'var(--color-accent)', fontWeight: '900', fontSize: '1rem', marginBottom: '5px' }}>EVOLUTION AWAKENED</div>
                                            <p style={{ margin: 0, opacity: 0.7, fontSize: '0.9rem' }}>Evolved units gain superior attributes and unique visual effects. Yellow indicators represent upgraded stats.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {!selectedCard && (
                        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                            <div style={{ fontSize: '10rem', marginBottom: '30px', filter: 'drop-shadow(0 0 30px rgba(255,255,255,0.1))' }}>📖</div>
                            <h3 style={{ fontFamily: 'var(--font-title)' }}>SELECT A CARD TO VIEW INTEL</h3>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
