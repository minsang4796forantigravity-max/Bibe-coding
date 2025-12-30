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
            matchTime: GAME_CONFIG.MATCH_DURATION || 90,
            isOvertime: false,
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
        // Handle reconnection: Check if username already exists in game
        if (username && username !== 'Guest') {
            if (this.state.p1.username === username) {
                console.log(`[GameEngine] Player 1 (${username}) reconnecting with socket ${playerId}`);
                this.state.p1.id = playerId;
                return 'p1';
            }
            if (this.state.p2.username === username) {
                console.log(`[GameEngine] Player 2 (${username}) reconnecting with socket ${playerId}`);
                this.state.p2.id = playerId;
                return 'p2';
            }
        }

        // Normal join
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

    reconnectPlayer(username, newId) {
        if (!username || username === 'Guest') return false;
        if (this.state.p1.username === username) {
            this.state.p1.id = newId;
            return true;
        }
        if (this.state.p2.username === username) {
            this.state.p2.id = newId;
            return true;
        }
        return false;
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

            // Initialize hand (first 6 cards)
            this.state[playerId].hand = fullDeck.slice(0, 6);
            this.state[playerId].nextCard = fullDeck[6] || fullDeck[0];
        }
    }

    setBot(botPlayerId, bot) {
        this.botPlayerId = botPlayerId;
        this.bot = bot;
        this.botDifficulty = bot.difficulty;
    }

    start() {
        this.lastTime = Date.now();

        // Initialize Towers
        this.initTowers('p1');
        this.initTowers('p2');

        this.interval = setInterval(() => {
            const now = Date.now();
            const dt = (now - this.lastTime) / 1000;
            this.lastTime = now;
            this.update(dt);
        }, 1000 / 60); // 60 FPS
    }

    initTowers(playerId) {
        const isP1 = playerId === 'p1';
        const yBase = isP1 ? 1.5 : 16.5; // Moved princess towers forward
        const kingY = isP1 ? 0.5 : 17.5; // Moved king tower slightly forward

        // King Tower
        this.spawnUnit(this.state[playerId], 'king_tower', 5, kingY);

        // Princess Towers (Wider spacing)
        this.spawnUnit(this.state[playerId], 'side_tower', 1.5, yBase);
        this.spawnUnit(this.state[playerId], 'side_tower', 8.5, yBase);
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    getSerializableState() {
        // Deep clone state and remove circular references
        const serializeUnits = (units) => {
            return units.map(unit => {
                const { target, hitByLogIds, ...cleanUnit } = unit;
                // Only include target ID if it exists, not the full object
                if (target) {
                    cleanUnit.targetId = target.id || null;
                }
                return cleanUnit;
            });
        };

        return {
            p1: {
                ...this.state.p1,
                units: serializeUnits(this.state.p1.units),
            },
            p2: {
                ...this.state.p2,
                units: serializeUnits(this.state.p2.units),
            },
            projectiles: this.state.projectiles,
            activeSpells: this.state.activeSpells,
            matchTime: this.state.matchTime,
            isOvertime: this.state.isOvertime,
            gameOver: this.state.gameOver,
            winner: this.state.winner,
        };
    }

    update(dt) {
        if (this.state.gameOver) return;

        const now = Date.now();

        // Match Timer & Overtime Logic
        this.state.matchTime -= dt;
        if (this.state.matchTime <= 0) {
            if (!this.state.isOvertime) {
                const p1Towers = this.state.p1.units.filter(u => u.cardId === 'king_tower' || u.cardId === 'side_tower').length;
                const p2Towers = this.state.p2.units.filter(u => u.cardId === 'king_tower' || u.cardId === 'side_tower').length;

                if (p1Towers === p2Towers) {
                    this.state.isOvertime = true;
                    this.state.matchTime = GAME_CONFIG.OVERTIME_DURATION || 30;
                } else {
                    const winnerId = p1Towers > p2Towers ? 'p1' : 'p2';
                    this.endGame(winnerId);
                }
            } else {
                this.handleSuddenDeath();
            }
        }

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
            case 'hard': botMultiplier = 1.2; break;
            case 'impossible': botMultiplier = 2.0; break;
            default: botMultiplier = 1.0;
        }

        const isDoubleElixir = this.state.isOvertime || this.state.matchTime <= (GAME_CONFIG.DOUBLE_ELIXIR_TIME || 30);
        const otMultiplier = isDoubleElixir ? 2.0 : 1.0;
        const p1Regen = (this.botPlayerId === 'p1' ? botMultiplier : 1.0) * GAME_CONFIG.MANA_REGEN_RATE * otMultiplier * dt;
        const p2Regen = (this.botPlayerId === 'p2' ? botMultiplier : 1.0) * GAME_CONFIG.MANA_REGEN_RATE * otMultiplier * dt;

        this.state.p1.mana = Math.min(GAME_CONFIG.MAX_MANA, this.state.p1.mana + p1Regen);
        this.state.p2.mana = Math.min(GAME_CONFIG.MAX_MANA, this.state.p2.mana + p2Regen);

        // Update Spells
        this.updateSpells(dt);

        // Move & Update Units
        this.updateUnits(this.state.p1, 1, dt, now);
        this.updateUnits(this.state.p2, -1, dt, now);

        // Update Projectiles
        this.updateProjectiles(dt, now);

        // Combat
        this.handleCombat(dt, now);

        // Note: King Tower destruction checked in dealDamage
        // Match Timer check already handled above

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

    calculateRatingChange(myRating, opponentRating, result, isNewPlayer = false) {
        // K-factor: New players (first 20 games) get K=64 for faster placement
        const K = isNewPlayer ? 64 : 32;

        // Expected score based on rating difference
        const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - myRating) / 400));

        // Actual score (1 for win, 0 for loss, 0.5 for draw - though not currently in game)
        const actualScore = result === 'win' ? 1 : 0;

        // Base rating change
        let ratingChange = Math.round(K * (actualScore - expectedScore));

        // Minimum change: Ensure winning always gives some points, and losing always costs some
        if (result === 'win' && ratingChange < 2) {
            ratingChange = 2;
        } else if (result === 'lose' && ratingChange > -2) {
            ratingChange = -2;
        }

        return ratingChange;
    }

    async saveMatchHistory(winnerId) {
        try {
            const p1 = this.state.p1;
            const p2 = this.state.p2;

            // Fetch actual user data to get accurate ratings and game counts
            let p1Rating = 1000, p2Rating = 1000;
            let p1Games = 0, p2Games = 0;

            if (p1 && p1.username) {
                const p1User = await User.findOne({ username: p1.username });
                if (p1User) {
                    p1Rating = p1User.rating || 1000;
                    p1Games = p1User.matchHistory ? p1User.matchHistory.length : 0;
                }
            }

            if (p2 && p2.username) {
                const p2User = await User.findOne({ username: p2.username });
                if (p2User) {
                    p2Rating = p2User.rating || 1000;
                    p2Games = p2User.matchHistory ? p2User.matchHistory.length : 0;
                }
            }

            // AI Virtual Ratings Map
            const aiRatings = {
                easy: 600,
                medium: 1000,
                hard: 1400,
                impossible: 1800
            };

            // Update Player 1
            if (p1 && p1.username) {
                const result = winnerId === 'p1' ? 'win' : 'lose';
                const opponentName = p2 && p2.username ? p2.username : 'AI';

                let aiDifficulty = null;
                const isAI = opponentName === 'AI';
                if (isAI && this.botPlayerId === 'p2') {
                    aiDifficulty = this.botDifficulty || 'medium';
                }

                // Use virtual rating for AI, actual for PvP
                const opponentRatingValue = isAI ? (aiRatings[aiDifficulty] || 1000) : p2Rating;
                const ratingChange = this.calculateRatingChange(
                    p1Rating,
                    opponentRatingValue,
                    result,
                    p1Games < 20 // isNewPlayer
                );

                await User.findOneAndUpdate(
                    { username: p1.username },
                    {
                        $inc: {
                            rating: ratingChange,
                            coins: result === 'win' ? 50 : 10
                        },
                        $push: {
                            matchHistory: {
                                result,
                                opponent: opponentName,
                                aiDifficulty,
                                date: new Date(),
                                myDeck: p1.deck,
                                ratingChange
                            }
                        }
                    }
                );
            }

            // Update Player 2
            if (p2 && p2.username) {
                const result = winnerId === 'p2' ? 'win' : 'lose';
                const opponentName = p1 && p1.username ? p1.username : 'AI';

                // Determine AI difficulty
                let aiDifficulty = null;
                const isAI = opponentName === 'AI';
                if (isAI && this.botPlayerId === 'p1') {
                    aiDifficulty = this.botDifficulty || 'medium';
                }

                const opponentRatingValue = isAI ? (aiRatings[aiDifficulty] || 1000) : p1Rating;
                const ratingChange = this.calculateRatingChange(
                    p2Rating,
                    opponentRatingValue,
                    result,
                    p2Games < 20 // isNewPlayer
                );

                await User.findOneAndUpdate(
                    { username: p2.username },
                    {
                        $inc: {
                            rating: ratingChange,
                            coins: result === 'win' ? 50 : 10
                        },
                        $push: {
                            matchHistory: {
                                result,
                                opponent: opponentName,
                                aiDifficulty,
                                date: new Date(),
                                myDeck: p2.deck,
                                ratingChange
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

                        // Use dealDamage to handle shield
                        this.dealDamage(spell.damagePerSecond * dt, u, enemyId);
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

            // Process Status Effects (Burn/Curse)
            if (unit.statusEffects) {
                unit.statusEffects.forEach(effect => {
                    effect.duration -= dt;
                    if (effect.type === 'burn') {
                        this.dealDamage(effect.dps * dt, unit, playerState.id);
                    }
                });
                unit.statusEffects = unit.statusEffects.filter(e => e.duration > 0);
            }

            let currentSpeed = unit.speed;
            let currentAttackSpeed = unit.attackSpeed;

            // Apply Curse Slow
            const curse = unit.statusEffects?.find(e => e.type === 'curse');
            if (curse) {
                currentSpeed *= (1 - curse.slow);
                currentAttackSpeed *= (1 + curse.slow);
            }

            // Brotherhood Logic (Barbarians)
            if (unit.brotherhood) {
                const teammates = playerState.units.filter(u => u.id !== unit.id && Math.hypot(u.x - unit.x, u.y - unit.y) < 3);
                const boost = Math.min(0.5, teammates.length * 0.1);
                currentAttackSpeed /= (1 + boost);
            }

            const rageSpell = this.state.activeSpells.find(s =>
                s.id === 'rage' &&
                s.ownerId === playerState.id &&
                Math.hypot(unit.x - s.x, unit.y - s.y) <= s.radius
            );

            if (rageSpell) {
                currentSpeed *= 1.35;
                currentAttackSpeed /= 1.35;
            }

            if (unit.type === 'building' || unit.type === 'egg') {
                if (unit.lifetime !== undefined) {
                    unit.lifetime -= dt;

                    if (unit.type === 'building') {
                        const decayAmount = (unit.maxHp / UNITS[unit.cardId.toUpperCase()].lifetime) * dt;
                        unit.hp -= decayAmount;
                    }

                    if (unit.lifetime <= 0) {
                        unit.hp = 0;
                        if (unit.type === 'egg') {
                            this.hatchEgg(playerState, unit);
                        }
                    }
                }

                if (unit.manaProduction) {
                    // ... code continues
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

                            let spawnId = unit.spawnUnit;
                            if (spawnId === 'egg_random') {
                                // Pick random egg Tier 1-3
                                const tiers = ['egg_1', 'egg_2', 'egg_3'];
                                spawnId = tiers[Math.floor(Math.random() * tiers.length)];
                            }

                            this.spawnUnit(playerState, spawnId, unit.x + offsetX, unit.y + offsetY);
                        }
                    }
                }
                return;
            }

            // Charge Logic
            if (unit.canCharge) {
                if (!unit.target) {
                    unit.chargeTimer = (unit.chargeTimer || 0) + dt;
                    if (unit.chargeTimer >= 2.0) {
                        unit.isCharging = true;
                        currentSpeed *= 1.5;
                    }
                } else {
                    // Stop charging when target acquired (handled in performAttack)
                }
            }

            if (!unit.target) {
                // Bridge logic: Units must cross the river via bridges
                const riverY = GAME_CONFIG.FIELD_HEIGHT / 2;
                const isAcross = direction > 0 ? (unit.y > riverY) : (unit.y < riverY);

                let targetX = 5;
                let targetY = direction > 0 ? GAME_CONFIG.FIELD_HEIGHT : 0;

                // If not yet across the river, target the nearest bridge
                if (!isAcross) {
                    const riverTargetY = riverY + (direction * 0.5);
                    if (direction > 0 ? (unit.y < riverY - 0.5) : (unit.y > riverY + 0.5)) {
                        // Find nearest bridge visual center
                        const bridgeX = unit.x < 5 ? 2.0 : 8.0;
                        targetX = bridgeX;
                        targetY = riverTargetY;
                    }
                }

                const dx = targetX - unit.x;
                const dy = targetY - unit.y;
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
                        this.dealDamage(p.damage, u, enemyId);
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
                if (p.targetId === 'tower_p1' || p.targetId === 'tower_p2') {
                    // Try to find the actual King Tower unit for this player
                    const targetPlayerId = p.targetId === 'tower_p1' ? 'p1' : 'p2';
                    target = this.state[targetPlayerId].units.find(u => u.cardId === 'king_tower') ||
                        { x: 5, y: targetPlayerId === 'p1' ? 0 : GAME_CONFIG.FIELD_HEIGHT, hp: 1, type: 'tower' }; // Fallback dummy with hp
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

            const targetsToCheck = enemies.filter(e => {
                // 1. Targeting system check (Air/Ground)
                if (u.targets === 'ground' && e.type === 'flying') return false;
                if (u.targets === 'air' && e.type !== 'flying') return false;

                // 2. Favorite target check
                if (u.favoriteTarget && u.favoriteTarget !== e.type) return false;

                // 3. Range check (legacy fallback)
                if (e.type === 'flying' && u.type === 'ground' && u.range < 2 && u.targets !== 'both') return false;

                return true;
            });

            targetsToCheck.forEach(e => {
                const dist = Math.hypot(u.x - e.x, u.y - e.y);
                // Target prioritization logic: subtract weight from side towers to make them "appear" closer
                let weight = dist;
                if (e.cardId === 'side_tower') {
                    weight -= 100; // Large negative weight ensures side towers are prioritized over King Tower
                }

                if (dist <= u.range && weight < minDist) {
                    minDist = weight;
                    target = e;
                }
            });

            if (!target) {
                if (!u.favoriteTarget || u.favoriteTarget === 'building') {
                    // Towers are buildings
                    if (u.targets === 'ground' || u.targets === 'both') {
                        const distToTowerCenter = Math.hypot(u.x - 5, u.y - enemyTowerY);
                        if (distToTowerCenter <= u.range) {
                            target = { type: 'tower', y: enemyTowerY, x: 5, id: enemyTowerId };
                        }
                    }
                }
            }
            return target;
        };

        p1Units.forEach(u1 => {
            if ((u1.frozenUntil && u1.frozenUntil > now) || (u1.stunnedUntil && u1.stunnedUntil > now)) return;

            u1.target = findTarget(u1, p2Units, GAME_CONFIG.FIELD_HEIGHT, 'tower_p2');
            if (u1.target) {
                // King Tower wake-up logic: attack if a side tower is down OR if it has taken damage
                if (u1.cardId === 'king_tower') {
                    const enemySideTowers = p2Units.filter(u => u.cardId === 'side_tower').length;
                    const hasTakenDamage = u1.hp < u1.maxHp;
                    if (enemySideTowers >= 2 && !hasTakenDamage) return; // Stay sleepy
                }

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
                // King Tower wake-up logic: attack if a side tower is down OR taken damage
                if (u2.cardId === 'king_tower') {
                    const enemySideTowers = p1Units.filter(u => u.cardId === 'side_tower').length;
                    const hasTakenDamage = u2.hp < u2.maxHp;
                    if (enemySideTowers >= 2 && !hasTakenDamage) return; // Stay sleepy
                }

                u2.attackTimer = (u2.attackTimer || 0) + dt;
                const attackSpeed = u2.currentAttackSpeed || u2.attackSpeed;
                if (u2.attackTimer >= attackSpeed) {
                    u2.attackTimer = 0;
                    this.performAttack(u2, u2.target, 'p1', p1Units);
                }
            }
        });

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
        let finalDamage = attacker.damage;

        // Charge damage multiplier
        if (attacker.isCharging) {
            finalDamage *= 2;
            attacker.isCharging = false;
            attacker.chargeTimer = 0;
        }

        if (attacker.projectile) {
            this.state.projectiles.push({
                x: attacker.x,
                y: attacker.y,
                targetId: target.id || (target.type === 'tower' ? (target.y === 0 ? 'tower_p1' : 'tower_p2') : null),
                targetX: target.x,
                targetY: target.y,
                damage: finalDamage,
                speed: attacker.projectileSpeed,
                type: attacker.projectile,
                targetPlayerId: targetPlayerId,
                ownerId: attacker.ownerId,
                stunDuration: attacker.stunDuration || 0,
                statusEffects: this.getAttackerStatusEffects(attacker),
            });
        } else if (attacker.selfDestruct) {
            attacker.hp = 0;
            this.dealSplashDamage(attacker.x, attacker.y, attacker.splash, finalDamage, targetPlayerId, enemyUnits);
        } else if (attacker.splash) {
            this.dealSplashDamage(target.x, target.y, attacker.splash, finalDamage, targetPlayerId, enemyUnits, true, this.getAttackerStatusEffects(attacker));
        } else {
            this.dealDamage(finalDamage, target, targetPlayerId);
            this.applyStatusEffects(target, this.getAttackerStatusEffects(attacker));
        }
    }

    getAttackerStatusEffects(attacker) {
        const effects = [];
        if (attacker.burnDps) {
            effects.push({ type: 'burn', dps: attacker.burnDps, duration: attacker.burnDuration });
        }
        if (attacker.curseSlow) {
            effects.push({ type: 'curse', slow: attacker.curseSlow, duration: attacker.curseDuration });
        }
        if (attacker.concussion) {
            effects.push({ type: 'slow', slow: 0.2, duration: 1.5 });
        }
        return effects;
    }

    applyStatusEffects(target, effects) {
        if (!effects || effects.length === 0 || target.type === 'tower') return;
        if (!target.statusEffects) target.statusEffects = [];

        effects.forEach(newEff => {
            const existing = target.statusEffects.find(e => e.type === newEff.type);
            if (existing) {
                existing.duration = Math.max(existing.duration, newEff.duration);
            } else {
                target.statusEffects.push({ ...newEff });
            }
        });
    }

    dealSplashDamage(x, y, radius, damage, targetPlayerId, enemyUnits, canHitTower = true, statusEffects = null) {
        // Find damageable units including buildings/towers in units list
        enemyUnits.forEach(u => {
            if (Math.hypot(u.x - x, u.y - y) <= radius) {
                this.dealDamage(damage, u, targetPlayerId);
                if (statusEffects) {
                    this.applyStatusEffects(u, statusEffects);
                }
            }
        });
    }

    dealDamage(damage, target, targetPlayerId) {
        if (target.shield && target.shield > 0) {
            if (target.shield >= damage) {
                target.shield -= damage;
            } else {
                const remaining = damage - target.shield;
                target.shield = 0;
                target.hp -= remaining;
            }
        } else {
            target.hp -= damage;
        }

        // Check if King Tower was destroyed
        if (target.hp <= 0 && target.cardId === 'king_tower') {
            const winnerId = targetPlayerId === 'p1' ? 'p2' : 'p1';
            this.endGame(winnerId);
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

                let finalStats = { ...unitStats };
                let finalId = cardId;

                // Handle Goblin split (3 Melee, 2 Spear)
                if (cardId === 'goblin') {
                    if (i >= unitStats.meleeCount) {
                        finalStats = UNITS.SPEAR_GOBLIN;
                        finalId = 'spear_goblin';
                    }
                }

                playerState.units.push({
                    ...finalStats,
                    cardId: finalId,
                    id: `${finalId}_${Date.now()}_${i}`,
                    x: Math.max(0, Math.min(GAME_CONFIG.FIELD_WIDTH, x + offsetX)),
                    y: Math.max(0, Math.min(GAME_CONFIG.FIELD_HEIGHT, y + offsetY)),
                    hp: finalStats.hp,
                    maxHp: finalStats.hp,
                    shield: finalStats.shield || 0,
                    maxShield: finalStats.shield || 0,
                    attackTimer: 0,
                    ownerId: playerId,
                    isEvolved: isEvolved,
                    statusEffects: [],
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

            // Weighted card selection - cards already in hand are 10x less likely
            let newNextCard;
            const collectorCount = playerState.units.filter(u => u.cardId === 'mana_collector').length;

            let candidateCards = playerState.deck;

            // Filter out mana_collector if limit reached
            if (collectorCount >= 3) {
                candidateCards = playerState.deck.filter(c => c !== 'mana_collector');
                if (candidateCards.length === 0) {
                    candidateCards = playerState.deck;
                }
            }

            // Build weighted array
            const weights = [];
            candidateCards.forEach(card => {
                // Cards in hand get weight 1, others get weight 10
                const isInHand = playerState.hand.includes(card);
                const weight = isInHand ? 1 : 10;
                weights.push({ card, weight });
            });

            // Calculate total weight
            const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);

            // Select random card based on weights
            let random = Math.random() * totalWeight;
            for (let i = 0; i < weights.length; i++) {
                random -= weights[i].weight;
                if (random <= 0) {
                    newNextCard = weights[i].card;
                    break;
                }
            }

            // Fallback
            if (!newNextCard) {
                newNextCard = candidateCards[Math.floor(Math.random() * candidateCards.length)];
            }

            playerState.nextCard = newNextCard;
        }
    }

    handleSuddenDeath() {
        const p1Towers = this.state.p1.units.filter(u => u.cardId === 'king_tower' || u.cardId === 'side_tower');
        const p2Towers = this.state.p2.units.filter(u => u.cardId === 'king_tower' || u.cardId === 'side_tower');

        const allTowers = [...p1Towers, ...p2Towers];
        if (allTowers.length === 0) return;

        allTowers.sort((a, b) => a.hp - b.hp);
        const lowest = allTowers[0];
        lowest.hp = 0;

        const loserId = p1Towers.includes(lowest) ? 'p1' : 'p2';
        const winnerId = loserId === 'p1' ? 'p2' : 'p1';
        this.endGame(winnerId);
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
            shield: unitStats.shield || 0,
            maxShield: unitStats.shield || 0,
            attackTimer: 0,
            ownerId: playerState.id,
            statusEffects: [],
        });
    }

    hatchEgg(playerState, egg) {
        const targetTier = egg.hatchTier;
        const rand = Math.random() * 100;
        let finalTier = targetTier;

        // "Lucky" Egg Distribution
        if (rand < 30) finalTier = targetTier;
        else if (rand < 70) finalTier = targetTier + 1; // +1 Tier (40% chance)
        else if (rand < 85) finalTier = targetTier + 2; // +2 Tier (15% chance)
        else if (rand < 90) finalTier = targetTier + 3; // +3 Tier (5% chance)
        else if (rand < 97) finalTier = targetTier - 1; // -1 Tier (7% chance)
        else finalTier = targetTier - 2; // -2 Tier (3% chance)

        // Clamp tier 1-7
        finalTier = Math.max(1, Math.min(7, finalTier));

        // Find all non-spell units with this cost
        const candidates = Object.keys(UNITS).filter(key => {
            const u = UNITS[key];
            return u.cost === finalTier && u.type !== 'spell' && u.type !== 'egg' && u.id !== 'spear_goblin';
        });

        if (candidates.length > 0) {
            const selectedKey = candidates[Math.floor(Math.random() * candidates.length)];
            const selectedId = selectedKey.toLowerCase();
            const unitStats = UNITS[selectedKey];
            const count = unitStats.count || 1;

            for (let i = 0; i < count; i++) {
                const offsetX = count > 1 ? (Math.random() - 0.5) * 1.5 : 0;
                const offsetY = count > 1 ? (Math.random() - 0.5) * 1.5 : 0;
                this.spawnUnit(playerState, selectedId, egg.x + offsetX, egg.y + offsetY);
            }

            console.log(`Egg hatched into ${count}x ${selectedId} (Tier ${finalTier}) - Lucky!`);
        } else {
            // Fallback to Skeletons (now spawns the whole squad)
            const unitStats = UNITS.SKELETONS;
            const count = unitStats.count || 4;
            for (let i = 0; i < count; i++) {
                const offsetX = (Math.random() - 0.5) * 1.5;
                const offsetY = (Math.random() - 0.5) * 1.5;
                this.spawnUnit(playerState, 'skeletons', egg.x + offsetX, egg.y + offsetY);
            }
        }
    }
}

module.exports = GameEngine;
