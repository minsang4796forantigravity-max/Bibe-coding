import React, { useState, useEffect } from 'react';
import { UNITS } from '../game/constants';
import { API_URL } from '../socket';
import '../styles/evolution-effects.css';

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
import egg1Img from '../assets/egg_tier_1.png';
import egg2Img from '../assets/egg_tier_2.png';
import egg3Img from '../assets/egg_tier_3.png';
import egg4Img from '../assets/egg_tier_4.png';
import egg5Img from '../assets/egg_tier_5.png';

const ALL_CARDS = [
    'skeletons', 'goblin', 'knight', 'archer', 'bomber', 'kamikaze',
    'cannon', 'sniper', 'fireball', 'giant', 'wizard', 'goblin_hut', 'mana_collector',
    'valkyrie', 'hog_rider', 'witch', 'baby_dragon', 'barbarians',
    'tornado', 'rage', 'heal', 'balloon',
    'log', 'freeze', 'electro_wizard', 'goblin_barrel', 'air_defense',
    'egg_1', 'egg_2', 'egg_3', 'egg_4', 'egg_5', 'chicken'
];

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
    egg_1: egg1Img,
    egg_2: egg2Img,
    egg_3: egg3Img,
    egg_4: egg4Img,
    egg_5: egg5Img,
    chicken: goblinHutImg,
};

export function DeckSelector({ username, activeDeck, onActiveDeckChange }) {
    const [deckSlots, setDeckSlots] = useState(Array(8).fill(null));
    const [draggedCard, setDraggedCard] = useState(null);
    const [savedDecks, setSavedDecks] = useState([]);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [newDeckName, setNewDeckName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showSavedDecks, setShowSavedDecks] = useState(false);

    useEffect(() => {
        if (activeDeck && activeDeck.length === 8) {
            setDeckSlots(activeDeck);
        }
    }, [activeDeck]);

    useEffect(() => {
        if (username) fetchSavedDecks();
    }, [username]);

    const fetchSavedDecks = async () => {
        try {
            const response = await fetch(`${API_URL}/api/auth/decks/${username}`);
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data)) setSavedDecks(data);
            }
        } catch (error) {
            console.error('Error fetching saved decks:', error);
        }
    };

    const updateActiveDeck = async (newDeck) => {
        if (newDeck.filter(c => c !== null).length !== 8) return;
        try {
            await fetch(`${API_URL}/api/auth/active-deck`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, deck: newDeck })
            });
            if (onActiveDeckChange) onActiveDeckChange(newDeck);
        } catch (error) {
            console.error('Error updating active deck:', error);
        }
    };

    const handleSaveDeck = async () => {
        if (!newDeckName.trim()) return alert('덱 이름을 입력해주세요.');
        const cards = deckSlots.filter(c => c !== null);
        if (cards.length !== 8) return alert('덱을 모두 채워주세요!');

        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/auth/decks/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, deckName: newDeckName, cards })
            });
            if (response.ok) {
                const updatedDecks = await response.json();
                setSavedDecks(updatedDecks);
                setIsSaveModalOpen(false);
                setNewDeckName('');
                alert('덱이 저장되었습니다!');
            }
        } catch (error) {
            alert('저장 실패: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteDeck = async (deckId, e) => {
        e.stopPropagation();
        if (!window.confirm('정말 삭제하시겠습니까?')) return;
        try {
            const response = await fetch(`${API_URL}/api/auth/decks/${username}/${deckId}`, { method: 'DELETE' });
            if (response.ok) {
                const updatedDecks = await response.json();
                setSavedDecks(updatedDecks);
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const sortedCards = [...ALL_CARDS].sort((a, b) => (UNITS[a.toUpperCase()]?.cost || 0) - (UNITS[b.toUpperCase()]?.cost || 0));

    const groupedCards = sortedCards.reduce((acc, cardId) => {
        const stats = UNITS[cardId.toUpperCase()];
        if (!stats) return acc;
        let category = 'Melee';
        if (cardId.startsWith('egg_') || cardId === 'chicken') category = 'Special';
        else if (stats.type === 'spell') category = 'Spell';
        else if (stats.type === 'building') category = 'Building';
        else if (stats.type === 'flying') category = 'Air';
        else if (stats.range >= 2) category = 'Ranged';
        if (!acc[category]) acc[category] = [];
        acc[category].push(cardId);
        return acc;
    }, {});

    const handleDragStart = (e, cardId) => {
        setDraggedCard(cardId);
        e.dataTransfer.setData('cardId', cardId);
    };

    const handleDrop = (e, index) => {
        e.preventDefault();
        const cardId = e.dataTransfer.getData('cardId') || draggedCard;
        if (!cardId || deckSlots.includes(cardId)) return;
        const newSlots = [...deckSlots];
        newSlots[index] = cardId;
        setDeckSlots(newSlots);
        if (newSlots.filter(c => c !== null).length === 8) updateActiveDeck(newSlots);
    };

    const removeCard = (index) => {
        const newSlots = [...deckSlots];
        newSlots[index] = null;
        setDeckSlots(newSlots);
    };

    const Card = ({ cardId, isEvolution, isInDeck, onClick, onDragStart }) => {
        if (!cardId) return null;
        const stats = UNITS[cardId.toUpperCase()];
        return (
            <div
                draggable={!isInDeck}
                onDragStart={onDragStart}
                onClick={onClick}
                className={`game-card ${isEvolution ? 'deck-evolution-card' : ''}`}
                style={{
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url(${CARD_IMAGES[cardId]})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                    cursor: isInDeck ? 'pointer' : 'grab',
                    border: '2px solid rgba(255,255,255,0.2)',
                    boxShadow: isEvolution ? '0 0 15px rgba(243,156,18,0.5)' : 'var(--shadow-soft)',
                    overflow: 'hidden'
                }}
            >
                <div style={{
                    position: 'absolute',
                    top: '5px', left: '5px',
                    background: 'rgba(0,0,0,0.8)',
                    color: isEvolution ? 'var(--color-accent)' : '#fff',
                    padding: '2px 8px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: '900',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.5)'
                }}>
                    {stats?.cost}
                </div>
                {isEvolution && (
                    <div style={{ position: 'absolute', top: '5px', right: '5px', fontSize: '1.2rem', filter: 'drop-shadow(0 0 5px orange)' }}>⭐</div>
                )}
                <div style={{
                    position: 'absolute',
                    bottom: 0, left: 0, right: 0,
                    background: 'linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0.9))',
                    padding: '8px 4px',
                    textAlign: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    color: '#fff',
                    textTransform: 'uppercase'
                }}>
                    {stats?.name}
                </div>
            </div>
        );
    };

    return (
        <div style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <style>{`
                .deck-section { background: rgba(0,0,0,0.3); padding: 25px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.05); }
                .slot { width: 85px; height: 110px; transition: var(--transition-bouncy); }
                .slot:hover { transform: scale(1.05); }
                @media (max-width: 600px) { .slot { width: 65px; height: 85px; } }
            `}</style>

            <div className="deck-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '1.4rem' }}>🃏 CURRENT LOADOUT</h2>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => setShowSavedDecks(!showSavedDecks)} className="glass-panel" style={{ border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold' }}>💾 LOAD ({savedDecks.length})</button>
                        <button onClick={() => setIsSaveModalOpen(true)} className="premium-button" style={{ padding: '10px 20px' }}>SAVE DECK</button>
                    </div>
                </div>

                {showSavedDecks && (
                    <div className="glass-panel" style={{ padding: '15px', borderRadius: '20px', marginBottom: '20px', display: 'flex', gap: '10px', overflowX: 'auto' }}>
                        {savedDecks.map(deck => (
                            <div key={deck._id} onClick={() => { setDeckSlots(deck.cards); setShowSavedDecks(false); updateActiveDeck(deck.cards); }} style={{ minWidth: '120px', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', cursor: 'pointer', textAlign: 'center' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>{deck.name}</div>
                                <button onClick={(e) => handleDeleteDeck(deck._id, e)} style={{ background: 'none', border: 'none', color: 'var(--color-danger)', fontSize: '0.9rem', marginTop: '5px' }}>🗑️</button>
                            </div>
                        ))}
                        {savedDecks.length === 0 && <p style={{ opacity: 0.5 }}>No saved decks.</p>}
                    </div>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center' }}>
                    {deckSlots.map((cardId, i) => (
                        <div key={i} onDragOver={e => e.preventDefault()} onDrop={e => handleDrop(e, i)} className="slot stone-slot" style={{ border: i >= 6 ? '2px solid var(--color-accent)' : '2px solid rgba(255,255,255,0.2)' }}>
                            <Card cardId={cardId} isEvolution={i >= 6} isInDeck={true} onClick={() => removeCard(i)} />
                            {!cardId && (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2, fontSize: '2rem' }}>
                                    {i >= 6 ? '⭐' : '+'}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="deck-section" style={{ flex: 1, overflowY: 'auto' }}>
                <h2 style={{ fontSize: '1.2rem', opacity: 0.6, marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.5rem' }}>📦</span> COLLECTION
                </h2>
                {Object.entries(groupedCards).map(([cat, cards]) => (
                    <div key={cat} style={{ marginBottom: '30px' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: '900', color: 'rgba(255,255,255,0.3)', letterSpacing: '2px', marginBottom: '15px', paddingLeft: '5px' }}>{cat.toUpperCase()}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(85px, 1fr))', gap: '15px' }}>
                            {cards.map(cardId => (
                                <div key={cardId} className="slot" style={{ opacity: deckSlots.includes(cardId) ? 0.3 : 1 }}>
                                    <Card cardId={cardId} isInDeck={false} onDragStart={e => handleDragStart(e, cardId)} />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {isSaveModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="game-card" style={{ maxWidth: '400px', width: '90%', padding: '40px' }}>
                        <h2 style={{ marginBottom: '20px' }}>SAVE DECK</h2>
                        <input value={newDeckName} onChange={e => setNewDeckName(e.target.value)} placeholder="Enter deck name..." style={{ width: '100%', padding: '15px', borderRadius: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '1rem', marginBottom: '25px', boxSizing: 'border-box' }} />
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button onClick={handleSaveDeck} className="premium-button" style={{ flex: 1, padding: '15px' }}>{isLoading ? 'SAVING...' : 'SAVE'}</button>
                            <button onClick={() => setIsSaveModalOpen(false)} style={{ flex: 1, background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '12px' }}>CANCEL</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
