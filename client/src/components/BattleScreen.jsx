import React, { useState, useEffect, useRef } from 'react';
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
import tornadoImg from '../assets/tornado_card.png';
import rageImg from '../assets/rage_card.png';
import healImg from '../assets/heal_card.png';
import balloonImg from '../assets/balloon_card.png';
import logImg from '../assets/log_card.png';
import freezeImg from '../assets/freeze_card.png';
import electroWizardImg from '../assets/electro_wizard_card.png';
import goblinBarrelImg from '../assets/goblin_barrel_card.png';

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

export function BattleScreen({ gameState, playerId, onDeploy }) {
    const [dragCard, setDragCard] = useState(null);
    const [dragPos, setDragPos] = useState(null); // { x, y } screen coords
    const fieldRef = useRef(null);

    const myState = gameState[playerId];
    const opponentId = playerId === 'p1' ? 'p2' : 'p1';
    const opponentState = gameState[opponentId];
    const isP1 = playerId === 'p1';

    const getClientCoords = (e) => {
        if (e.touches && e.touches[0]) {
            return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
        } else if (e.changedTouches && e.changedTouches[0]) {
            return { clientX: e.changedTouches[0].clientX, clientY: e.changedTouches[0].clientY };
        }
        return { clientX: e.clientX, clientY: e.clientY };
    };

    const handleDragStart = (e, cardId) => {
        const cardStats = UNITS[cardId.toUpperCase()];
        if (myState.mana < cardStats.cost) return;

        // Prevent default to stop scrolling on mobile
        // e.preventDefault(); 

        setDragCard(cardId);
        const { clientX, clientY } = getClientCoords(e);
        setDragPos({ x: clientX, y: clientY });
    };

    const handleDragMove = (e) => {
        if (!dragCard) return;
        const { clientX, clientY } = getClientCoords(e);
        setDragPos({ x: clientX, y: clientY });
    };

    const handleDragEnd = (e) => {
        if (!dragCard) return;

        const { clientX, clientY } = getClientCoords(e);

        if (fieldRef.current) {
            const rect = fieldRef.current.getBoundingClientRect();

            // Check if dropped inside field
            if (
                clientX >= rect.left &&
                clientX <= rect.right &&
                clientY >= rect.top &&
                clientY <= rect.bottom
            ) {
                const relativeX = (clientX - rect.left) / rect.width * GAME_CONFIG.FIELD_WIDTH;
                const relativeY = (rect.bottom - clientY) / rect.height * GAME_CONFIG.FIELD_HEIGHT;

                let gameX, gameY;
                if (isP1) {
                    gameX = relativeX;
                    gameY = relativeY;
                } else {
                    gameX = GAME_CONFIG.FIELD_WIDTH - relativeX;
                    gameY = GAME_CONFIG.FIELD_HEIGHT - relativeY;
                }

                const unitStats = UNITS[dragCard.toUpperCase()];
                const isSpell = unitStats.type === 'spell';
                const myY = isP1 ? gameY : (GAME_CONFIG.FIELD_HEIGHT - gameY);

                if (isSpell || myY <= GAME_CONFIG.FIELD_HEIGHT * 0.45) {
                    onDeploy(dragCard, gameX, gameY);
                }
            }
        }

        setDragCard(null);
        setDragPos(null);
    };

    // Global event listeners for drag move/end
    useEffect(() => {
        if (dragCard) {
            window.addEventListener('mousemove', handleDragMove);
            window.addEventListener('mouseup', handleDragEnd);
            window.addEventListener('touchmove', handleDragMove, { passive: false });
            window.addEventListener('touchend', handleDragEnd);
        } else {
            window.removeEventListener('mousemove', handleDragMove);
            window.removeEventListener('mouseup', handleDragEnd);
            window.removeEventListener('touchmove', handleDragMove);
            window.removeEventListener('touchend', handleDragEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleDragMove);
            window.removeEventListener('mouseup', handleDragEnd);
            window.removeEventListener('touchmove', handleDragMove);
            window.removeEventListener('touchend', handleDragEnd);
        };
    }, [dragCard]);

    return (
        <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#222', overflow: 'hidden', touchAction: 'none' }}>
            {/* Game Field */}
            <div
                ref={fieldRef}
                className="game-field"
                style={{
                    flex: 1,
                    position: 'relative',
                    backgroundColor: '#2c3e50',
                    backgroundImage: 'linear-gradient(to bottom, #2c3e50, #34495e 40%, #27ae60 40%, #2ecc71 60%, #34495e 60%, #2c3e50)',
                    overflow: 'hidden',
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

                {/* Active Spells */}
                {gameState.activeSpells && gameState.activeSpells.map((spell, idx) => {
                    let viewX, viewY;
                    if (isP1) {
                        viewX = spell.x;
                        viewY = spell.y;
                    } else {
                        viewX = GAME_CONFIG.FIELD_WIDTH - spell.x;
                        viewY = GAME_CONFIG.FIELD_HEIGHT - spell.y;
                    }

                    const left = (viewX / GAME_CONFIG.FIELD_WIDTH) * 100;
                    const bottom = (viewY / GAME_CONFIG.FIELD_HEIGHT) * 100;
                    const radiusPercent = (spell.radius / GAME_CONFIG.FIELD_WIDTH) * 100;

                    let color = 'rgba(255, 255, 255, 0.3)';
                    if (spell.id === 'tornado') color = 'rgba(100, 100, 255, 0.4)';
                    if (spell.id === 'rage') color = 'rgba(200, 0, 255, 0.4)';
                    if (spell.id === 'heal') color = 'rgba(255, 255, 0, 0.4)';
                    if (spell.id === 'freeze') color = 'rgba(0, 255, 255, 0.4)';

                    return (
                        <div key={`spell_${idx}`} style={{
                            position: 'absolute',
                            left: `${left}%`,
                            bottom: `${bottom}%`,
                            width: `${radiusPercent * 2}%`,
                            height: `${radiusPercent * 2 * (GAME_CONFIG.FIELD_WIDTH / GAME_CONFIG.FIELD_HEIGHT)}%`,
                            transform: 'translate(-50%, 50%)',
                            backgroundColor: color,
                            borderRadius: '50%',
                            pointerEvents: 'none',
                            zIndex: 4,
                            border: '2px solid rgba(255,255,255,0.5)',
                            boxShadow: `0 0 20px ${color}`,
                        }} />
                    );
                })}

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

                    // Spell Effects
                    let spellEffectStyle = {};
                    if (gameState.activeSpells) {
                        gameState.activeSpells.forEach(spell => {
                            if (spell.ownerId === unit.owner && (spell.id === 'rage' || spell.id === 'heal')) {
                                const dist = Math.hypot(unit.x - spell.x, unit.y - spell.y);
                                if (dist <= spell.radius) {
                                    if (spell.id === 'rage') {
                                        spellEffectStyle.filter = 'sepia(1) hue-rotate(250deg) saturate(5)';
                                        spellEffectStyle.boxShadow = '0 0 15px #9b59b6';
                                    } else if (spell.id === 'heal') {
                                        spellEffectStyle.filter = 'sepia(1) hue-rotate(50deg) saturate(5)';
                                        spellEffectStyle.boxShadow = '0 0 15px #f1c40f';
                                    }
                                }
                            }

                        });
                    }

                    // Status Effects (Frozen/Stunned)
                    // Check if unit is frozen or stunned (server sends timestamps)
                    const now = Date.now(); // Approximate, server time is authority but visual can use local
                    // Note: Server sends absolute timestamps. We assume clocks are roughly synced or just check existence.
                    // Actually, let's just check if the property exists and is in future.
                    // Since we don't have exact server time offset, we'll trust the timestamp is close enough.
                    if (unit.frozenUntil && unit.frozenUntil > Date.now()) {
                        spellEffectStyle.filter = (spellEffectStyle.filter || '') + ' hue-rotate(180deg) saturate(2) brightness(1.5)';
                        spellEffectStyle.boxShadow = '0 0 15px #00ffff';
                        spellEffectStyle.borderColor = '#00ffff';
                    }
                    if (unit.stunnedUntil && unit.stunnedUntil > Date.now()) {
                        spellEffectStyle.filter = (spellEffectStyle.filter || '') + ' brightness(2) contrast(1.5)';
                        spellEffectStyle.boxShadow = '0 0 15px #f1c40f';
                    }

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
                                ...spellEffectStyle
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

                {/* Projectiles */}
                {gameState.projectiles && gameState.projectiles.map((proj, idx) => {
                    let viewX, viewY;
                    if (isP1) {
                        viewX = proj.x;
                        viewY = proj.y;
                    } else {
                        viewX = GAME_CONFIG.FIELD_WIDTH - proj.x;
                        viewY = GAME_CONFIG.FIELD_HEIGHT - proj.y;
                    }

                    const left = (viewX / GAME_CONFIG.FIELD_WIDTH) * 100;
                    const bottom = (viewY / GAME_CONFIG.FIELD_HEIGHT) * 100;

                    let color = 'black';
                    let size = '6px';
                    if (proj.type === 'fireball_small') { color = 'orange'; size = '10px'; }
                    if (proj.type === 'magic_bolt') { color = 'purple'; size = '8px'; }
                    if (proj.type === 'cannonball') { color = 'black'; size = '12px'; }
                    if (proj.type === 'arrow') { color = 'brown'; size = '6px'; }
                    if (proj.type === 'bullet') { color = 'silver'; size = '4px'; }
                    if (proj.type === 'zap') { color = '#f1c40f'; size = '4px'; } // Electro Wizard

                    // Image-based projectiles
                    if (proj.type === 'log') {
                        return (
                            <div key={`proj_${idx}`} style={{
                                position: 'absolute',
                                left: `${left}%`,
                                bottom: `${bottom}%`,
                                width: '40px',
                                height: '20px',
                                transform: 'translate(-50%, 50%)',
                                backgroundImage: `url(${CARD_IMAGES.log})`,
                                backgroundSize: 'cover',
                                zIndex: 20,
                                boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                            }} />
                        );
                    }
                    if (proj.type === 'goblin_barrel') {
                        return (
                            <div key={`proj_${idx}`} style={{
                                position: 'absolute',
                                left: `${left}%`,
                                bottom: `${bottom}%`,
                                width: '25px',
                                height: '25px',
                                transform: 'translate(-50%, 50%) rotate(180deg)', // Flying barrel
                                backgroundImage: `url(${CARD_IMAGES.goblin_barrel})`,
                                backgroundSize: 'cover',
                                zIndex: 20,
                            }} />
                        );
                    }
                    if (proj.type === 'fireball') {
                        return (
                            <div key={`proj_${idx}`} style={{
                                position: 'absolute',
                                left: `${left}%`,
                                bottom: `${bottom}%`,
                                width: '30px',
                                height: '30px',
                                transform: 'translate(-50%, 50%)',
                                backgroundImage: `url(${CARD_IMAGES.fireball})`,
                                backgroundSize: 'cover',
                                zIndex: 20,
                                boxShadow: '0 0 10px orange',
                                borderRadius: '50%',
                            }} />
                        );
                    }

                    return (
                        <div key={`proj_${idx}`} style={{
                            position: 'absolute',
                            left: `${left}%`,
                            bottom: `${bottom}%`,
                            width: size,
                            height: size,
                            transform: 'translate(-50%, 50%)',
                            backgroundColor: color,
                            borderRadius: '50%',
                            zIndex: 20,
                            boxShadow: `0 0 5px ${color}`,
                        }} />
                    );
                })}

                {/* Drag Preview */}
                {dragCard && dragPos && (
                    <div style={{
                        position: 'fixed',
                        left: dragPos.x,
                        top: dragPos.y,
                        transform: 'translate(-50%, -50%)',
                        pointerEvents: 'none',
                        zIndex: 100,
                        opacity: 0.8,
                    }}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            backgroundImage: `url(${CARD_IMAGES[dragCard]})`,
                            backgroundSize: 'cover',
                            borderRadius: '50%',
                            border: '3px solid #f1c40f',
                            boxShadow: '0 0 20px rgba(241, 196, 15, 0.8)',
                        }}></div>

                        {/* Range Indicator if over field */}
                        {(() => {
                            if (!fieldRef.current) return null;
                            const rect = fieldRef.current.getBoundingClientRect();
                            if (
                                dragPos.x >= rect.left &&
                                dragPos.x <= rect.right &&
                                dragPos.y >= rect.top &&
                                dragPos.y <= rect.bottom
                            ) {
                                const unitStats = UNITS[dragCard.toUpperCase()];
                                const radius = unitStats.type === 'spell' ? unitStats.radius || 2 : 1;
                                // Calculate pixel radius based on field width
                                const pixelRadius = (radius / GAME_CONFIG.FIELD_WIDTH) * rect.width;

                                return (
                                    <div style={{
                                        position: 'absolute',
                                        left: '50%',
                                        top: '50%',
                                        width: `${pixelRadius * 2}px`,
                                        height: `${pixelRadius * 2}px`,
                                        transform: 'translate(-50%, -50%)',
                                        border: '2px dashed rgba(255,255,255,0.8)',
                                        borderRadius: '50%',
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                    }}></div>
                                );
                            }
                            return null;
                        })()}
                    </div>
                )}
            </div>

            {/* HUD */}
            <div style={{
                height: '150px',
                backgroundColor: '#34495e',
                display: 'flex',
                flexDirection: 'column',
                padding: '10px',
                boxShadow: '0 -4px 6px rgba(0,0,0,0.3)',
                zIndex: 50,
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
                        const isDragging = dragCard === cardId;

                        return (
                            <div
                                key={idx}
                                onMouseDown={(e) => canAfford && handleDragStart(e, cardId)}
                                onTouchStart={(e) => canAfford && handleDragStart(e, cardId)}
                                style={{
                                    width: '80px',
                                    height: '100px',
                                    backgroundImage: `url(${CARD_IMAGES[cardId]})`,
                                    backgroundSize: 'cover',
                                    borderRadius: '8px',
                                    border: isDragging ? '4px solid #f1c40f' : canAfford ? '2px solid #2ecc71' : '2px solid #7f8c8d',
                                    cursor: canAfford ? 'grab' : 'not-allowed',
                                    opacity: isDragging ? 0.5 : (canAfford ? 1 : 0.5),
                                    position: 'relative',
                                    transition: 'transform 0.1s',
                                    transform: isDragging ? 'scale(0.9)' : 'scale(1)',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                                    touchAction: 'none',
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
