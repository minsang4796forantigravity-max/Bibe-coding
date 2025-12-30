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

const ALL_CARDS = [
    'skeletons', 'goblin', 'knight', 'archer', 'bomber', 'kamikaze',
    'cannon', 'sniper', 'fireball', 'giant', 'wizard', 'goblin_hut', 'mana_collector',
    'valkyrie', 'hog_rider', 'witch', 'baby_dragon', 'barbarians',
    'tornado', 'rage', 'heal', 'balloon',
    'log', 'freeze', 'electro_wizard', 'goblin_barrel', 'air_defense'
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
};

export function DeckSelector({ onDeckSelected, username }) {
    // 8 slots: [0-5] regular cards, [6-7] evolution cards
    const [deckSlots, setDeckSlots] = useState(Array(8).fill(null));
    const [draggedCard, setDraggedCard] = useState(null);
    const [savedDecks, setSavedDecks] = useState([]);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [newDeckName, setNewDeckName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Fetch saved decks on mount
    useEffect(() => {
        if (username) {
            console.log('DeckSelector: Fetching saved decks for user:', username);
            fetchSavedDecks();
        }
    }, [username]);

    const fetchSavedDecks = async () => {
        try {
            console.log('Fetching decks from:', `${API_URL}/api/auth/decks/${username}`);
            const response = await fetch(`${API_URL}/api/auth/decks/${username}`);
            console.log('Response status:', response.status, response.ok);

            if (response.ok) {
                const data = await response.json();
                console.log('Received deck data:', data);
                console.log('Data type:', typeof data, 'Is array:', Array.isArray(data));
                console.log('Data length:', data?.length);

                if (Array.isArray(data)) {
                    setSavedDecks(data);
                    console.log('Set savedDecks to:', data);
                } else {
                    console.error('Data is not an array:', data);
                    setSavedDecks([]);
                }
            } else {
                const errorText = await response.text();
                console.error('Failed to fetch decks. Status:', response.status, 'Error:', errorText);
                setSavedDecks([]);
            }
        } catch (error) {
            console.error('Error fetching saved decks:', error);
            setSavedDecks([]);
        }
    };

    const handleSaveDeck = async () => {
        if (!newDeckName.trim()) {
            alert('덱 이름을 입력해주세요.');
            return;
        }

        // Filter out nulls to get card IDs
        const cards = deckSlots.filter(c => c !== null);
        console.log('Saving deck. Name:', newDeckName, 'Cards:', cards);

        if (cards.length !== 8) {
            alert('덱을 모두 채워주세요 (일반 6장 + 진화 2장).');
            return;
        }

        setIsLoading(true);
        try {
            const requestBody = {
                username,
                deckName: newDeckName,
                cards
            };
            console.log('Sending save request to:', `${API_URL}/api/auth/decks/save`);
            console.log('Request body:', requestBody);

            const response = await fetch(`${API_URL}/api/auth/decks/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            console.log('Save response status:', response.status, response.ok);

            if (response.ok) {
                const updatedDecks = await response.json();
                console.log('Deck saved successfully! Updated decks:', updatedDecks);
                setSavedDecks(updatedDecks);
                setIsSaveModalOpen(false);
                setNewDeckName('');
                alert('덱이 저장되었습니다!');

                // Re-fetch to verify save
                console.log('Re-fetching to verify save...');
                await fetchSavedDecks();
            } else {
                const errorData = await response.text();
                console.error('Failed to save deck. Status:', response.status, 'Error:', errorData);
                alert('덱 저장에 실패했습니다: ' + errorData);
            }
        } catch (error) {
            console.error('Error saving deck:', error);
            alert('오류가 발생했습니다: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoadDeck = (deck) => {
        if (deck.cards.length !== 8) {
            alert('유효하지 않은 덱 데이터입니다.');
            return;
        }
        setDeckSlots(deck.cards);
    };

    const handleDeleteDeck = async (deckId, e) => {
        e.stopPropagation(); // Prevent loading when clicking delete
        if (!window.confirm('정말 이 덱을 삭제하시겠습니까?')) return;

        try {
            const response = await fetch(`${API_URL}/api/auth/decks/${username}/${deckId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                const updatedDecks = await response.json();
                setSavedDecks(updatedDecks);
            } else {
                alert('덱 삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('Error deleting deck:', error);
        }
    };

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
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <h2 style={{ color: 'white', margin: '0', fontSize: '1.2rem' }}>덱 구성</h2>

                {/* Saved Decks Controls */}
                {username && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div className="dropdown">
                            <button
                                className="load-deck-btn"
                                onClick={() => {
                                    const dropdown = document.getElementById('saved-decks-list');
                                    // Use style.display instead of classList for inline styles
                                    if (dropdown.style.display === 'none' || dropdown.style.display === '') {
                                        dropdown.style.display = 'block';
                                    } else {
                                        dropdown.style.display = 'none';
                                    }
                                    console.log('Dropdown toggled. SavedDecks:', savedDecks);
                                }}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: '#3498db',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    fontSize: '14px',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                저장된 덱 불러오기 ({savedDecks.length})
                            </button>
                            <div
                                id="saved-decks-list"
                                className="dropdown-content"
                                style={{
                                    display: 'none',
                                    position: 'absolute',
                                    backgroundColor: '#2c3e50',
                                    minWidth: '200px',
                                    boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
                                    borderRadius: '8px',
                                    zIndex: 1000,
                                    marginTop: '5px'
                                }}
                            >
                                {savedDecks.length === 0 ? (
                                    <div style={{ padding: '10px', color: '#888', fontSize: '0.9rem' }}>저장된 덱이 없습니다. (디버그: API 응답 확인 필요)</div>
                                ) : (
                                    savedDecks.map(deck => (
                                        <div key={deck._id} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '8px',
                                            borderBottom: '1px solid #333',
                                            cursor: 'pointer'
                                        }}
                                            onClick={() => {
                                                handleLoadDeck(deck);
                                                document.getElementById('saved-decks-list').style.display = 'none';
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            <span style={{ color: 'white', fontSize: '0.9rem' }}>{deck.name}</span>
                                            <button
                                                onClick={(e) => handleDeleteDeck(deck._id, e)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#e74c3c',
                                                    cursor: 'pointer',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => setIsSaveModalOpen(true)}
                            disabled={!isComplete}
                            style={{
                                padding: '5px 10px',
                                backgroundColor: isComplete ? '#3498db' : '#555',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: isComplete ? 'pointer' : 'not-allowed'
                            }}
                        >
                            현재 덱 저장
                        </button>
                    </div>
                )}

                <p style={{ color: '#aaa', margin: 0, fontSize: '0.9rem' }}>
                    일반: {regularFilled}/6 | 진화: {evolutionFilled}/2
                </p>
            </div>

            {/* Save Deck Modal */}
            {isSaveModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: '#222',
                        padding: '20px',
                        borderRadius: '8px',
                        width: '300px',
                        border: '1px solid #444'
                    }}>
                        <h3 style={{ color: 'white', marginTop: 0 }}>덱 저장</h3>
                        <input
                            type="text"
                            placeholder="덱 이름 입력"
                            value={newDeckName}
                            onChange={(e) => setNewDeckName(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px',
                                marginBottom: '15px',
                                backgroundColor: '#333',
                                border: '1px solid #555',
                                color: 'white',
                                borderRadius: '4px'
                            }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button
                                onClick={() => setIsSaveModalOpen(false)}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#555',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                취소
                            </button>
                            <button
                                onClick={handleSaveDeck}
                                disabled={isLoading}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#2ecc71',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                {isLoading ? '저장 중...' : '저장'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
