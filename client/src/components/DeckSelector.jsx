import React, { useState } from 'react';
import { UNITS } from '../game/constants';

// 모든 사용 가능한 카드 목록
const ALL_CARDS = [
    'skeletons', 'goblin', 'knight', 'archer', 'bomber', 'kamikaze',
    'cannon', 'sniper', 'fireball', 'giant', 'wizard', 'goblin_hut', 'mana_collector',
    'valkyrie', 'hog_rider', 'witch', 'baby_dragon', 'barbarians'
];

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
};

export function DeckSelector({ onDeckSelected }) {
    const [selectedCards, setSelectedCards] = useState([]);

    const toggleCard = (cardId) => {
        if (selectedCards.includes(cardId)) {
            setSelectedCards(selectedCards.filter(c => c !== cardId));
        } else if (selectedCards.length < 7) {
            setSelectedCards([...selectedCards, cardId]);
        }
    };

    const handleConfirm = () => {
        if (selectedCards.length === 7) {
            onDeckSelected(selectedCards);
        }
    };

    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            backgroundColor: '#1a1a1a',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            overflow: 'auto',
            WebkitOverflowScrolling: 'touch',
        }}>
            <div style={{
                position: 'sticky',
                top: 0,
                backgroundColor: '#1a1a1a',
                width: '100%',
                padding: '20px 0',
                textAlign: 'center',
                zIndex: 10,
                borderBottom: '2px solid #333',
            }}>
                <h1 style={{ color: 'white', margin: '0 0 10px 0' }}>덱을 선택하세요</h1>
                <p style={{ color: '#aaa', margin: 0 }}>
                    {selectedCards.length}/7 카드 선택됨
                </p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                gap: '15px',
                maxWidth: '900px',
                width: '100%',
                padding: '20px',
                marginBottom: '80px',
            }}>
                {ALL_CARDS.map(cardId => {
                    const isSelected = selectedCards.includes(cardId);
                    const unitStats = UNITS[cardId.toUpperCase()];

                    return (
                        <div
                            key={cardId}
                            onClick={() => toggleCard(cardId)}
                            style={{
                                position: 'relative',
                                width: '100%',
                                paddingBottom: '125%',
                                backgroundImage: `url(${CARD_IMAGES[cardId]})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                borderRadius: '10px',
                                border: isSelected ? '4px solid #f1c40f' : '2px solid #555',
                                cursor: selectedCards.length < 7 || isSelected ? 'pointer' : 'not-allowed',
                                opacity: (!isSelected && selectedCards.length >= 7) ? 0.3 : 1,
                                transition: 'all 0.2s',
                                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                                boxShadow: isSelected ? '0 0 20px #f1c40f' : 'none',
                            }}
                        >
                            <div style={{
                                position: 'absolute',
                                top: '5px',
                                left: '5px',
                                backgroundColor: 'rgba(0,0,0,0.8)',
                                color: '#d35400',
                                fontWeight: 'bold',
                                padding: '3px 8px',
                                borderRadius: '5px',
                                fontSize: '14px',
                            }}>
                                {unitStats.cost}
                            </div>

                            {isSelected && (
                                <div style={{
                                    position: 'absolute',
                                    top: '5px',
                                    right: '5px',
                                    backgroundColor: '#f1c40f',
                                    color: 'black',
                                    borderRadius: '50%',
                                    width: '30px',
                                    height: '30px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    fontSize: '18px',
                                }}>
                                    ✓
                                </div>
                            )}

                            <div style={{
                                position: 'absolute',
                                bottom: '0',
                                left: '0',
                                right: '0',
                                backgroundColor: 'rgba(0,0,0,0.8)',
                                color: 'white',
                                padding: '5px',
                                fontSize: '11px',
                                textAlign: 'center',
                                borderBottomLeftRadius: '8px',
                                borderBottomRightRadius: '8px',
                            }}>
                                {unitStats.name}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: '#1a1a1a',
                padding: '20px',
                textAlign: 'center',
                borderTop: '2px solid #333',
                zIndex: 10,
            }}>
                <button
                    onClick={handleConfirm}
                    disabled={selectedCards.length !== 7}
                    style={{
                        padding: '15px 40px',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        backgroundColor: selectedCards.length === 7 ? '#27ae60' : '#555',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: selectedCards.length === 7 ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s',
                        boxShadow: selectedCards.length === 7 ? '0 4px 10px rgba(39, 174, 96, 0.5)' : 'none',
                    }}
                >
                    게임 시작
                </button>
            </div>
        </div>
    );
}
