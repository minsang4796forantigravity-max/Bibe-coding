import React, { useState } from 'react';
import { UNITS } from '../game/constants';
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

const ALL_CARDS = [
    'skeletons', 'goblin', 'knight', 'archer', 'bomber', 'kamikaze',
    'cannon', 'sniper', 'fireball', 'giant', 'wizard', 'goblin_hut', 'mana_collector',
    'valkyrie', 'hog_rider', 'witch', 'baby_dragon', 'barbarians',
    'tornado', 'rage', 'heal', 'balloon',
    'log', 'freeze', 'electro_wizard', 'goblin_barrel'
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
};

export function DeckSelector({ onDeckSelected }) {
    // 8 slots: [0-5] regular cards, [6-7] evolution cards
    const [deckSlots, setDeckSlots] = useState(Array(8).fill(null));
    const [draggedCard, setDraggedCard] = useState(null);

    // Sort cards by cost
    const sortedCards = [...ALL_CARDS].sort((a, b) => {
        const costA = UNITS[a.toUpperCase()]?.cost || 0;
        const costB = UNITS[b.toUpperCase()]?.cost || 0;
        return costA - costB;
    });

    // Group cards by Type
    const cardsByType = {
        'Melee': [],
        'Ranged': [],
        'Air': [],
        'Building': [],
        'Spell': []
    };

    sortedCards.forEach(card => {
        const stats = UNITS[card.toUpperCase()];
        if (!stats) return;

        if (stats.type === 'spell') {
            cardsByType['Spell'].push(card);
        } else if (stats.type === 'building') {
            cardsByType['Building'].push(card);
        } else if (stats.type === 'flying') {
            cardsByType['Air'].push(card);
        } else if (stats.range >= 2) {
            cardsByType['Ranged'].push(card);
        } else {
            cardsByType['Melee'].push(card);
        }
    });

    const handleDragStart = (e, cardId) => {
        setDraggedCard(cardId);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', cardId); // Required for Firefox
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDropToSlot = (e, slotIndex) => {
        e.preventDefault();
        if (!draggedCard) return;

        // Check if card already in deck
        if (deckSlots.includes(draggedCard)) return;

        const newSlots = [...deckSlots];
        newSlots[slotIndex] = draggedCard;
        setDeckSlots(newSlots);
        setDraggedCard(null);
    };

    const handleClickSlot = (slotIndex) => {
        if (deckSlots[slotIndex]) {
            const newSlots = [...deckSlots];
            newSlots[slotIndex] = null;
            setDeckSlots(newSlots);
        }
    };

    const handleConfirm = () => {
        const regularCards = deckSlots.slice(0, 6).filter(c => c !== null);
        const evolutionCards = deckSlots.slice(6, 8).filter(c => c !== null);

        if (regularCards.length === 6 && evolutionCards.length === 2) {
            onDeckSelected([...regularCards, ...evolutionCards]);
        }
    };

    const regularFilled = deckSlots.slice(0, 6).filter(c => c !== null).length;
    const evolutionFilled = deckSlots.slice(6, 8).filter(c => c !== null).length;
    const isComplete = regularFilled === 6 && evolutionFilled === 2;

    return (
        <div style={{
            width: '100%',
            maxWidth: '1000px', // Limit max width
            margin: '0 auto',   // Center horizontally
            height: '100vh',
            backgroundColor: '#1a1a1a',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden', // Prevent double scrollbars
        }}>
            {/* Header */}
            <div style={{
                padding: '10px', // Reduced padding
                textAlign: 'center',
                borderBottom: '2px solid #333',
                flexShrink: 0,
            }}>
                <h2 style={{ color: 'white', margin: '0 0 5px 0', fontSize: '1.2rem' }}>덱 구성</h2>
                <p style={{ color: '#aaa', margin: 0, fontSize: '0.9rem' }}>
                    일반: {regularFilled}/6 | 진화: {evolutionFilled}/2
                </p>
            </div>

            {/* Deck Slots */}
            <div style={{
                padding: '10px', // Reduced padding
                backgroundColor: '#222',
                flexShrink: 0,
            }}>
                {/* Regular Slots */}
                <div style={{
                    display: 'flex',
                    gap: '8px', // Reduced gap
                    marginBottom: '10px',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                }}>
                    {deckSlots.slice(0, 6).map((cardId, index) => (
                        <div
                            key={index}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDropToSlot(e, index)}
                            onClick={() => handleClickSlot(index)}
                            style={{
                                width: '60px', // Reduced size
                                height: '75px',
                                border: '2px dashed #555',
                                borderRadius: '6px',
                                backgroundColor: cardId ? '#333' : '#1a1a1a',
                                backgroundImage: cardId ? `url(${CARD_IMAGES[cardId]})` : 'none',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                cursor: cardId ? 'pointer' : 'default',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#666',
                                fontSize: '10px',
                                position: 'relative',
                                transition: 'all 0.2s',
                            }}
                        >
                            {!cardId && (index + 1)}
                            {cardId && (
                                <div style={{
                                    position: 'absolute',
                                    top: '2px',
                                    left: '2px',
                                    backgroundColor: 'rgba(0,0,0,0.8)',
                                    color: '#d35400',
                                    padding: '1px 4px',
                                    borderRadius: '3px',
                                    fontSize: '9px',
                                    fontWeight: 'bold',
                                }}>
                                    {UNITS[cardId.toUpperCase()]?.cost}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Evolution Slots */}
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <span style={{ color: '#f39c12', fontSize: '0.9rem', marginRight: '10px', fontWeight: 'bold' }}>⭐ 진화</span>
                    {deckSlots.slice(6, 8).map((cardId, index) => (
                        <div
                            key={index + 6}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDropToSlot(e, index + 6)}
                            onClick={() => handleClickSlot(index + 6)}
                            className={cardId ? 'deck-evolution-card' : ''}
                            style={{
                                width: '60px', // Reduced size
                                height: '75px',
                                border: '2px dashed #f39c12',
                                borderRadius: '6px',
                                backgroundColor: cardId ? '#333' : '#1a1a1a',
                                backgroundImage: cardId ? `url(${CARD_IMAGES[cardId]})` : 'none',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                cursor: cardId ? 'pointer' : 'default',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#666',
                                fontSize: '10px',
                                position: 'relative',
                                boxShadow: cardId ? '0 0 10px #f39c12' : 'none',
                            }}
                        >
                            {!cardId && `E${index + 1}`}
                            {cardId && (
                                <div style={{
                                    position: 'absolute',
                                    top: '2px',
                                    right: '2px',
                                    backgroundColor: '#f39c12',
                                    color: 'black',
                                    borderRadius: '50%',
                                    width: '15px',
                                    height: '15px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    fontSize: '10px',
                                }}>
                                    ⭐
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Available Cards */}
            <div style={{
                flex: 1,
                padding: '10px', // Reduced padding
                overflowY: 'auto',
                backgroundColor: '#111',
            }}>
                {Object.keys(cardsByType).map(type => (
                    <div key={type} style={{ marginBottom: '15px' }}>
                        <h4 style={{ color: '#888', fontSize: '12px', marginBottom: '5px', borderBottom: '1px solid #333', paddingBottom: '2px' }}>
                            {type}
                        </h4>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', // Reduced min size
                            gap: '8px', // Reduced gap
                        }}>
                            {cardsByType[type].map(cardId => {
                                const unitStats = UNITS[cardId.toUpperCase()];
                                const isInDeck = deckSlots.includes(cardId);

                                return (
                                    <div
                                        key={cardId}
                                        draggable={!isInDeck}
                                        onDragStart={(e) => handleDragStart(e, cardId)}
                                        style={{
                                            position: 'relative',
                                            width: '100%',
                                            paddingBottom: '125%',
                                            backgroundImage: `url(${CARD_IMAGES[cardId]})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            borderRadius: '8px',
                                            border: isInDeck ? '2px solid #555' : '2px solid #444',
                                            cursor: isInDeck ? 'not-allowed' : 'grab',
                                            opacity: isInDeck ? 0.3 : 1,
                                            transition: 'all 0.2s',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isInDeck) e.currentTarget.style.transform = 'scale(1.05)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'scale(1)';
                                        }}
                                    >
                                        <div style={{
                                            position: 'absolute',
                                            top: '3px',
                                            left: '3px',
                                            backgroundColor: 'rgba(0,0,0,0.8)',
                                            color: '#d35400',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            fontSize: '11px',
                                            fontWeight: 'bold',
                                        }}>
                                            {unitStats?.cost}
                                        </div>
                                        <div style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            backgroundColor: 'rgba(0,0,0,0.8)',
                                            color: 'white',
                                            padding: '4px',
                                            fontSize: '10px',
                                            textAlign: 'center',
                                            borderBottomLeftRadius: '6px',
                                            borderBottomRightRadius: '6px',
                                        }}>
                                            {unitStats?.name}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Confirm Button */}
            <div style={{
                position: 'sticky',
                bottom: 0,
                backgroundColor: '#1a1a1a',
                padding: '20px',
                borderTop: '2px solid #333',
                textAlign: 'center',
            }}>
                <button
                    onClick={handleConfirm}
                    disabled={!isComplete}
                    style={{
                        padding: '15px 40px',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        backgroundColor: isComplete ? '#27ae60' : '#555',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: isComplete ? 'pointer' : 'not-allowed',
                        boxShadow: isComplete ? '0 4px 10px rgba(39, 174, 96, 0.5)' : 'none',
                    }}
                >
                    게임 시작
                </button>
            </div>
        </div>
    );
}
