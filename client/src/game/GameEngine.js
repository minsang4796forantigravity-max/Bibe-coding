import { UNITS, GAME_CONFIG } from './constants';

export class GameEngine {
    constructor(onStateChange) {
        this.onStateChange = onStateChange;
        this.state = {
            p1: {
                mana: 5,
                units: [],
                hp: 3000,
                deck: ['knight', 'archer', 'giant'],
                hand: ['knight', 'archer', 'giant', 'knight'], // Simplified for now
                nextCard: 'archer',
            },
            p2: {
                mana: 5,
                units: [],
                hp: 3000,
                deck: ['knight', 'archer', 'giant'],
                hand: ['knight', 'archer', 'giant', 'knight'],
                nextCard: 'archer',
            },
            projectiles: [],
            time: 0,
            gameOver: false,
            winner: null,
        };
        this.lastFrameTime = 0;
        this.animationId = null;
    }

    start() {
        this.lastFrameTime = performance.now();
        this.loop();
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    loop = () => {
        const now = performance.now();
        const dt = (now - this.lastFrameTime) / 1000; // seconds
        this.lastFrameTime = now;

        if (!this.state.gameOver) {
            this.update(dt);
        }

        this.onStateChange({ ...this.state });
        this.animationId = requestAnimationFrame(this.loop);
    };

    update(dt) {
        // Regenerate Mana
        if (this.state.p1.mana < GAME_CONFIG.MAX_MANA) {
            this.state.p1.mana = Math.min(GAME_CONFIG.MAX_MANA, this.state.p1.mana + GAME_CONFIG.MANA_REGEN_RATE * dt);
        }
        if (this.state.p2.mana < GAME_CONFIG.MAX_MANA) {
            this.state.p2.mana = Math.min(GAME_CONFIG.MAX_MANA, this.state.p2.mana + GAME_CONFIG.MANA_REGEN_RATE * dt);
        }

        // Move Units
        this.moveUnits(this.state.p1.units, 1, dt); // P1 moves up (positive Y)
        this.moveUnits(this.state.p2.units, -1, dt); // P2 moves down (negative Y)

        // Combat
        this.handleCombat(dt);

        // Check Win Condition
        if (this.state.p1.hp <= 0) {
            this.state.gameOver = true;
            this.state.winner = 'Player 2';
        } else if (this.state.p2.hp <= 0) {
            this.state.gameOver = true;
            this.state.winner = 'Player 1';
        }
    }

    moveUnits(units, direction, dt) {
        units.forEach(unit => {
            if (!unit.target) {
                unit.y += unit.speed * direction * dt;
            }
        });
    }

    handleCombat(dt) {
        const allUnits = [
            ...this.state.p1.units.map(u => ({ ...u, owner: 'p1' })),
            ...this.state.p2.units.map(u => ({ ...u, owner: 'p2' }))
        ];

        // Simple collision and targeting
        // For P1 units
        this.state.p1.units.forEach(u1 => {
            let target = null;
            let minDist = Infinity;

            // Check enemies (P2 units)
            this.state.p2.units.forEach(u2 => {
                const dist = Math.hypot(u1.x - u2.x, u1.y - u2.y);
                if (dist <= u1.range && dist < minDist) {
                    minDist = dist;
                    target = u2;
                }
            });

            // Check Enemy Tower (P2 Base) - Base is at y=18 for P1 (starts at 0)
            // P1 units move from 0 to 18. P2 base is at 18.
            if (!target) {
                const distToTower = Math.abs(GAME_CONFIG.FIELD_HEIGHT - u1.y);
                if (distToTower <= u1.range) {
                    target = { type: 'tower', owner: 'p2' };
                }
            }

            u1.target = target;
            if (target) {
                u1.attackTimer = (u1.attackTimer || 0) + dt;
                if (u1.attackTimer >= u1.attackSpeed) {
                    u1.attackTimer = 0;
                    this.dealDamage(u1, target);
                }
            }
        });

        // For P2 units
        this.state.p2.units.forEach(u2 => {
            let target = null;
            let minDist = Infinity;

            // Check enemies (P1 units)
            this.state.p1.units.forEach(u1 => {
                const dist = Math.hypot(u2.x - u1.x, u2.y - u1.y);
                if (dist <= u2.range && dist < minDist) {
                    minDist = dist;
                    target = u1;
                }
            });

            // Check Enemy Tower (P1 Base) - Base is at y=0 for P2 (starts at 18)
            if (!target) {
                const distToTower = Math.abs(u2.y - 0);
                if (distToTower <= u2.range) {
                    target = { type: 'tower', owner: 'p1' };
                }
            }

            u2.target = target;
            if (target) {
                u2.attackTimer = (u2.attackTimer || 0) + dt;
                if (u2.attackTimer >= u2.attackSpeed) {
                    u2.attackTimer = 0;
                    this.dealDamage(u2, target);
                }
            }
        });

        // Cleanup dead units
        this.state.p1.units = this.state.p1.units.filter(u => u.hp > 0);
        this.state.p2.units = this.state.p2.units.filter(u => u.hp > 0);
    }

    dealDamage(attacker, target) {
        if (target.type === 'tower') {
            if (target.owner === 'p1') {
                this.state.p1.hp -= attacker.damage;
            } else {
                this.state.p2.hp -= attacker.damage;
            }
        } else {
            target.hp -= attacker.damage;
        }
    }

    spawnUnit(player, cardId, x, y) {
        const unitStats = UNITS[cardId.toUpperCase()];
        if (!unitStats) return;

        const playerState = this.state[player];
        if (playerState.mana >= unitStats.cost) {
            playerState.mana -= unitStats.cost;

            const newUnit = {
                ...unitStats,
                id: Math.random().toString(36).substr(2, 9),
                x,
                y, // P1 spawns at y, P2 spawns at y (but P2 coordinates are inverted in logic? No, let's keep absolute coordinates)
                // Let's say Field is 0 to 18.
                // P1 base at 0. P2 base at 18.
                // P1 spawns near 0. P2 spawns near 18.
                hp: unitStats.hp,
                maxHp: unitStats.hp,
            };

            // Adjust spawn Y if needed to ensure they are on their side
            // Actually, the UI will pass the correct world coordinates.

            playerState.units.push(newUnit);

            // Cycle card
            const cardIndex = playerState.hand.indexOf(cardId);
            if (cardIndex > -1) {
                playerState.hand[cardIndex] = playerState.nextCard;
                playerState.nextCard = cardId; // Simple cycle back to deck/next
            }
        }
    }
}
