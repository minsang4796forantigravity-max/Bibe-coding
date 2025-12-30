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
import towerImg from '../assets/tower_asset.png';
import '../styles/evolution-effects.css';

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

export function PlayerView({ playerId, gameState, onDeploy, isRotated }) {
    const [selectedCard, setSelectedCard] = useState(null);
    const playerState = gameState[playerId];
    const opponentId = playerId === 'p1' ? 'p2' : 'p1';
    const opponentState = gameState[opponentId];

    const handleFieldClick = (e) => {
        if (!selectedCard) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width * GAME_CONFIG.FIELD_WIDTH;
        const y = (e.clientY - rect.top) / rect.height * GAME_CONFIG.FIELD_HEIGHT;

        // Convert screen Y to Game Y
        // If isRotated (Top Player/P2), visual top is Game Y=18, visual bottom is Game Y=0?
        // No, let's keep it simple.
        // The Game Field is always 0 to 18.
        // P1 (Bottom) sees 0 at bottom, 18 at top.
        // P2 (Top) sees 18 at bottom (their side), 0 at top.

        // Actually, if we rotate the whole container 180deg for P2:
        // P2's "bottom" of screen is visually top of device.
        // If we render the field identically for both but rotate P2's view:
        // P1 View: 0 at bottom, 18 at top.
        // P2 View: 0 at bottom, 18 at top (but rotated 180, so 0 is at visual top, 18 at visual bottom).

        // Wait, P2 needs to spawn at 18.
        // If P2 clicks near their "bottom" (visual top of device), that corresponds to Y=18.
        // If we just render the same field and rotate P2's view 180deg:
        // A click at visual (x, y) on P2's screen needs to be mapped.

        // Let's assume the Field Component renders 0 at bottom, 18 at top.
        // P1 View: Normal. Click at bottom -> Y=0.
        // P2 View: Rotated 180.
        // Visual Top (P2's bottom) -> This is Y=18 in game coordinates?
        // No, if we rotate the div, the coordinate system rotates too.
        // So a click at (local x, local y) inside the rotated div:
        // The browser handles the rotation for visual, but event coordinates might be tricky.
        // Actually, if we just use standard React onClick on the div, `e.clientX/Y` are global.
        // `e.currentTarget.getBoundingClientRect()` gives the rect of the rotated element.

        // Let's simplify:
        // We pass `isRotated` to `PlayerView`.
        // If `isRotated`, we render the field normally but the container is rotated.
        // So `rect.top` is actually the visual bottom?
        // Let's just rely on the fact that we want to spawn relative to the player's side.

        // Let's try to calculate Game X/Y based on the click relative to the element.
        // If the element is rotated 180deg, top-left becomes bottom-right visually.
        // But `getBoundingClientRect` returns the visual bounding box.
        // And `clientX/Y` are visual.

        // If I click "bottom" of P2's view (which is top of screen):
        // That is "bottom" of the unrotated div if it was 180 rotated?
        // Let's just do this:
        // We calculate normalized X/Y (0-1) relative to the bounding box.
        // For P1 (Normal): Bottom is Y=0. Top is Y=18.
        //    Click at bottom of rect -> relativeY = 1.0 (if we measure from top).
        //    We want Y=0 at bottom. So GameY = (1 - relativeY) * 18.

        // For P2 (Rotated 180):
        //    The component is rotated.
        //    Visual Top of screen is P2's "bottom" (Base).
        //    Click at Visual Top -> relativeY = 0.0 (relative to viewport/rect top).
        //    But since it's rotated, that visual top is actually the "bottom" of the component content?
        //    No, CSS rotation transforms the visual output.
        //    If we use `e.nativeEvent.offsetX/Y`, it gives coordinates inside the element, respecting transform?
        //    Actually `offsetX/Y` is usually the safest for transformed elements.

        // Let's use `e.nativeEvent.offsetX` and `e.nativeEvent.offsetY`.
        // These are coordinates relative to the target element's padding edge.
        // For P1: 0,0 is Top-Left. We want 0,0 to be Bottom-Left of game?
        //    Game Y=0 is Bottom. Game Y=18 is Top.
        //    So GameY = (Height - offsetY) / Height * 18.

        // For P2: If rotated 180deg.
        //    0,0 is still Top-Left of the content (which is now Visual Bottom-Right).
        //    So if I click Visual Top-Left (P2's base), that corresponds to Content Bottom-Right?
        //    This is getting confusing.

        // Alternative:
        // Don't rotate the whole component.
        // Rotate the "Camera".
        // Render everything relative to the Player.
        // P1 sees P1 base at bottom.
        // P2 sees P2 base at bottom.
        // So for P2, we render objects at `(FieldHeight - y)`.
        // And we send clicks as `(FieldHeight - clickY)`.
        // This is much easier! No CSS 180deg rotation needed for the game view, just for the text/UI if needed.
        // But we want the players to face each other.
        // So P2's UI (Hand, Mana) should be at the "Top" of the device, rotated 180.
        // And the Game Field should be shared?
        // No, split screen means two separate views.
        // So yes, "Camera" approach is best.

        // P1 View:
        //   - Render P1 units at (x, y).
        //   - Render P2 units at (x, y).
        //   - Click at bottom -> y=0.

        // P2 View:
        //   - Render P1 units at (10-x, 18-y). (Invert X and Y)
        //   - Render P2 units at (10-x, 18-y).
        //   - Click at bottom -> y=0 (which translates to Game y=18).

        // Let's go with this "Relative View" approach.

        const relativeX = e.nativeEvent.offsetX / rect.width * GAME_CONFIG.FIELD_WIDTH;
        const relativeY = (rect.height - e.nativeEvent.offsetY) / rect.height * GAME_CONFIG.FIELD_HEIGHT;

        // Now convert to Game Coordinates based on Player
        let gameX, gameY;
        if (playerId === 'p1') {
            gameX = relativeX;
            gameY = relativeY;
        } else {
            // P2 sees everything inverted
            gameX = GAME_CONFIG.FIELD_WIDTH - relativeX;
            gameY = GAME_CONFIG.FIELD_HEIGHT - relativeY;
        }

        // Check bounds (can only deploy on own side, e.g., first 40% of field)
        const deployLimit = GAME_CONFIG.FIELD_HEIGHT * 0.4;
        const myY = playerId === 'p1' ? gameY : (GAME_CONFIG.FIELD_HEIGHT - gameY);

        if (myY <= deployLimit) {
            onDeploy(playerId, selectedCard, gameX, gameY);
            setSelectedCard(null);
        }
    };

    return (
        <div
            className="player-view"
            style={{
                transform: isRotated ? 'rotate(180deg)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                height: '50%',
                width: '100%',
                borderBottom: isRotated ? '2px solid #444' : 'none',
                borderTop: !isRotated ? '2px solid #444' : 'none',
                overflow: 'hidden',
                position: 'relative',
            }}
        >
            {/* Game Field */}
            <div
                className="game-field"
                onClick={handleFieldClick}
                style={{
                    flex: 1,
                    position: 'relative',
                    backgroundColor: '#333',
                    overflow: 'hidden',
                    cursor: selectedCard ? 'crosshair' : 'default',
                }}
            >
                {/* Grid/Background hint */}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '40%',
                    borderTop: '1px dashed rgba(255,255,255,0.2)',
                    pointerEvents: 'none'
                }}></div>

                {/* Towers */}
                {/* My Tower */}
                <div style={{
                    position: 'absolute',
                    left: '50%',
                    bottom: '5%',
                    transform: 'translate(-50%, 50%)',
                    width: '60px',
                    height: '60px',
                    backgroundImage: `url(${towerImg})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    zIndex: 10,
                }}>
                    <div style={{ position: 'absolute', top: -20, left: 0, right: 0, textAlign: 'center', color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                        {playerState.hp}
                    </div>
                </div>

                {/* Opponent Tower */}
                <div style={{
                    position: 'absolute',
                    left: '50%',
                    top: '5%',
                    transform: 'translate(-50%, -50%)',
                    width: '60px',
                    height: '60px',
                    backgroundImage: `url(${towerImg})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    filter: 'hue-rotate(180deg)', // Different color for enemy
                    zIndex: 10,
                }}>
                    <div style={{ position: 'absolute', bottom: -20, left: 0, right: 0, textAlign: 'center', color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                        {opponentState.hp}
                    </div>
                </div>

                {/* Units */}
                {[...gameState.p1.units, ...gameState.p2.units].map(unit => {
                    // Convert Unit X/Y to View X/Y
                    let viewX, viewY;
                    if (playerId === 'p1') {
                        viewX = unit.x;
                        viewY = unit.y;
                    } else {
                        viewX = GAME_CONFIG.FIELD_WIDTH - unit.x;
                        viewY = GAME_CONFIG.FIELD_HEIGHT - unit.y;
                    }

                    const left = (viewX / GAME_CONFIG.FIELD_WIDTH) * 100;
                    const bottom = (viewY / GAME_CONFIG.FIELD_HEIGHT) * 100;

                    return (
                        <div
                            key={unit.id}
                            style={{
                                position: 'absolute',
                                left: `${left}%`,
                                bottom: `${bottom}%`,
                                width: '30px',
                                height: '30px',
                                transform: 'translate(-50%, 50%)',
                                backgroundImage: `url(${CARD_IMAGES[unit.id.split('_')[0]] || knightImg})`,
                                backgroundSize: 'cover',
                                borderRadius: '50%',
                                border: unit.isEvolved ? '2px solid #f39c12' : `2px solid ${unit.color}`,
                                transition: 'left 0.1s linear, bottom 0.1s linear',
                                zIndex: 5,
                            }}
                        >
                            {/* 진화 오라 */}
                            {unit.isEvolved && <div className="unit-evolution-aura"></div>}

                            {/* Health Bar */}
                            <div style={{
                                position: 'absolute',
                                top: -5,
                                left: 0,
                                width: '100%',
                                height: '3px',
                                backgroundColor: 'red',
                            }}>
                                <div style={{
                                    width: `${(unit.hp / unit.maxHp) * 100}%`,
                                    height: '100%',
                                    backgroundColor: '#0f0',
                                }} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* HUD */}
            <div className="hud" style={{
                height: '120px',
                backgroundColor: '#222',
                display: 'flex',
                flexDirection: 'column',
                padding: '5px',
                boxSizing: 'border-box',
            }}>
                {/* Mana Bar */}
                <div style={{
                    height: '20px',
                    backgroundColor: '#111',
                    marginBottom: '5px',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    position: 'relative',
                }}>
                    <div style={{
                        width: `${(playerState.mana / GAME_CONFIG.MAX_MANA) * 100}%`,
                        height: '100%',
                        backgroundColor: '#3498db',
                        transition: 'width 0.1s linear',
                    }} />
                    <span style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 'bold',
                    }}>{Math.floor(playerState.mana)} / {GAME_CONFIG.MAX_MANA}</span>
                </div>

                {/* Hand */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '8px', // 6개 카드를 위해 간격 줄임
                    flex: 1,
                }}>
                    {playerState.hand.map((cardId, index) => {
                        const unitStats = UNITS[cardId.toUpperCase()];
                        const canAfford = playerState.mana >= unitStats.cost;
                        const isSelected = selectedCard === cardId;
                        const isEvolved = playerState.evolutions && playerState.evolutions.includes(cardId);

                        return (
                            <div
                                key={index}
                                onClick={() => canAfford && setSelectedCard(cardId)}
                                className={isEvolved ? 'evolution-card' : ''}
                                style={{
                                    width: '55px',
                                    height: '75px',
                                    backgroundColor: isSelected ? '#f1c40f' : (canAfford ? '#444' : '#222'),
                                    backgroundImage: `url(${CARD_IMAGES[cardId]})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    borderRadius: '5px',
                                    border: isEvolved
                                        ? (isSelected ? '3px solid #f39c12' : '2px solid #f39c12')
                                        : (isSelected ? '3px solid white' : '1px solid #000'),
                                    opacity: canAfford ? 1 : 0.5,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'flex-end',
                                    cursor: 'pointer',
                                    position: 'relative',
                                }}
                            >
                                {/* 진화 파티클 효과 */}
                                {isEvolved && (
                                    <div className="evolution-particles">
                                        <div className="particle"></div>
                                        <div className="particle"></div>
                                        <div className="particle"></div>
                                        <div className="particle"></div>
                                        <div className="particle"></div>
                                    </div>
                                )}

                                {/* 진화 표시 */}
                                {isEvolved && (
                                    <div
                                        className="evolution-star"
                                        style={{
                                            position: 'absolute',
                                            top: '-5px',
                                            right: '-5px',
                                            backgroundColor: '#f39c12',
                                            borderRadius: '50%',
                                            width: '20px',
                                            height: '20px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '12px',
                                            zIndex: 1,
                                        }}>
                                        ⭐
                                    </div>
                                )}
                                <div style={{
                                    backgroundColor: 'rgba(0,0,0,0.7)',
                                    color: '#3498db',
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    borderTopLeftRadius: '5px',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    padding: '2px 5px',
                                }}>
                                    {unitStats.cost}
                                </div>
                                <div style={{
                                    backgroundColor: 'rgba(0,0,0,0.7)',
                                    color: 'white',
                                    fontSize: '9px', // 10px → 9px
                                    textAlign: 'center',
                                    padding: '2px',
                                }}>
                                    {unitStats.name}
                                </div>
                            </div>
                        );
                    })}

                    {/* Next Card Preview */}
                    {playerState.nextCard && (
                        <div style={{
                            width: '40px',
                            height: '55px',
                            marginLeft: '8px',
                            opacity: 0.8,
                            backgroundImage: `url(${CARD_IMAGES[playerState.nextCard]})`,
                            backgroundSize: 'cover',
                            borderRadius: '5px',
                            alignSelf: 'center',
                            border: '1px solid #555',
                            position: 'relative',
                            backgroundColor: '#222',
                        }}>
                            <div style={{
                                fontSize: '8px',
                                backgroundColor: 'rgba(0,0,0,0.9)',
                                color: '#f1c40f',
                                fontWeight: 'bold',
                                padding: '2px',
                                textAlign: 'center',
                                borderTopLeftRadius: '5px',
                                borderTopRightRadius: '5px',
                            }}>NEXT</div>
                            <div style={{
                                position: 'absolute',
                                bottom: '2px',
                                left: '2px',
                                backgroundColor: 'rgba(0,0,0,0.8)',
                                color: '#3498db',
                                fontSize: '10px',
                                fontWeight: 'bold',
                                padding: '1px 4px',
                                borderRadius: '3px',
                            }}>
                                {UNITS[playerState.nextCard.toUpperCase()]?.cost}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
