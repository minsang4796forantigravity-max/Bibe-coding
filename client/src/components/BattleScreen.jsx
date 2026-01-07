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
import kingTowerPremium from '../assets/king_tower_premium.png';
import princessTowerPremium from '../assets/princess_tower_premium.png';
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
import battleBg from '../assets/battle_bg.png';

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
    spear_goblin: goblinImg, // Placeholder for spear goblin
    egg_1: egg1Img,
    egg_2: egg2Img,
    egg_3: egg3Img,
    egg_4: egg4Img,
    egg_5: egg5Img,
    chicken: goblinHutImg,
    king_tower: kingTowerPremium,
    side_tower: princessTowerPremium,
};

export function BattleScreen({ gameState, playerId, socket }) {
    console.log('[BattleScreen] Rendering with state:', !!gameState, 'player:', playerId);
    const [dragCard, setDragCard] = useState(null);
    const [dragPos, setDragPos] = useState(null); // { x, y } screen coords
    const fieldRef = useRef(null);

    if (!gameState || !playerId || !gameState[playerId]) {
        console.warn('[BattleScreen] Missing state or player ID');
        return <div className="auth-page"><div className="auth-container">SYNCHRONIZING BATTLE...</div></div>;
    }

    // Lenient start check (fallback for older servers without isStarted flag)
    const isActuallyStarted = gameState.isStarted !== false;
    if (!isActuallyStarted) {
        return <div className="auth-page"><div className="auth-container">WAITING FOR OPPONENT...</div></div>;
    }

    const myState = gameState[playerId];
    const opponentId = playerId === 'p1' ? 'p2' : 'p1';
    const opponentState = gameState[opponentId];
    const isP1 = playerId === 'p1';

    const [activeEmotes, setActiveEmotes] = useState([]); // Array of { playerId, emoteId, id, timestamp }
    const [showEmoteSelector, setShowEmoteSelector] = useState(false);

    // Default emotes + user owned ones (could pass user prop or fetch, using defaults for now)
    const AVAILABLE_EMOTES = ['emote_thumbsup', 'emote_angry', 'emote_crying', 'emote_laugh', 'emote_gg', 'emote_fire', 'emote_ghost', 'emote_party'];
    const EMOTE_ICONS = {
        'emote_thumbsup': '👍', 'emote_angry': '😡', 'emote_crying': '😭', 'emote_laugh': '😂',
        'emote_gg': '🤝', 'emote_fire': '🔥', 'emote_ghost': '👻', 'emote_party': '🎉'
    };

    // Ensure socket is connected when component mounts
    useEffect(() => {
        if (socket && !socket.connected) {
            console.log('Socket disconnected in BattleScreen, reconnecting...');
            socket.connect();
        }

        const onEmoteReceived = ({ playerId, emoteId }) => {
            const id = Date.now() + Math.random();
            setActiveEmotes(prev => [...prev, { playerId, emoteId, id }]);
            // Remove after 3 seconds
            setTimeout(() => {
                setActiveEmotes(prev => prev.filter(e => e.id !== id));
            }, 3000);
        };

        socket.on('emote_received', onEmoteReceived);
        return () => {
            socket.off('emote_received', onEmoteReceived);
        };
    }, [socket]);

    const handleSendEmote = (emoteId) => {
        socket.emit('send_emote', { emoteId, gameId: gameState.gameId || (isP1 ? gameState.p1.id : gameState.p2.id) }); // Fallback ID if missing
        setShowEmoteSelector(false);
    };

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

        // Prevent default only if necessary, but careful as it might block scroll if not dragging
        // setDragCard(cardId);
        const { clientX, clientY } = getClientCoords(e);
        setDragCard(cardId);
        setDragPos({ x: clientX, y: clientY });
    };

    const handleDragMove = (e) => {
        if (!dragCard) return;
        if (e.cancelable) e.preventDefault(); // Stop scrolling while dragging
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
                    if (socket && socket.connected) {
                        socket.emit('deploy_card', { cardId: dragCard, x: gameX, y: gameY });
                    }
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

    const formatTime = (seconds) => {
        const m = Math.floor(Math.max(0, seconds) / 60);
        const s = Math.floor(Math.max(0, seconds) % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#000',
            userSelect: 'none',
            overflow: 'hidden',
            touchAction: 'none'
        }}>
            {/* Header / Timer Overlay */}
            <div style={{
                padding: '20px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 40,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                pointerEvents: 'none'
            }}>
                <div className="glass-panel" style={{
                    padding: '8px 40px',
                    borderRadius: '50px',
                    border: '2px solid var(--color-accent)',
                    color: 'var(--color-accent)',
                    fontFamily: 'var(--font-title)',
                    fontSize: 'clamp(1rem, 4vw, 1.5rem)',
                    textAlign: 'center',
                    boxShadow: 'var(--shadow-glow-accent)',
                    pointerEvents: 'auto',
                    background: 'rgba(0,0,0,0.8)',
                    minWidth: '150px'
                }}>
                    {formatTime(gameState.matchTime ?? 180)}
                    {gameState.isOvertime && <div style={{ fontSize: '0.6rem', color: 'var(--color-danger)', marginTop: '-5px' }}>OVERTIME</div>}
                </div>
            </div>
            {/* Game Field */}
            <div
                ref={fieldRef}
                className="game-field"
                style={{
                    flex: 1,
                    position: 'relative',
                    background: '#2c3e50', // Dark fallback
                    backgroundImage: `url(${battleBg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    overflow: 'hidden',
                    boxShadow: 'inset 0 0 100px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.5)',
                    margin: '0 auto',
                    aspectRatio: '10 / 18',
                    borderRadius: '8px',
                    border: '8px solid #3d2b1f', // Wooden/Stone border feel
                    outline: '2px solid #5d4037'
                }}
            >
                {/* Double Elixir Announcement Overlay */}
                {gameState.matchTime <= 60 && gameState.matchTime > 57 && (
                    <div style={{
                        position: 'absolute',
                        top: '40%',
                        left: '0',
                        right: '0',
                        textAlign: 'center',
                        zIndex: 100,
                        color: 'var(--color-accent)',
                        fontSize: '3rem',
                        fontFamily: 'var(--font-title)',
                        textShadow: '0 10px 30px rgba(0,0,0,0.8)',
                        animation: 'pulse-grow 1s ease-in-out infinite',
                        pointerEvents: 'none',
                    }}>
                        DOUBLE ELIXIR!
                    </div>
                )}

                {/* Arena Grid Decor - Reduced opacity to stay subtle over new background */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                    backgroundSize: '10% 5.55%',
                    pointerEvents: 'none',
                    zIndex: 2
                }} />

                {/* River & Bridges - Adjusted for AI background (more subtle, stone-like) */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    right: 0,
                    height: '12%',
                    background: 'rgba(0, 0, 0, 0.2)', // Very subtle shadow for the river area
                    transform: 'translateY(-50%)',
                    zIndex: 1,
                    pointerEvents: 'none'
                }}>
                    {/* Visual markers for bridges if needed, but keeping it clean for now */}
                    <div style={{ position: 'absolute', left: '10%', width: '25%', height: '100%', borderBottom: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid rgba(255,255,255,0.1)' }} />
                    <div style={{ position: 'absolute', right: '10%', width: '25%', height: '100%', borderBottom: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid rgba(255,255,255,0.1)' }} />
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
                            aspectRatio: '1/1',
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

                    // New Status Effects (Burn/Curse)
                    if (unit.statusEffects) {
                        unit.statusEffects.forEach(effect => {
                            if (effect.type === 'burn') {
                                spellEffectStyle.filter = (spellEffectStyle.filter || '') + ' brightness(1.2) sepia(0.5) hue-rotate(-20deg) saturate(3)';
                                spellEffectStyle.boxShadow = '0 0 10px #e67e22';
                            } else if (effect.type === 'curse') {
                                spellEffectStyle.filter = (spellEffectStyle.filter || '') + ' grayscale(0.5) sepia(0.5) hue-rotate(220deg)';
                                spellEffectStyle.boxShadow = '0 0 10px #9b59b6';
                            }
                        });
                    }

                    // Charge Effect
                    if (unit.isCharging) {
                        spellEffectStyle.transform = 'translate(-50%, 50%) scale(1.15)';
                        spellEffectStyle.boxShadow = '0 0 25px #f1c40f, 0 0 10px #e67e22';
                        spellEffectStyle.borderColor = '#f1c40f';
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

                    let unitSize = unit.type === 'building' ? '40px' : '30px';
                    if (unit.cardId === 'king_tower') unitSize = '55px';
                    if (unit.cardId === 'side_tower') unitSize = '38px';

                    const unitCardId = unit.cardId || (unit.id ? unit.id.split('_')[0] : 'knight');
                    const isKing = unitCardId === 'king_tower';

                    // Check if unit is on the opponent's side (top part of the field)
                    // P1 is bottom (y=0 to 9), P2 is top (y=9 to 18)
                    const isOpponentTop = isP1 ? unit.y > (GAME_CONFIG.FIELD_HEIGHT || 18) * 0.8 : unit.y < (GAME_CONFIG.FIELD_HEIGHT || 18) * 0.2;

                    return (
                        <div
                            key={unit.id}
                            style={{
                                position: 'absolute',
                                left: `${left || 0}%`,
                                bottom: `${bottom || 0}%`,
                                width: unitSize,
                                height: unitSize,
                                transform: 'translate(-50%, 50%)',
                                backgroundImage: `url(${CARD_IMAGES[unitCardId] || knightImg})`,
                                backgroundSize: 'contain',
                                backgroundPosition: 'center bottom',
                                backgroundRepeat: 'no-repeat',
                                borderRadius: '0',
                                border: 'none',
                                zIndex: isKing ? 10 : 5,
                                filter: isKing || unitCardId === 'side_tower'
                                    ? 'drop-shadow(0 10px 10px rgba(0,0,0,0.5))'
                                    : 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))',
                                animation: (unit.type !== 'building' && !isKing && unit.type !== 'spell')
                                    ? 'unit-wobble 0.6s infinite alternate ease-in-out'
                                    : 'none',
                                ...spellEffectStyle
                            }}
                        >
                            {/* Unit Shadow */}
                            {unit.type !== 'building' && !isKing && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: '-2px',
                                    left: '50%',
                                    width: '60%',
                                    height: '20%',
                                    backgroundColor: 'rgba(0,0,0,0.4)',
                                    borderRadius: '50%',
                                    transform: 'translateX(-50%)',
                                    filter: 'blur(3px)',
                                    zIndex: -1
                                }} />
                            )}
                            {/* Special Visual Effects */}
                            {unit.type === 'egg' && (
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '5px',
                                    animation: 'pulse 0.5s infinite alternate',
                                    boxShadow: '0 0 20px gold',
                                    pointerEvents: 'none'
                                }} />
                            )}
                            {unit.statusEffects?.some(e => e.type === 'slow') && (
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    backgroundColor: 'rgba(0, 255, 255, 0.2)',
                                    borderRadius: '50%',
                                    pointerEvents: 'none'
                                }} />
                            )}
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
                                ...(isOpponentTop ? { bottom: -10 } : { top: -6 }),
                                left: 0,
                                width: '100%',
                                height: '3px',
                                backgroundColor: 'red',
                                borderRadius: '2px',
                                zIndex: 11
                            }}>
                                <div style={{
                                    width: `${(unit.hp / unit.maxHp) * 100}%`,
                                    height: '100%',
                                    backgroundColor: '#0f0',
                                    borderRadius: '2px',
                                }} />
                            </div>

                            {/* Shield Bar */}
                            {unit.shield > 0 && (
                                <div style={{
                                    position: 'absolute',
                                    ...(isOpponentTop ? { bottom: -15 } : { top: -11 }),
                                    left: 0,
                                    width: '100%',
                                    height: '3px',
                                    backgroundColor: 'rgba(0,0,0,0.5)',
                                    borderRadius: '2px',
                                    border: '1px solid #3498db'
                                }}>
                                    <div style={{
                                        width: `${(unit.shield / unit.maxShield) * 100}%`,
                                        height: '100%',
                                        backgroundColor: '#3498db',
                                        borderRadius: '2px',
                                    }} />
                                </div>
                            )}
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
                    if (proj.type === 'bomb') { color = '#2c3e50'; size = '16px'; } // Balloon
                    if (proj.type === 'spear') { color = '#7f8c8d'; size = '8px'; } // Spear Goblin

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
                                        // Ensure it stays a circle regardless of container aspect ratio
                                        aspectRatio: '1/1',
                                    }}></div>
                                );
                            }
                            return null;
                        })()}
                    </div>
                )}
            </div>

            {/* Emote Layer */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 100 }}>
                {activeEmotes.map(emote => {
                    const isMe = emote.playerId === playerId;
                    return (
                        <div key={emote.id} style={{
                            position: 'absolute',
                            left: '50%',
                            top: isMe ? '75%' : '20%', // Rough position near King Towers
                            transform: 'translate(-50%, -50%) scale(0)',
                            animation: 'popIn 0.3s forwards, floatUp 1.5s 1.5s forwards',
                            fontSize: '4rem',
                            filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))',
                            zIndex: 101
                        }}>
                            {EMOTE_ICONS[emote.emoteId] || '❓'}
                            <style>{`
                                @keyframes popIn { to { transform: translate(-50%, -50%) scale(1); } }
                                @keyframes floatUp { to { opacity: 0; transform: translate(-50%, -100%) scale(1); } }
                            `}</style>
                        </div>
                    );
                })}
            </div>

            {/* Emote Selector Button */}
            <button
                onClick={() => setShowEmoteSelector(!showEmoteSelector)}
                style={{
                    position: 'absolute',
                    bottom: '180px',
                    right: '20px',
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    border: 'none',
                    background: 'linear-gradient(135deg, #f1c40f, #e67e22)',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                    zIndex: 200,
                    transition: 'transform 0.1s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >
                😀
            </button>

            {/* Emote Selector Panel */}
            {showEmoteSelector && (
                <div style={{
                    position: 'absolute',
                    bottom: '240px',
                    right: '20px',
                    background: 'rgba(20, 30, 40, 0.95)',
                    backdropFilter: 'blur(10px)',
                    padding: '15px',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '10px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    zIndex: 200,
                    animation: 'fadeIn 0.2s ease-out'
                }}>
                    {AVAILABLE_EMOTES.map(id => (
                        <button
                            key={id}
                            onClick={() => handleSendEmote(id)}
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: '8px',
                                width: '50px',
                                height: '50px',
                                fontSize: '1.8rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                        >
                            {EMOTE_ICONS[id]}
                        </button>
                    ))}
                </div>
            )}

            {/* HUD */}
            <div style={{
                height: '160px',
                background: 'linear-gradient(180deg, #1e2a3a 0%, #2c3e50 100%)',
                display: 'flex',
                flexDirection: 'column',
                padding: '15px',
                boxShadow: '0 -8px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
                zIndex: 50,
                borderTop: '2px solid rgba(52,152,219,0.3)',
            }}>
                {/* Mana Bar */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', gap: '10px' }}>
                    <div style={{
                        color: 'var(--color-accent)',
                        fontFamily: 'var(--font-title)',
                        fontSize: 'clamp(0.8rem, 3vw, 1.1rem)',
                        minWidth: '80px',
                        textShadow: 'var(--shadow-glow-accent)',
                    }}>
                        {Math.floor(myState.mana)} ELIXIR
                    </div>
                    <div style={{
                        flex: 1,
                        height: '14px',
                        background: 'rgba(0,0,0,0.5)',
                        borderRadius: '10px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        overflow: 'hidden',
                        padding: '2px'
                    }}>
                        <div style={{
                            height: '100%',
                            width: `${(myState.mana / GAME_CONFIG.MAX_MANA) * 100}%`,
                            background: 'var(--color-gold)',
                            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            borderRadius: '8px',
                            boxShadow: '0 0 15px rgba(241, 196, 15, 0.5)',
                        }} />
                    </div>
                </div>

                {/* Hand */}
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                    {myState.hand.map((cardId, idx) => {
                        const cardStats = UNITS[cardId.toUpperCase()];
                        const canAfford = myState.mana >= cardStats.cost;
                        const isDragging = dragCard === cardId;

                        return (
                            <div
                                key={idx}
                                onMouseDown={(e) => canAfford && handleDragStart(e, cardId)}
                                onTouchStart={(e) => canAfford && handleDragStart(e, cardId)}
                                className="game-card"
                                style={{
                                    width: 'clamp(60px, 18vw, 85px)',
                                    height: 'clamp(80px, 24vw, 115px)',
                                    backgroundImage: `url(${CARD_IMAGES[cardId]})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    borderRadius: '15px',
                                    border: isDragging ? '3px solid var(--color-accent)' : canAfford ? '2px solid rgba(255,255,255,0.2)' : '2px solid rgba(0,0,0,0.5)',
                                    cursor: canAfford ? 'grab' : 'not-allowed',
                                    opacity: canAfford ? 1 : 0.4,
                                    position: 'relative',
                                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                    transform: isDragging ? 'translateY(-20px) scale(1.1)' : 'none',
                                    boxShadow: canAfford ? 'var(--shadow-soft)' : 'none',
                                    filter: canAfford ? 'none' : 'grayscale(100%) brightness(0.5)',
                                    touchAction: 'none'
                                }}
                            >
                                <div style={{
                                    position: 'absolute',
                                    top: '8px',
                                    left: '8px',
                                    background: 'rgba(0,0,0,0.8)',
                                    color: 'var(--color-accent)',
                                    fontWeight: '900',
                                    padding: '4px 8px',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                                    border: '1px solid var(--color-accent)',
                                    fontFamily: 'var(--font-title)'
                                }}>
                                    {cardStats?.cost || 0}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            {/* Simple CSS Animations */}
            <style>{`
                @keyframes unit-wobble {
                    0% { transform: translate(-50%, 50%) rotate(-3deg) translateY(0); }
                    100% { transform: translate(-50%, 50%) rotate(3deg) translateY(-2px); }
                }
                @keyframes pulse-glow {
                    0% { box-shadow: 0 0 10px var(--color-accent); }
                    100% { box-shadow: 0 0 30px var(--color-accent); }
                }
            `}</style>
        </div>
    );
}
