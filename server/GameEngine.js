const { UNITS, EVOLVED_STATS, GAME_CONFIG } = require('./constants');
const User = require('./models/User');

class GameEngine {
    constructor(roomId, io) {
        this.roomId = roomId;
        this.io = io;
        this.logIdCounter = 0;
        this.state = {
            p1: {
                id: null,
                username: null,
                mana: 5,
                units: [],
                hp: 3000,
                deck: [],
                hand: [],
                nextCard: null,
                evolutions: [],
            },
            p2: {
                id: null,
                username: null,
                mana: 5,
                units: [],
                hp: 3000,
                deck: [],
                hand: [],
                nextCard: null,
                evolutions: [],
            },
            projectiles: [],
            activeSpells: [],
            gameOver: false,
            winner: null,
        };
        this.interval = null;
        this.lastTime = Date.now();
        this.bot = null;
        this.botPlayerId = null;
        this.botDifficulty = 'medium';
    }

    joinGame(playerId, username = null) {
        if (!this.state.p1.id) {
            this.state.p1.id = playerId;
            this.state.p1.username = username;
            return 'p1';
        } else if (!this.state.p2.id) {
            this.state.p2.id = playerId;
            this.state.p2.username = username;
            return 'p2';
        }
        return null;
    }

    isFull() {
        return this.state.p1.id && this.state.p2.id;
    }

    setPlayerDeck(playerId, fullDeck) {
        if (this.state[playerId]) {
            // Client sends 8 cards: 6 regular + 2 evolutions
            // We'll treat all 8 as the deck for cycling, but mark the last 2 as evolutions
            this.state[playerId].deck = fullDeck;

            // Identify evolution cards (last 2)
            if (fullDeck.length >= 8) {
                this.state[playerId].evolutions = fullDeck.slice(6, 8);
            }

            // Initialize hand (first 4 cards)
            this.state[playerId].hand = fullDeck.slice(0, 4);
            this.state[playerId].nextCard = fullDeck[4] || fullDeck[0];
        }
    }

    setBot(botPlayerId, bot) {
        this.botPlayerId = botPlayerId;
        this.bot = bot;
        this.botDifficulty = bot.difficulty;
    }

    start() {
        this.lastTime = Date.now();
        this.interval = setInterval(() => {
            const now = Date.now();
            const dt = (now - this.lastTime) / 1000;
            this.lastTime = now;
            this.update(dt);
        }, 1000 / 60); // 60 FPS
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    getSerializableState() {
        return this.state;
    }

    update(dt) {
        if (this.state.gameOver) return;

        const now = Date.now();

        // Bot Update
        if (this.bot && this.botPlayerId && !this.state.gameOver) {
            this.bot.update(dt, this.state, this.botPlayerId, (cardId, x, y) => {
                this.deployCard(this.botPlayerId, cardId, x, y);
            });
        }

        // Regenerate Mana
        let botMultiplier = 1.0;
        switch (this.botDifficulty) {
            case 'easy': botMultiplier = 0.8; break;
            case 'medium': botMultiplier = 1.0; break;
            case 'hard': botMultiplier = 1.2; break;
            case 'impossible': botMultiplier = 2.0; break;
            default: botMultiplier = 1.0;
        }

        const p1Regen = (this.botPlayerId === 'p1' ? botMultiplier : 1.0) * GAME_CONFIG.MANA_REGEN_RATE * dt;
        const p2Regen = (this.botPlayerId === 'p2' ? botMultiplier : 1.0) * GAME_CONFIG.MANA_REGEN_RATE * dt;

        if (this.state.p1.mana < GAME_CONFIG.MAX_MANA) {
            this.state.p1.mana = Math.min(GAME_CONFIG.MAX_MANA, this.state.p1.mana + p1Regen);
        }
        if (this.state.p2.mana < GAME_CONFIG.MAX_MANA) {
            this.state.p2.mana = Math.min(GAME_CONFIG.MAX_MANA, this.state.p2.mana + p2Regen);
        }

        // Update Spells
        this.updateSpells(dt);

        // Move & Update Units
        this.updateUnits(this.state.p1, 1, dt, now);
        this.updateUnits(this.state.p2, -1, dt, now);

        // Update Projectiles
        this.updateProjectiles(dt, now);

        // Combat
        this.handleCombat(dt, now);

        // Check Win
        if (this.state.p1.hp <= 0) {
            this.endGame('p2');
        } else if (this.state.p2.hp <= 0) {
            this.endGame('p1');
        }

        this.io.to(this.roomId).emit('game_update', this.getSerializableState());
    }

    endGame(winnerId) {
        if (this.state.gameOver) return;
        this.state.gameOver = true;
        this.state.winner = winnerId === 'p1' ? 'Player 1' : 'Player 2';

        this.saveMatchHistory(winnerId);

        this.io.to(this.roomId).emit('game_over', { winner: this.state.winner });
        this.stop();
    }

    async saveMatchHistory(winnerId) {
        try {
            const p1 = this.state.p1;
            const p2 = this.state.p2;

            if (p1 && p1.username) {
                const result = winnerId === 'p1' ? 'win' : 'lose';
                const opponentName = p2 && p2.username ? p2.username : 'AI/Guest';

                await User.findOneAndUpdate(
                    { username: p1.username },
                    {
                        $push: {
                            matchHistory: {
                                result,
                                opponent: opponentName,
                                date: new Date(),
                                myDeck: p1.deck
                            }
                        }
                    }
                );
            }

            if (p2 && p2.username) {
                const result = winnerId === 'p2' ? 'win' : 'lose';
                const opponentName = p1 && p1.username ? p1.username : 'AI/Guest';

                await User.findOneAndUpdate(
                    { username: p2.username },
                    {
                        $push: {
                            matchHistory: {
                                result,
                                opponent: opponentName,
                                date: new Date(),
                                myDeck: p2.deck
                            }
                        }
                    }
                );
            }
        } catch (error) {
            console.error('Error saving match history:', error);
        }
    }

    updateSpells(dt) {
        this.state.activeSpells.forEach(spell => {
            spell.duration -= dt;

            if (spell.id === 'tornado') {
                const enemyId = spell.ownerId === 'p1' ? 'p2' : 'p1';
                const enemies = this.state[enemyId].units;
                enemies.forEach(u => {
                    if (u.type === 'building') return;

                    const dist = Math.hypot(u.x - spell.x, u.y - spell.y);
                    if (dist <= spell.radius) {
                        const angle = Math.atan2(spell.y - u.y, spell.x - u.x);
                        u.x += Math.cos(angle) * spell.pullForce * dt;
                        u.y += Math.sin(angle) * spell.pullForce * dt;

                        u.x = Math.max(0, Math.min(GAME_CONFIG.FIELD_WIDTH, u.x));
                        u.y = Math.max(0, Math.min(GAME_CONFIG.FIELD_HEIGHT, u.y));

                        u.hp -= spell.damagePerSecond * dt;
                    }
                });
            } else if (spell.id === 'heal') {
                const friends = this.state[spell.ownerId].units;
                friends.forEach(u => {
                    if (Math.hypot(u.x - spell.x, u.y - spell.y) <= spell.radius) {
                        u.hp = Math.min(u.maxHp, u.hp + spell.healPerSecond * dt);
                    }
                });
            } else if (spell.id === 'freeze') {
                const enemyId = spell.ownerId === 'p1' ? 'p2' : 'p1';
                const enemies = this.state[enemyId].units;

                enemies.forEach(u => {
                    if (Math.hypot(u.x - spell.x, u.y - spell.y) <= spell.radius) {
                        u.frozenUntil = Date.now() + 100;
                    }
                });

                const towerY = enemyId === 'p1' ? 0 : GAME_CONFIG.FIELD_HEIGHT;
                if (Math.hypot(5 - spell.x, towerY - spell.y) <= spell.radius) {
                    this.state[enemyId].frozenUntil = Date.now() + 100;
                }
            }
        });
        this.state.activeSpells = this.state.activeSpells.filter(s => s.duration > 0);
    }

    updateUnits(playerState, direction, dt, now) {
        playerState.units.forEach(unit => {
            const isFrozen = unit.frozenUntil && unit.frozenUntil > now;
            const isStunned = unit.stunnedUntil && unit.stunnedUntil > now;

            if (isFrozen || isStunned) return;

            let currentSpeed = unit.speed;
            let currentAttackSpeed = unit.attackSpeed;

            const rageSpell = this.state.activeSpells.find(s =>
                s.id === 'rage' &&
                s.ownerId === playerState.id &&
                Math.hypot(unit.x - s.x, unit.y - s.y) <= s.radius
            );

            if (rageSpell) {
                currentSpeed *= 1.35;
                currentAttackSpeed /= 1.35;
            }

            if (unit.type === 'building') {
                if (unit.lifetime !== undefined) {
                    unit.lifetime -= dt;
                    const decayAmount = (unit.maxHp / UNITS[unit.cardId.toUpperCase()].lifetime) * dt;
                    unit.hp -= decayAmount;
                    if (unit.lifetime <= 0) unit.hp = 0;
                }

                if (unit.manaProduction) {
                    unit.productionTimer = (unit.productionTimer || 0) + dt;
                    if (unit.productionTimer >= unit.productionInterval) {
                        unit.productionTimer = 0;
                        playerState.mana = Math.min(GAME_CONFIG.MAX_MANA, playerState.mana + unit.manaProduction);
                    }
                }

                if (unit.spawnUnit && unit.spawnInterval) {
                    unit.spawnTimer = (unit.spawnTimer || 0) + dt;
                    if (unit.spawnTimer >= unit.spawnInterval) {
                        unit.spawnTimer = 0;
                        const spawnCount = unit.spawnCount || 1;
                        for (let i = 0; i < spawnCount; i++) {
                            const offsetX = (Math.random() - 0.5) * 1.5;
                            const offsetY = (Math.random() - 0.5) * 1.5;
                            this.spawnUnit(playerState, unit.spawnUnit, unit.x + offsetX, unit.y + offsetY);
                        }
                    }
                }
                return;
            }

            if (!unit.target) {
                const targetTowerX = 5;
                const targetTowerY = direction > 0 ? GAME_CONFIG.FIELD_HEIGHT : 0;

                const dx = targetTowerX - unit.x;
                const dy = targetTowerY - unit.y;
                const distance = Math.hypot(dx, dy);

                if (distance > 0.1) {
                    unit.x += (dx / distance) * currentSpeed * dt;
                    unit.y += (dy / distance) * currentSpeed * dt;
                }
            }

            unit.currentAttackSpeed = currentAttackSpeed;
        });
    }

    updateProjectiles(dt, now) {
        this.state.projectiles.forEach(p => {
            if (p.type === 'log') {
                const moveDistance = p.speed * dt;
                p.distanceRemaining -= moveDistance;
                p.y += p.direction * moveDistance;

                const enemyId = p.ownerId === 'p1' ? 'p2' : 'p1';
                this.state[enemyId].units.forEach(u => {
                    if (u.type !== 'ground' && u.type !== 'both') return;
                    if (u.hitByLogIds && u.hitByLogIds.has(p.logId)) return;

                    const distX = Math.abs(u.x - p.x);
                    const distY = Math.abs(u.y - p.y);

                    if (distX <= p.width / 2 && distY <= p.width / 2) {
                        u.hp -= p.damage;
                        if (!u.hitByLogIds) u.hitByLogIds = new Set();
                        u.hitByLogIds.add(p.logId);
                        u.y += p.direction * p.knockback;
                        u.y = Math.max(0, Math.min(GAME_CONFIG.FIELD_HEIGHT, u.y));
                    }
                });

                if (p.distanceRemaining <= 0 || p.y < 0 || p.y > GAME_CONFIG.FIELD_HEIGHT) {
                    p.hit = true;
                }
            } else if (p.type === 'goblin_barrel') {
                const dx = p.targetX - p.x;
                const dy = p.targetY - p.y;
                const dist = Math.hypot(dx, dy);

                if (dist < 0.5) {
                    p.hit = true;
                    const playerState = this.state[p.ownerId];
                    for (let i = 0; i < p.spawnCount; i++) {
                        const offsetX = (Math.random() - 0.5) * 1.5;
                        const offsetY = (Math.random() - 0.5) * 1.5;
                        this.spawnUnit(playerState, p.spawnUnit, p.targetX + offsetX, p.targetY + offsetY);
                    }
                } else {
                    p.x += (dx / dist) * p.speed * dt;
                    p.y += (dy / dist) * p.speed * dt;
                }
            } else if (p.type === 'fireball') {
                const dx = p.targetX - p.x;
                const dy = p.targetY - p.y;
                const dist = Math.hypot(dx, dy);

                if (dist < 0.5) {
                    p.hit = true;
                    const enemyId = p.ownerId === 'p1' ? 'p2' : 'p1';
                    const enemyUnits = this.state[enemyId].units;
                    this.dealSplashDamage(p.targetX, p.targetY, p.radius, p.damage, enemyId, enemyUnits, false);
                } else {
                    p.x += (dx / dist) * p.speed * dt;
                    p.y += (dy / dist) * p.speed * dt;
                }
            } else {
                let target = null;
                if (p.targetId === 'tower_p1') {
                    target = { x: 5, y: 0, type: 'tower' };
                } else if (p.targetId === 'tower_p2') {
                    target = { x: 5, y: GAME_CONFIG.FIELD_HEIGHT, type: 'tower' };
                } else {
                    const p1Unit = this.state.p1.units.find(u => u.id === p.targetId);
                    const p2Unit = this.state.p2.units.find(u => u.id === p.targetId);
                    target = p1Unit || p2Unit;
                }

                let tx, ty;
                if (target) {
                    tx = target.x;
                    ty = target.y;
                } else {
                    tx = p.targetX;
                    ty = p.targetY;
                }

                const dx = tx - p.x;
                const dy = ty - p.y;
                const dist = Math.hypot(dx, dy);

                if (dist < 0.5) {
                    p.hit = true;
                    if (target) {
                        this.dealDamage(p.damage, target, p.targetPlayerId);
                        if (p.stunDuration && target.type !== 'tower') {
                            target.stunnedUntil = now + p.stunDuration * 1000;
                        }
                    }
                } else {
                    p.x += (dx / dist) * p.speed * dt;
                    p.y += (dy / dist) * p.speed * dt;
                }
            }
        });
        this.state.projectiles = this.state.projectiles.filter(p => !p.hit);
    }

    handleCombat(dt, now) {
        const p1Units = this.state.p1.units;
        const p2Units = this.state.p2.units;

        const findTarget = (u, enemies, enemyTowerY, enemyTowerId) => {
            let target = null;
            let minDist = Infinity;

            const potentialTargets = enemies.filter(e => {
                if (e.type === 'flying' && u.type === 'ground' && u.range < 2) return false;
                if (u.favoriteTarget && u.favoriteTarget !== e.type) return false;
                return true;
            });

            const targetsToCheck = u.favoriteTarget ? potentialTargets : enemies.filter(e => {
                if (e.type === 'flying' && u.type === 'ground' && u.range < 2) return false;
                return true;
            });

            targetsToCheck.forEach(e => {
                const dist = Math.hypot(u.x - e.x, u.y - e.y);
                if (dist <= u.range && dist < minDist) {
                    minDist = dist;
                    target = e;
                }
            });

            if (!target && u.type !== 'building') {
                if (!u.favoriteTarget || u.favoriteTarget === 'building') {
                    const distToTowerCenter = Math.hypot(u.x - 5, u.y - enemyTowerY);
                    if (distToTowerCenter <= u.range) {
                        target = { type: 'tower', y: enemyTowerY, x: 5, id: enemyTowerId };
                    }
                }
            }
            return target;
        };

        p1Units.forEach(u1 => {
            if ((u1.frozenUntil && u1.frozenUntil > now) || (u1.stunnedUntil && u1.stunnedUntil > now)) return;

            u1.target = findTarget(u1, p2Units, GAME_CONFIG.FIELD_HEIGHT, 'tower_p2');
            if (u1.target) {
                u1.attackTimer = (u1.attackTimer || 0) + dt;
                const attackSpeed = u1.currentAttackSpeed || u1.attackSpeed;
                if (u1.attackTimer >= attackSpeed) {
                    u1.attackTimer = 0;
                    this.performAttack(u1, u1.target, 'p2', p2Units);
                }
            }
        });

        p2Units.forEach(u2 => {
            if ((u2.frozenUntil && u2.frozenUntil > now) || (u2.stunnedUntil && u2.stunnedUntil > now)) return;

            u2.target = findTarget(u2, p1Units, 0, 'tower_p1');
            if (u2.target) {
                u2.attackTimer = (u2.attackTimer || 0) + dt;
                const attackSpeed = u2.currentAttackSpeed || u2.attackSpeed;
                if (u2.attackTimer >= attackSpeed) {
                    u2.attackTimer = 0;
                    this.performAttack(u2, u2.target, 'p1', p1Units);
                }
            }
        });

        this.towerAttack(this.state.p1, p2Units, 5, 0, dt, 'tower_p1');
        this.towerAttack(this.state.p2, p1Units, 5, GAME_CONFIG.FIELD_HEIGHT, dt, 'tower_p2');

        const handleDeath = (u, playerId) => {
            if (u.hp <= 0) {
                if (u.deathDamage) {
                    const enemyId = playerId === 'p1' ? 'p2' : 'p1';
                    const enemyUnits = this.state[enemyId].units;
                    this.dealSplashDamage(u.x, u.y, u.deathDamageRadius, u.deathDamage, enemyId, enemyUnits);
                }
                return false;
            }
            return true;
        };

        this.state.p1.units = this.state.p1.units.filter(u => handleDeath(u, 'p1'));
        this.state.p2.units = this.state.p2.units.filter(u => handleDeath(u, 'p2'));
    }

    performAttack(attacker, target, targetPlayerId, enemyUnits) {
        if (attacker.projectile) {
            this.state.projectiles.push({
                x: attacker.x,
                y: attacker.y,
                targetId: target.id || (target.type === 'tower' ? (target.y === 0 ? 'tower_p1' : 'tower_p2') : null),
                targetX: target.x,
                targetY: target.y,
                damage: attacker.damage,
                speed: attacker.projectileSpeed,
                type: attacker.projectile,
                targetPlayerId: targetPlayerId,
                ownerId: attacker.ownerId,
                stunDuration: attacker.stunDuration || 0,
            });
        } else if (attacker.selfDestruct) {
            attacker.hp = 0;
            this.dealSplashDamage(attacker.x, attacker.y, attacker.splash, attacker.damage, targetPlayerId, enemyUnits);
        } else if (attacker.splash) {
            this.dealSplashDamage(target.x, target.y, attacker.splash, attacker.damage, targetPlayerId, enemyUnits);
        } else {
            this.dealDamage(attacker.damage, target, targetPlayerId);
        }
    }

    dealSplashDamage(x, y, radius, damage, targetPlayerId, enemyUnits, canHitTower = true) {
        enemyUnits.forEach(u => {
            if (Math.hypot(u.x - x, u.y - y) <= radius) {
                u.hp -= damage;
            }
        });

        if (canHitTower) {
            const towerY = targetPlayerId === 'p1' ? 0 : GAME_CONFIG.FIELD_HEIGHT;
            if (Math.hypot(5 - x, towerY - y) <= radius) {
                this.state[targetPlayerId].hp -= damage;
            }
        }
    }

    towerAttack(ownerState, enemyUnits, towerX, towerY, dt, towerId) {
        if (ownerState.frozenUntil && ownerState.frozenUntil > Date.now()) return;

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
                this.state.projectiles.push({
                    x: towerX,
                    y: towerY,
                    targetId: target.id,
                    targetX: target.x,
                    targetY: target.y,
                    damage: towerStats.damage,
                    speed: 15,
                    type: 'arrow',
                    targetPlayerId: ownerState.id === this.state.p1.id ? 'p2' : 'p1',
                    ownerId: ownerState.id
                });
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
        let unitStats = UNITS[cardId.toUpperCase()];

        if (!unitStats || playerState.mana < unitStats.cost) return;

        const isEvolved = playerState.evolutions.includes(cardId);
        if (isEvolved && EVOLVED_STATS[cardId.toUpperCase()]) {
            unitStats = {
                ...unitStats,
                ...EVOLVED_STATS[cardId.toUpperCase()],
                id: unitStats.id,
                name: unitStats.name + ' ⭐',
            };
        }

        if (cardId === 'mana_collector') {
            const collectorCount = playerState.units.filter(u => u.cardId === 'mana_collector').length;
            if (collectorCount >= 3) return;
        }

        playerState.mana -= unitStats.cost;

        if (unitStats.type === 'spell') {
            if (cardId === 'fireball') {
                this.state.projectiles.push({
                    x: playerId === 'p1' ? 5 : 5,
                    y: playerId === 'p1' ? 0 : GAME_CONFIG.FIELD_HEIGHT,
                    targetX: x,
                    targetY: y,
                    type: 'fireball',
                    ownerId: playerId,
                    speed: unitStats.speed,
                    damage: unitStats.damage,
                    radius: unitStats.radius,
                });
            } else if (cardId === 'log') {
                const direction = playerId === 'p1' ? 1 : -1;
                this.state.projectiles.push({
                    x: x,
                    y: y,
                    type: 'log',
                    ownerId: playerId,
                    speed: unitStats.speed,
                    damage: unitStats.damage,
                    width: unitStats.width,
                    range: unitStats.range,
                    knockback: unitStats.knockback,
                    direction: direction,
                    distanceRemaining: unitStats.range,
                    logId: this.logIdCounter++,
                });
            } else if (cardId === 'goblin_barrel') {
                this.state.projectiles.push({
                    x: playerId === 'p1' ? 5 : 5,
                    y: playerId === 'p1' ? 0 : GAME_CONFIG.FIELD_HEIGHT,
                    targetX: x,
                    targetY: y,
                    type: 'goblin_barrel',
                    ownerId: playerId,
                    speed: unitStats.speed,
                    spawnUnit: unitStats.spawnUnit,
                    spawnCount: unitStats.spawnCount,
                });
            } else if (['tornado', 'rage', 'heal', 'freeze'].includes(cardId)) {
                this.state.activeSpells.push({
                    ...unitStats,
                    x: x,
                    y: y,
                    ownerId: playerId,
                    duration: unitStats.duration,
                });
            }
        } else {
            const count = unitStats.count || 1;
            for (let i = 0; i < count; i++) {
                const offsetX = count > 1 ? (Math.random() - 0.5) * 1.5 : 0;
                const offsetY = count > 1 ? (Math.random() - 0.5) * 1.5 : 0;

                playerState.units.push({
                    ...unitStats,
                    cardId: cardId,
                    id: `${cardId}_${Date.now()}_${i}`,
                    x: Math.max(0, Math.min(GAME_CONFIG.FIELD_WIDTH, x + offsetX)),
                    y: Math.max(0, Math.min(GAME_CONFIG.FIELD_HEIGHT, y + offsetY)),
                    hp: unitStats.hp,
                    maxHp: unitStats.hp,
                    attackTimer: 0,
                    ownerId: playerId,
                    isEvolved: isEvolved,
                });
            }
        }

        // Cycle Card
        const idx = playerState.hand.indexOf(cardId);
        if (idx !== -1) {
            const isMaxCollectors = cardId === 'mana_collector' &&
                playerState.units.filter(u => u.cardId === 'mana_collector').length >= 3;

            let nextCardToUse = playerState.nextCard;

            if (nextCardToUse === 'mana_collector' && isMaxCollectors) {
                const availableCards = playerState.deck.filter(c => c !== 'mana_collector');
                if (availableCards.length > 0) {
                    nextCardToUse = availableCards[Math.floor(Math.random() * availableCards.length)];
                }
            }

            playerState.hand[idx] = nextCardToUse;

            let newNextCard;
            const collectorCount = playerState.units.filter(u => u.cardId === 'mana_collector').length;

            if (collectorCount >= 3) {
                const availableCards = playerState.deck.filter(c => c !== 'mana_collector');
                if (availableCards.length > 0) {
                    newNextCard = availableCards[Math.floor(Math.random() * availableCards.length)];
                } else {
                    newNextCard = playerState.deck[Math.floor(Math.random() * playerState.deck.length)];
                }
            } else {
                newNextCard = playerState.deck[Math.floor(Math.random() * playerState.deck.length)];
            }

            playerState.nextCard = newNextCard;
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
            ownerId: playerState.id,
        });
    }
}

module.exports = GameEngine;
