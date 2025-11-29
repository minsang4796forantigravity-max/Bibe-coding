import React, { useState } from 'react'; // Rebuild trigger
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

// 모든 사용 가능한 카드 목록
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
    const [selectedCards, setSelectedCards] = useState([]);
    const [evolutionCards, setEvolutionCards] = useState([]);
    const [phase, setPhase] = useState(1); // 1: 카드 선택, 2: 진화 선택

    const toggleCard = (cardId) => {
        if (phase === 1) {
            // Phase 1: 일반 카드 선택 (7장)
            if (selectedCards.includes(cardId)) {
                setSelectedCards(selectedCards.filter(c => c !== cardId));
            } else if (selectedCards.length < 7) {
                setSelectedCards([...selectedCards, cardId]);
            }
        } else {
            // Phase 2: 진화 카드 선택 (2장)
            if (evolutionCards.includes(cardId)) {
                setEvolutionCards(evolutionCards.filter(c => c !== cardId));
            } else if (evolutionCards.length < 2) {
                setEvolutionCards([...evolutionCards, cardId]);
            }
        }
    };

    const handleNext = () => {
        if (selectedCards.length === 7) {
            setPhase(2);
        }
    };

    const handleBack = () => {
        setPhase(1);
        setEvolutionCards([]);
    };

    const handleConfirm = () => {
        if (selectedCards.length === 7 && evolutionCards.length === 2) {
            // 덱 구조: [card1, ..., card7, evo1, evo2]
            const finalDeck = [...selectedCards, ...evolutionCards];
            onDeckSelected(finalDeck);
        }
    };

    const cardsToShow = phase === 1 ? ALL_CARDS : selectedCards;

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
                <h1 style={{ color: 'white', margin: '0 0 10px 0' }}>
                    {phase === 1 ? '단계 1: 덱 카드 선택' : '단계 2: 진화 카드 선택'}
                </h1>
                <p style={{ color: '#aaa', margin: 0 }}>
                    {phase === 1
                        ? `${selectedCards.length}/7 카드 선택됨`
                        : `${evolutionCards.length}/2 진화 카드 선택됨`
                    }
                </p>
                {phase === 2 && (
                    <p style={{ color: '#f39c12', fontSize: '14px', margin: '5px 0 0 0' }}>
                        ⭐ 선택한 카드가 강화된 능력치로 배치됩니다
                    </p>
                )}
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
                {cardsToShow.map(cardId => {
                    const isSelected = phase === 1
                        ? selectedCards.includes(cardId)
                        : evolutionCards.includes(cardId);
                    const unitStats = UNITS[cardId.toUpperCase()];

                    return (
                        <div
                            key={cardId}
                            onClick={() => toggleCard(cardId)}
                            className={phase === 2 && isSelected ? 'deck-evolution-card' : ''}
                            style={{
                                position: 'relative',
                                width: '100%',
                                paddingBottom: '125%',
                                backgroundImage: `url(${CARD_IMAGES[cardId]})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                borderRadius: '10px',
                                border: isSelected
                                    ? (phase === 2 ? '4px solid #f39c12' : '4px solid #f1c40f')
                                    : '2px solid #555',
                                cursor: (phase === 1 && selectedCards.length < 7) ||
                                    (phase === 2 && evolutionCards.length < 2) ||
                                    isSelected ? 'pointer' : 'not-allowed',
                                opacity: (!isSelected &&
                                    ((phase === 1 && selectedCards.length >= 7) ||
                                        (phase === 2 && evolutionCards.length >= 2))) ? 0.3 : 1,
                                transition: 'all 0.2s',
                                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                                boxShadow: isSelected
                                    ? (phase === 2 ? '0 0 25px #f39c12' : '0 0 20px #f1c40f')
                                    : 'none',
                            }}
                        >
                            {/* 진화 파티클 효과 (Phase 2에서만) */}
                            {phase === 2 && isSelected && (
                                <div className="evolution-particles">
                                    <div className="particle"></div>
                                    <div className="particle"></div>
                                    <div className="particle"></div>
                                    <div className="particle"></div>
                                    <div className="particle"></div>
                                </div>
                            )}

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
                                <div
                                    className={phase === 2 ? 'evolution-star' : ''}
                                    style={{
                                        position: 'absolute',
                                        top: '5px',
                                        right: '5px',
                                        backgroundColor: phase === 2 ? '#f39c12' : '#f1c40f',
                                        color: 'black',
                                        borderRadius: '50%',
                                        width: '30px',
                                        height: '30px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 'bold',
                                        fontSize: phase === 2 ? '16px' : '18px',
                                    }}>
                                    {phase === 2 ? '⭐' : '✓'}
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
                display: 'flex',
                gap: '10px',
                justifyContent: 'center',
            }}>
                {phase === 2 && (
                    <button
                        onClick={handleBack}
                        style={{
                            padding: '15px 30px',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            backgroundColor: '#555',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                    >
                        ← 이전
                    </button>
                )}
                {phase === 1 ? (
                    <button
                        onClick={handleNext}
                        disabled={selectedCards.length !== 7}
                        style={{
                            padding: '15px 40px',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            backgroundColor: selectedCards.length === 7 ? '#3498db' : '#555',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: selectedCards.length === 7 ? 'pointer' : 'not-allowed',
                            transition: 'all 0.2s',
                            boxShadow: selectedCards.length === 7 ? '0 4px 10px rgba(52, 152, 219, 0.5)' : 'none',
                        }}
                    >
                        다음: 진화 선택 →
                    </button>
                ) : (
                    <button
                        onClick={handleConfirm}
                        disabled={evolutionCards.length !== 2}
                        style={{
                            padding: '15px 40px',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            backgroundColor: evolutionCards.length === 2 ? '#27ae60' : '#555',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: evolutionCards.length === 2 ? 'pointer' : 'not-allowed',
                            transition: 'all 0.2s',
                            boxShadow: evolutionCards.length === 2 ? '0 4px 10px rgba(39, 174, 96, 0.5)' : 'none',
                        }}
                    >
                        게임 시작
                    </button>
                )}
            </div>
        </div>
    );
}
