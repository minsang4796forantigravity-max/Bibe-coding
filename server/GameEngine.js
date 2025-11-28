const { UNITS, GAME_CONFIG } = require('./constants');

class GameEngine {
    constructor(roomId, io) {
        this.roomId = roomId;
        this.io = io;
        this.state = {
            p1: {
                id: null,
                mana: 5,
                units: [],
                hp: 3000,
                deck: ['knight', 'archer', 'giant', 'wizard', 'skeletons', 'cannon', 'bomber', 'kamikaze', 'fireball', 'mana_collector', 'sniper', 'goblin_hut'],
                hand: ['bomber', 'sniper', 'goblin_hut', 'mana_collector'],
                nextCard: 'fireball',
            },
            p2: {
                id: null,
                mana: 5,
                units: [],
                hp: 3000,
                deck: ['knight', 'archer', 'giant', 'wizard', 'skeletons', 'cannon', 'bomber', 'kamikaze', 'fireball', 'mana_collector', 'sniper', 'goblin_hut'],
                hand: ['bomber', 'sniper', 'goblin_hut', 'mana_collector'],
                nextCard: 'fireball',
            },
            gameOver: false,
            winner: null,
        };
        this.interval = null;
        this.lastTime = Date.now();
    }

    addPlayer(socketId) {
        if (!this.state.p1.id) {
            this.state.p1.id = socketId;
            return 'p1';
        } else if (!this.state.p2.id) {
            this.state.p2.id = socketId;
            return 'p2';
        }
        return null;
    }

    start() {
        this.lastTime = Date.now();
        this.interval = setInterval(() => this.loop(), 1000 / GAME_CONFIG.FPS);
    }
    getSerializableState() {
        // Deep copy 하되, 순환 참조 제거
        const stateCopy = {
            p1: {
                ...this.state.p1,
                units: this.state.p1.units.map(u => ({
                    ...u,
                    target: undefined, // target 제거 (순환 참조 방지)
                }))
            },
            p2: {
                ...this.state.p2,
                units: this.state.p2.units.map(u => ({
                    ...u,
                    target: undefined, // target 제거 (순환 참조 방지)
                }))
            },
            gameOver: this.state.gameOver,
            winner: this.state.winner,
        };
        return stateCopy;
    }

    stop() {
        clearInterval(this.interval);
    }

    loop() {
        if (this.state.gameOver) return;

        const now = Date.now();
        const dt = (now - this.lastTime) / 1000;
        this.lastTime = now;

        this.update(dt);
        this.io.to(this.roomId).emit('game_update', this.state);
    }

    update(dt) {
        // Regenerate Mana
        if (this.state.p1.mana < GAME_CONFIG.MAX_MANA) {
            this.state.p1.mana = Math.min(GAME_CONFIG.MAX_MANA, this.state.p1.mana + GAME_CONFIG.MANA_REGEN_RATE * dt);
        }
        if (this.state.p2.mana < GAME_CONFIG.MAX_MANA) {
            this.state.p2.mana = Math.min(GAME_CONFIG.MAX_MANA, this.state.p2.mana + GAME_CONFIG.MANA_REGEN_RATE * dt);
        }

        // Move & Update Units
        this.updateUnits(this.state.p1, 1, dt);
        this.updateUnits(this.state.p2, -1, dt);

        // Combat
        this.handleCombat(dt);

        // Check Win
        if (this.state.p1.hp <= 0) {
            this.state.gameOver = true;
            this.state.winner = 'Player 2';
            this.io.to(this.roomId).emit('game_over', { winner: 'Player 2' });
            this.stop();
        } else if (this.state.p2.hp <= 0) {
            this.state.gameOver = true;
            this.state.winner = 'Player 1';
            this.io.to(this.roomId).emit('game_over', { winner: 'Player 1' });
            this.stop();
        }
    }

    updateUnits(playerState, direction, dt) {
        playerState.units.forEach(unit => {
            if (unit.type === 'building') {
                unit.lifetime -= dt;
                if (unit.lifetime <= 0) unit.hp = 0;

                // Mana Collector Logic
                if (unit.manaProduction) {
                    unit.productionTimer = (unit.productionTimer || 0) + dt;
                    if (unit.productionTimer >= unit.productionInterval) {
                        unit.productionTimer = 0;
                        playerState.mana = Math.min(GAME_CONFIG.MAX_MANA, playerState.mana + unit.manaProduction);
                    }
                }

                // Spawner Logic (Goblin Hut)
                if (unit.spawnUnit) {
                    unit.spawnTimer = (unit.spawnTimer || 0) + dt;
                    if (unit.spawnTimer >= unit.spawnInterval) {
                        unit.spawnTimer = 0;
                        this.spawnUnit(playerState, unit.spawnUnit, unit.x, unit.y);
                    }
                }
                return;
            }
            if (!unit.target) {
                unit.y += unit.speed * direction * dt;
            }
        });
    }

    handleCombat(dt) {
        const p1Units = this.state.p1.units;
        const p2Units = this.state.p2.units;

        // Helper to find target
        const findTarget = (u, enemies, enemyTowerY) => {
            let target = null;
            let minDist = Infinity;

            enemies.forEach(e => {
                const dist = Math.hypot(u.x - e.x, u.y - e.y);
                if (dist <= u.range && dist < minDist) {
                    minDist = dist;
                    target = e;
                }
            });

            if (!target && u.type !== 'building') {
                // Check Tower
                const distToTowerCenter = Math.hypot(u.x - 5, u.y - enemyTowerY);
                if (distToTowerCenter <= u.range) {
                    target = { type: 'tower', y: enemyTowerY, x: 5 };
                }
            }
            return target;
        };

        // P1 Units
        p1Units.forEach(u1 => {
            u1.target = findTarget(u1, p2Units, GAME_CONFIG.FIELD_HEIGHT);
            if (u1.target) {
                u1.attackTimer = (u1.attackTimer || 0) + dt;
                if (u1.attackTimer >= u1.attackSpeed) {
                    u1.attackTimer = 0;
                    this.performAttack(u1, u1.target, 'p2', p2Units);
                }
            }
        });

        // P2 Units
        p2Units.forEach(u2 => {
            u2.target = findTarget(u2, p1Units, 0);
            if (u2.target) {
                u2.attackTimer = (u2.attackTimer || 0) + dt;
                if (u2.attackTimer >= u2.attackSpeed) {
                    u2.attackTimer = 0;
                    this.performAttack(u2, u2.target, 'p1', p1Units);
                }
            }
        });

        // Tower Attacks
        this.towerAttack(this.state.p1, p2Units, 5, 0, dt);
        this.towerAttack(this.state.p2, p1Units, 5, GAME_CONFIG.FIELD_HEIGHT, dt);

        // Cleanup
        this.state.p1.units = this.state.p1.units.filter(u => u.hp > 0);
        this.state.p2.units = this.state.p2.units.filter(u => u.hp > 0);
    }

    performAttack(attacker, target, targetPlayerId, enemyUnits) {
        if (attacker.selfDestruct) {
            attacker.hp = 0; // Die immediately
            this.dealSplashDamage(attacker.x, attacker.y, attacker.splash, attacker.damage, targetPlayerId, enemyUnits);
        } else if (attacker.splash) {
            this.dealSplashDamage(target.x, target.y, attacker.splash, attacker.damage, targetPlayerId, enemyUnits);
        } else {
            this.dealDamage(attacker.damage, target, targetPlayerId);
        }
    }

    dealSplashDamage(x, y, radius, damage, targetPlayerId, enemyUnits) {
        // Damage Units
        enemyUnits.forEach(u => {
            if (Math.hypot(u.x - x, u.y - y) <= radius) {
                u.hp -= damage;
            }
        });

        // Damage Tower
        const towerY = targetPlayerId === 'p1' ? 0 : GAME_CONFIG.FIELD_HEIGHT;
        if (Math.hypot(5 - x, towerY - y) <= radius) {
            this.state[targetPlayerId].hp -= damage;
        }
    }

    towerAttack(ownerState, enemyUnits, towerX, towerY, dt) {
        const towerStats = UNITS.TOWER;
        let target = null;
        let minDist = Infinity;

        enemyUnits.forEach(u => {
            const dist = Math.hypot(towerX - u.x, towerY - u.y);
            if (dist <= towerStats.range && dist < minDist) {
                minDist = dist;
                target = u;
            }
        });

        if (target) {
            ownerState.towerAttackTimer = (ownerState.towerAttackTimer || 0) + dt;
            if (ownerState.towerAttackTimer >= towerStats.attackSpeed) {
                ownerState.towerAttackTimer = 0;
                target.hp -= towerStats.damage;
            }
        }
    }

    dealDamage(damage, target, targetPlayerId) {
        if (target.type === 'tower') {
            this.state[targetPlayerId].hp -= damage;
        } else {
            target.hp -= damage;
        }
    }

    deployCard(playerId, cardId, x, y) {
        const playerState = this.state[playerId];
        const unitStats = UNITS[cardId.toUpperCase()];

        if (!unitStats || playerState.mana < unitStats.cost) return;

        playerState.mana -= unitStats.cost;

        if (unitStats.type === 'spell') {
            if (cardId === 'fireball') {
                // Determine enemy ID
                const enemyId = playerId === 'p1' ? 'p2' : 'p1';
                const enemyUnits = this.state[enemyId].units;
                this.dealSplashDamage(x, y, unitStats.radius, unitStats.damage, enemyId, enemyUnits);
            }
        } else {
            const count = unitStats.count || 1;
            for (let i = 0; i < count; i++) {
                const offsetX = count > 1 ? (Math.random() - 0.5) * 1.5 : 0;
                const offsetY = count > 1 ? (Math.random() - 0.5) * 1.5 : 0;

                playerState.units.push({
                    ...unitStats,
                    cardId: cardId, // Explicitly store cardId for rendering
                    id: `${cardId}_${Date.now()}_${i}`,
                    x: Math.max(0, Math.min(GAME_CONFIG.FIELD_WIDTH, x + offsetX)),
                    y: Math.max(0, Math.min(GAME_CONFIG.FIELD_HEIGHT, y + offsetY)),
                    hp: unitStats.hp,
                    maxHp: unitStats.hp,
                    attackTimer: 0,
                });
            }
        }

        // Cycle Card
        const idx = playerState.hand.indexOf(cardId);
        if (idx !== -1) {
            playerState.hand[idx] = playerState.nextCard;
            const randomCard = playerState.deck[Math.floor(Math.random() * playerState.deck.length)];
            playerState.nextCard = randomCard;
        }
    }

    spawnUnit(playerState, unitId, x, y) {
        const unitStats = UNITS[unitId.toUpperCase()];
        if (!unitStats) return;

        playerState.units.push({
            ...unitStats,
            cardId: unitId,
            id: `${unitId}_${Date.now()}_${Math.random()}`,
            x: x,
            y: y,
            hp: unitStats.hp,
            maxHp: unitStats.hp,
            attackTimer: 0,
        });
    }
}

module.exports = GameEngine;
