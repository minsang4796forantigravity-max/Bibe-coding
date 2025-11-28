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
};

export function BattleScreen({ gameState, playerId, onDeploy }) {
    const [selectedCard, setSelectedCard] = useState(null);
    const myState = gameState[playerId];
    const opponentId = playerId === 'p1' ? 'p2' : 'p1';
    const opponentState = gameState[opponentId];

    const isP1 = playerId === 'p1';

    const handleFieldClick = (e) => {
        if (!selectedCard) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const relativeX = e.nativeEvent.offsetX / rect.width * GAME_CONFIG.FIELD_WIDTH;
        const relativeY = (rect.height - e.nativeEvent.offsetY) / rect.height * GAME_CONFIG.FIELD_HEIGHT;

        let gameX, gameY;
        if (isP1) {
            gameX = relativeX;
            gameY = relativeY;
        } else {
            gameX = GAME_CONFIG.FIELD_WIDTH - relativeX;
            gameY = GAME_CONFIG.FIELD_HEIGHT - relativeY;
        }

        // Deploy limit check (My side only)
        const myY = isP1 ? gameY : (GAME_CONFIG.FIELD_HEIGHT - gameY);
        if (myY <= GAME_CONFIG.FIELD_HEIGHT * 0.45) {
            onDeploy(selectedCard, gameX, gameY);
            setSelectedCard(null);
        }
    };

    return (
        <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#222', overflow: 'hidden' }}>
            {/* Game Field */}
            <div
                className="game-field"
                onClick={handleFieldClick}
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
                {/* Grid/Background hint */}
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

                {/* Towers */}
                {/* My Tower (Bottom) */}
                <div style={{
                    position: 'absolute',
                    left: '50%',
                    bottom: '5%',
                    transform: 'translate(-50%, 50%)',
                    width: '80px',
                    height: '80px',
                    backgroundImage: `url(${towerImg})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    zIndex: 10,
                }}>
                    <div style={{ position: 'absolute', top: -25, left: 0, right: 0, textAlign: 'center', color: 'white', fontSize: 14, fontWeight: 'bold', textShadow: '1px 1px 2px black' }}>
                        {myState.hp}
                    </div>
                </div>

                {/* Opponent Tower (Top) */}
                <div style={{
                    position: 'absolute',
                    left: '50%',
                    top: '5%',
                    transform: 'translate(-50%, -50%)',
                    width: '80px',
                    height: '80px',
                    backgroundImage: `url(${towerImg})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    filter: 'hue-rotate(180deg)',
                    zIndex: 10,
                }}>
                    <div style={{ position: 'absolute', bottom: -25, left: 0, right: 0, textAlign: 'center', color: 'white', fontSize: 14, fontWeight: 'bold', textShadow: '1px 1px 2px black' }}>
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

                    // Spell Effect (Fireball) - Temporary visual
                    if (unit.type === 'spell') return null; // Spells are instant, handled by effects (TODO)

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
                            {/* Level Badge */}
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
            </div>

            {/* HUD */}
            <div className="hud" style={{
                height: '140px',
                backgroundColor: '#1a1a1a',
                display: 'flex',
                flexDirection: 'column',
                padding: '10px',
                boxSizing: 'border-box',
                borderTop: '2px solid #444',
            }}>
                {/* Mana Bar */}
                <div style={{
                    height: '24px',
                    backgroundColor: '#000',
                    marginBottom: '10px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    position: 'relative',
                    border: '1px solid #555',
                }}>
                    <div style={{
                        width: `${(myState.mana / GAME_CONFIG.MAX_MANA) * 100}%`,
                        height: '100%',
                        backgroundColor: '#9b59b6', // Elixir color
                        transition: 'width 0.1s linear',
                        boxShadow: '0 0 10px #9b59b6',
                    }} />
                    <span style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        textShadow: '1px 1px 1px black',
                    }}>{Math.floor(myState.mana)}</span>
                </div>

                {/* Hand */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '15px',
                    flex: 1,
                }}>
                    {myState.hand.map((cardId, index) => {
                        const unitStats = UNITS[cardId.toUpperCase()];
                        const canAfford = myState.mana >= unitStats.cost;
                        const isSelected = selectedCard === cardId;

                        return (
                            <div
                                key={index}
                                onClick={() => canAfford && setSelectedCard(cardId)}
                                style={{
                                    width: '70px',
                                    height: '90px',
                                    backgroundColor: isSelected ? '#f1c40f' : (canAfford ? '#333' : '#111'),
                                    backgroundImage: `url(${CARD_IMAGES[cardId]})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    borderRadius: '8px',
                                    border: isSelected ? '3px solid white' : (canAfford ? '2px solid #555' : '2px solid #222'),
                                    opacity: canAfford ? 1 : 0.4,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'flex-end',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    transform: isSelected ? 'translateY(-10px)' : 'none',
                                    transition: 'transform 0.1s',
                                }}
                            >
                                <div style={{
                                    backgroundColor: 'rgba(0,0,0,0.8)',
                                    color: '#d35400',
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    borderTopLeftRadius: '5px',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    padding: '2px 6px',
                                    borderBottomRightRadius: '5px',
                                }}>
                                    {unitStats.cost}
                                </div>
                            </div>
                        );
                    })}

                    {/* Next Card */}
                    <div style={{
                        width: '50px',
                        height: '60px',
                        marginLeft: '10px',
                        opacity: 0.6,
                        backgroundImage: `url(${CARD_IMAGES[myState.nextCard]})`,
                        backgroundSize: 'cover',
                        borderRadius: '5px',
                        alignSelf: 'center',
                        position: 'relative',
                        border: '1px solid #444',
                    }}>
                        <div style={{
                            fontSize: '10px',
                            backgroundColor: 'black',
                            color: 'white',
                            position: 'absolute',
                            top: -15,
                            width: '100%',
                            textAlign: 'center'
                        }}>Next</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
