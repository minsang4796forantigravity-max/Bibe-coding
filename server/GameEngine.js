const { UNITS, EVOLVED_STATS, GAME_CONFIG } = require('./constants');

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
                deck: [],
                hand: [],
                nextCard: null,
                evolutions: [], // 진화 카드 목록
            },
            p2: {
                id: null,
                mana: 5,
                units: [],
                hp: 3000,
                deck: [],
                hand: [],
                nextCard: null,
                evolutions: [], // 진화 카드 목록
            },
            projectiles: [],
            activeSpells: [],
            gameOver: false,
            winner: null,
        };
        this.interval = null;
        this.lastTime = Date.now();
    }

    addPlayer(socketId, selectedDeck) {
        if (!this.state.p1.id) {
            this.state.p1.id = socketId;
            if (selectedDeck && selectedDeck.length === 9) {
                // 덱 구조: [card1, card2, ..., card7, evo1, evo2]
                const regularCards = selectedDeck.slice(0, 7);
                const evolutionCards = selectedDeck.slice(7, 9);

                this.state.p1.deck = regularCards;
                this.state.p1.evolutions = evolutionCards;
                this.state.p1.hand = regularCards.slice(0, 6); // 6장 핸드
                this.state.p1.nextCard = regularCards[6];
            }
            return 'p1';
        } else if (!this.state.p2.id) {
            this.state.p2.id = socketId;
            if (selectedDeck && selectedDeck.length === 9) {
                // 덱 구조: [card1, card2, ..., card7, evo1, evo2]
                const regularCards = selectedDeck.slice(0, 7);
                const evolutionCards = selectedDeck.slice(7, 9);

                this.state.p2.deck = regularCards;
                this.state.p2.evolutions = evolutionCards;
                this.state.p2.hand = regularCards.slice(0, 6); // 6장 핸드
                this.state.p2.nextCard = regularCards[6];
            }
            return 'p2';
        }
        return null;
    }

    start() {
        this.lastTime = Date.now();
        this.interval = setInterval(() => this.loop(), 1000 / GAME_CONFIG.FPS);
    }

    getSerializableState() {
        const stateCopy = {
            p1: {
                ...this.state.p1,
                units: this.state.p1.units.map(u => ({
                    ...u,
                    target: undefined,
                }))
            },
            p2: {
                ...this.state.p2,
                units: this.state.p2.units.map(u => ({
                    ...u,
                    target: undefined,
                }))
            },
            projectiles: this.state.projectiles,
            activeSpells: this.state.activeSpells,
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
        this.io.to(this.roomId).emit('game_update', this.getSerializableState());
    }

    update(dt) {
        // Regenerate Mana
        if (this.state.p1.mana < GAME_CONFIG.MAX_MANA) {
            this.state.p1.mana = Math.min(GAME_CONFIG.MAX_MANA, this.state.p1.mana + GAME_CONFIG.MANA_REGEN_RATE * dt);
        }
        if (this.state.p2.mana < GAME_CONFIG.MAX_MANA) {
            this.state.p2.mana = Math.min(GAME_CONFIG.MAX_MANA, this.state.p2.mana + GAME_CONFIG.MANA_REGEN_RATE * dt);
        }

        // Update Spells
        this.updateSpells(dt);

        // Move & Update Units
        this.updateUnits(this.state.p1, 1, dt);
        this.updateUnits(this.state.p2, -1, dt);

        // Update Projectiles
        this.updateProjectiles(dt);

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

    updateSpells(dt) {
        this.state.activeSpells.forEach(spell => {
            spell.duration -= dt;

            if (spell.id === 'tornado') {
                const enemyId = spell.ownerId === 'p1' ? 'p2' : 'p1';
                const enemies = this.state[enemyId].units;
                enemies.forEach(u => {
                    if (u.type === 'building') return; // Don't pull buildings

                    const dist = Math.hypot(u.x - spell.x, u.y - spell.y);
                    if (dist <= spell.radius) {
                        const angle = Math.atan2(spell.y - u.y, spell.x - u.x);
                        u.x += Math.cos(angle) * spell.pullForce * dt;
                        u.y += Math.sin(angle) * spell.pullForce * dt;

                        // Clamp to field
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
            }
        });
        this.state.activeSpells = this.state.activeSpells.filter(s => s.duration > 0);
    }

    updateUnits(playerState, direction, dt) {
        playerState.units.forEach(unit => {
            // Apply Rage
            let currentSpeed = unit.speed;
            let currentAttackSpeed = unit.attackSpeed;

            const rageSpell = this.state.activeSpells.find(s =>
                s.id === 'rage' && s.ownerId === playerState.id &&
                Math.hypot(unit.x - s.x, unit.y - s.y) <= s.radius
            );

            if (rageSpell) {
                currentSpeed *= rageSpell.speedBuff;
                currentAttackSpeed /= rageSpell.attackSpeedBuff;
            }

            // Spawner Logic
            if (unit.spawnUnit) {
                unit.spawnTimer = (unit.spawnTimer || 0) + dt;
                if (unit.spawnTimer >= unit.spawnInterval) {
                    unit.spawnTimer = 0;
                    const count = unit.spawnCount || 1;
                    for (let i = 0; i < count; i++) {
                        this.spawnUnit(playerState, unit.spawnUnit, unit.x, unit.y);
                    }
                }
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
                return;
            }

            // Unit Movement
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

            // Store modified attackSpeed for combat
            unit.currentAttackSpeed = currentAttackSpeed;
        });
    }

    updateProjectiles(dt) {
        this.state.projectiles.forEach(p => {
            let target = null;
            if (p.targetId === 'tower_p1') {
                target = { x: 5, y: 0, type: 'tower' };
            } else if (p.targetId === 'tower_p2') {
                target = { x: 5, y: GAME_CONFIG.FIELD_HEIGHT, type: 'tower' };
            } else {
                // Find unit
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
                }
            } else {
                p.x += (dx / dist) * p.speed * dt;
                p.y += (dy / dist) * p.speed * dt;
            }
        });
        this.state.projectiles = this.state.projectiles.filter(p => !p.hit);
    }

    handleCombat(dt) {
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

        // P1 Units
        p1Units.forEach(u1 => {
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

        // P2 Units
        p2Units.forEach(u2 => {
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

        // Tower Attacks
        this.towerAttack(this.state.p1, p2Units, 5, 0, dt, 'tower_p1');
        this.towerAttack(this.state.p2, p1Units, 5, GAME_CONFIG.FIELD_HEIGHT, dt, 'tower_p2');

        // Cleanup & Death Damage
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
                ownerId: attacker.ownerId
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
                // Tower projectile? For now instant, or add projectile to tower too?
                // User asked for "shooting guys". Tower shoots too.
                // Let's add projectile to tower.
                this.state.projectiles.push({
                    x: towerX,
                    y: towerY,
                    targetId: target.id,
                    targetX: target.x,
                    targetY: target.y,
                    damage: towerStats.damage,
                    speed: 15,
                    type: 'arrow', // Tower shoots arrows
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

        // 진화 카드인지 확인하고 진화 스탯 적용
        const isEvolved = playerState.evolutions.includes(cardId);
        if (isEvolved && EVOLVED_STATS[cardId.toUpperCase()]) {
            // 기본 스탯과 진화 스탯 병합
            unitStats = {
                ...unitStats,
                ...EVOLVED_STATS[cardId.toUpperCase()],
                id: unitStats.id, // ID는 유지
                name: unitStats.name + ' ⭐', // 진화 표시
            };
        }

        if (cardId === 'mana_collector') {
            const collectorCount = playerState.units.filter(u => u.cardId === 'mana_collector').length;
            if (collectorCount >= 3) return;
        }

        playerState.mana -= unitStats.cost;

        if (unitStats.type === 'spell') {
            if (cardId === 'fireball') {
                const enemyId = playerId === 'p1' ? 'p2' : 'p1';
                const enemyUnits = this.state[enemyId].units;
                this.dealSplashDamage(x, y, unitStats.radius, unitStats.damage, enemyId, enemyUnits, false);
            } else if (['tornado', 'rage', 'heal'].includes(cardId)) {
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
                    isEvolved: isEvolved, // 진화 여부 추가
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
