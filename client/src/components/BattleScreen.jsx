import React, { useState } from 'react';
import { GAME_CONFIG, UNITS } from '../game/constants';
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
import towerImg from '../assets/tower_asset.png';
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

export function BattleScreen({ gameState, playerId, onDeploy }) {
    const [selectedCard, setSelectedCard] = useState(null);
    const [targetPos, setTargetPos] = useState(null);
    const myState = gameState[playerId];
    const opponentId = playerId === 'p1' ? 'p2' : 'p1';
    const opponentState = gameState[opponentId];

    const isP1 = playerId === 'p1';

    // 터치와 마우스 이벤트 모두 처리
    const getEventCoords = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        let clientX, clientY;

        if (e.touches && e.touches[0]) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else if (e.changedTouches && e.changedTouches[0]) {
            clientX = e.changedTouches[0].clientX;
            clientY = e.changedTouches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const relativeX = (clientX - rect.left) / rect.width * GAME_CONFIG.FIELD_WIDTH;
        const relativeY = (rect.bottom - clientY) / rect.height * GAME_CONFIG.FIELD_HEIGHT;

        return { relativeX, relativeY };
    };

    const handleFieldClick = (e) => {
        if (!selectedCard) return;
        e.preventDefault();

        const { relativeX, relativeY } = getEventCoords(e);

        let gameX, gameY;
        if (isP1) {
            gameX = relativeX;
            gameY = relativeY;
        } else {
            gameX = GAME_CONFIG.FIELD_WIDTH - relativeX;
            gameY = GAME_CONFIG.FIELD_HEIGHT - relativeY;
        }

        const unitStats = UNITS[selectedCard.toUpperCase()];
        const isSpell = unitStats && unitStats.type === 'spell';

        if (isSpell) {
            onDeploy(selectedCard, gameX, gameY);
            setSelectedCard(null);
            setTargetPos(null);
        } else {
            const myY = isP1 ? gameY : (GAME_CONFIG.FIELD_HEIGHT - gameY);
            if (myY <= GAME_CONFIG.FIELD_HEIGHT * 0.45) {
                onDeploy(selectedCard, gameX, gameY);
                setSelectedCard(null);
                setTargetPos(null);
            }
        }
    };

    const handleMouseMove = (e) => {
        if (!selectedCard) {
            setTargetPos(null);
            return;
        }

        const { relativeX, relativeY } = getEventCoords(e);

        let gameX, gameY;
        if (isP1) {
            gameX = relativeX;
            gameY = relativeY;
        } else {
            gameX = GAME_CONFIG.FIELD_WIDTH - relativeX;
            gameY = GAME_CONFIG.FIELD_HEIGHT - relativeY;
        }

        setTargetPos({ x: gameX, y: gameY });
    };

    const handleMouseLeave = () => {
        setTargetPos(null);
    };

    return (
        <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#222', overflow: 'hidden', touchAction: 'none' }}>
            {/* Game Field */}
            <div
                className="game-field"
                onClick={handleFieldClick}
                onTouchEnd={handleFieldClick}
                onMouseMove={handleMouseMove}
                onTouchMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onTouchCancel={handleMouseLeave}
                style={{
                    flex: 1,
                    position: 'relative',
                    backgroundColor: '#2c3e50',
                    backgroundImage: 'linear-gradient(to bottom, #2c3e50, #34495e 40%, #27ae60 40%, #2ecc71 60%, #34495e 60%, #2c3e50)',
                    overflow: 'hidden',
                    cursor: selectedCard ? 'crosshair' : 'default',
                    boxShadow: 'inset 0 0 50px rgba(0,0,0,0.5)',
                }}
            >
                {/* Grid */}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '100%',
                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                    pointerEvents: 'none'
                }}></div>

                {/* River */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    right: 0,
                    height: '4px',
                    backgroundColor: '#3498db',
                    transform: 'translateY(-50%)',
                    boxShadow: '0 0 10px #3498db',
                    zIndex: 1,
                }}></div>

                {/* My Tower */}
                <div style={{
                    position: 'absolute',
                    left: '50%',
                    bottom: 0,
                    transform: 'translateX(-50%)',
                    width: '60px',
                    height: '60px',
                    backgroundImage: `url(${towerImg})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    zIndex: 10,
                }}>
                    <div style={{ position: 'absolute', top: -20, left: 0, right: 0, textAlign: 'center', color: 'white', fontSize: 14, fontWeight: 'bold', textShadow: '1px 1px 2px black' }}>
                        {myState.hp}
                    </div>
                </div>

                {/* Opponent Tower */}
                <div style={{
                    position: 'absolute',
                    left: '50%',
                    top: 0,
                    transform: 'translateX(-50%)',
                    width: '60px',
                    height: '60px',
                    backgroundImage: `url(${towerImg})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    filter: 'hue-rotate(180deg)',
                    zIndex: 10,
                }}>
                    <div style={{ position: 'absolute', bottom: -20, left: 0, right: 0, textAlign: 'center', color: 'white', fontSize: 14, fontWeight: 'bold', textShadow: '1px 1px 2px black' }}>
                        {opponentState.hp}
                    </div>
                </div>

                {/* Units */}
                {[...gameState.p1.units.map(u => ({ ...u, owner: 'p1' })), ...gameState.p2.units.map(u => ({ ...u, owner: 'p2' }))].map(unit => {
                    let viewX, viewY;
                    if (isP1) {
                        viewX = unit.x;
                        viewY = unit.y;
                    } else {
                        viewX = GAME_CONFIG.FIELD_WIDTH - unit.x;
                        viewY = GAME_CONFIG.FIELD_HEIGHT - unit.y;
                    }

                    const left = (viewX / GAME_CONFIG.FIELD_WIDTH) * 100;
                    const bottom = (viewY / GAME_CONFIG.FIELD_HEIGHT) * 100;
                    const isMine = unit.owner === playerId;

                    if (unit.type === 'spell') return null;

                    return (
                        <div
                            key={unit.id}
                            style={{
                                position: 'absolute',
                                left: `${left}%`,
                                bottom: `${bottom}%`,
                                width: unit.type === 'building' ? '50px' : '40px',
                                height: unit.type === 'building' ? '50px' : '40px',
                                transform: 'translate(-50%, 50%)',
                                backgroundImage: `url(${CARD_IMAGES[unit.cardId] || CARD_IMAGES[unit.id.split('_')[0]] || knightImg})`,
                                backgroundSize: 'cover',
                                borderRadius: unit.type === 'building' ? '5px' : '50%',
                                border: `3px solid ${isMine ? '#3498db' : '#e74c3c'}`,
                                transition: 'left 0.1s linear, bottom 0.1s linear',
                                zIndex: 5,
                                boxShadow: '0 4px 6px rgba(0,0,0,0.5)',
                            }}
                        >
                            <div style={{
                                position: 'absolute',
                                bottom: -5,
                                right: -5,
                                backgroundColor: '#000',
                                color: '#fff',
                                fontSize: '8px',
                                padding: '1px 3px',
                                borderRadius: '4px',
                                border: '1px solid #fff',
                            }}>Lv.1</div>

                            <div style={{
                                position: 'absolute',
                                top: -8,
                                left: 0,
                                width: '100%',
                                height: '4px',
                                backgroundColor: 'red',
                                borderRadius: '2px',
                            }}>
                                <div style={{
                                    width: `${(unit.hp / unit.maxHp) * 100}%`,
                                    height: '100%',
                                    backgroundColor: '#0f0',
                                    borderRadius: '2px',
                                }} />
                            </div>
                        </div>
                    );
                })}

                {/* Targeting Indicator */}
                {targetPos && selectedCard && (() => {
                    let viewX, viewY;
                    if (isP1) {
                        viewX = targetPos.x;
                        viewY = targetPos.y;
                    } else {
                        viewX = GAME_CONFIG.FIELD_WIDTH - targetPos.x;
                        viewY = GAME_CONFIG.FIELD_HEIGHT - targetPos.y;
                    }
                    const left = (viewX / GAME_CONFIG.FIELD_WIDTH) * 100;
                    const bottom = (viewY / GAME_CONFIG.FIELD_HEIGHT) * 100;

                    const unitStats = UNITS[selectedCard.toUpperCase()];
                    const radius = unitStats.type === 'spell' ? unitStats.radius || 2 : 1;
                    const radiusPercent = (radius / GAME_CONFIG.FIELD_WIDTH) * 100;

                    return (
                        <div style={{
                            position: 'absolute',
                            left: `${left}%`,
                            bottom: `${bottom}%`,
                            width: `${radiusPercent * 2}%`,
                            height: `${radiusPercent * 2 * (GAME_CONFIG.FIELD_WIDTH / GAME_CONFIG.FIELD_HEIGHT)}%`,
                            transform: 'translate(-50%, 50%)',
                            border: '3px dashed #f39c12',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(243, 156, 18, 0.2)',
                            pointerEvents: 'none',
                            zIndex: 15,
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: '8px',
                                height: '8px',
                                backgroundColor: '#f39c12',
                                borderRadius: '50%',
                                boxShadow: '0 0 10px #f39c12',
                            }}></div>
                        </div>
                    );
                })()}
            </div>

            {/* HUD */}
            <div style={{
                height: '150px',
                backgroundColor: '#34495e',
                display: 'flex',
                flexDirection: 'column',
                padding: '10px',
                boxShadow: '0 -4px 6px rgba(0,0,0,0.3)',
            }}>
                {/* Mana Bar */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', gap: '10px' }}>
                    <div style={{ color: '#d35400', fontWeight: 'bold', fontSize: '18px', minWidth: '90px' }}>
                        마나: {Math.floor(myState.mana)}/{GAME_CONFIG.MAX_MANA}
                    </div>
                    <div style={{ flex: 1, height: '20px', backgroundColor: '#2c3e50', borderRadius: '10px', border: '2px solid #34495e', overflow: 'hidden' }}>
                        <div style={{
                            height: '100%',
                            width: `${(myState.mana / GAME_CONFIG.MAX_MANA) * 100}%`,
                            backgroundColor: '#d35400',
                            transition: 'width 0.2s',
                            borderRadius: '8px',
                        }} />
                    </div>
                </div>

                {/* Hand */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    {myState.hand.map((cardId, idx) => {
                        const cardStats = UNITS[cardId.toUpperCase()];
                        const canAfford = myState.mana >= cardStats.cost;
                        const isSelected = selectedCard === cardId;

                        return (
                            <div
                                key={idx}
                                onClick={() => canAfford && setSelectedCard(isSelected ? null : cardId)}
                                style={{
                                    width: '80px',
                                    height: '100px',
                                    backgroundImage: `url(${CARD_IMAGES[cardId]})`,
                                    backgroundSize: 'cover',
                                    borderRadius: '8px',
                                    border: isSelected ? '4px solid #f1c40f' : canAfford ? '2px solid #2ecc71' : '2px solid #7f8c8d',
                                    cursor: canAfford ? 'pointer' : 'not-allowed',
                                    opacity: canAfford ? 1 : 0.5,
                                    position: 'relative',
                                    transition: 'all 0.2s',
                                    transform: isSelected ? 'translateY(-10px) scale(1.1)' : 'translateY(0)',
                                    boxShadow: isSelected ? '0 8px 16px rgba(241, 196, 15, 0.5)' : '0 4px 6px rgba(0,0,0,0.3)',
                                }}
                            >
                                <div style={{
                                    position: 'absolute',
                                    top: '5px',
                                    left: '5px',
                                    backgroundColor: 'rgba(0,0,0,0.8)',
                                    color: canAfford ? '#d35400' : '#95a5a6',
                                    fontWeight: 'bold',
                                    padding: '3px 7px',
                                    borderRadius: '5px',
                                    fontSize: '14px',
                                }}>
                                    {cardStats.cost}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
