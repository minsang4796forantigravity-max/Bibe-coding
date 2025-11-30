const { UNITS, GAME_CONFIG } = require('./constants');

class BotAI {
    constructor() {
        // Balanced Deck: Tank, Splash, Air Counter, Spells, Cycle
        this.deck = [
            'giant',        // Tank
            'witch',        // Support/Splash/Spawner
            'fireball',     // Big Spell
            'log',          // Small Spell
            'wizard',       // Splash/Air Counter
            'skeletons',    // Cycle/Distraction
            'valkyrie',     // Ground Splash/Mini Tank
            'baby_dragon'   // Air Splash/Tank
        ];

        this.evolutions = ['valkyrie', 'wizard'];

        this.decisionTimer = 0;
        this.decisionInterval = 1.0; // Faster decision making (1s)

        this.state = 'DEFEND'; // DEFEND, PREPARE_PUSH, ATTACK
    }

    getDeck() {
        // Return 9 cards: 7 regular + 2 evo
        const regular = ['giant', 'witch', 'fireball', 'log', 'skeletons', 'baby_dragon', 'valkyrie'];
        const evos = ['wizard', 'valkyrie']; // Duplicates allowed in logic? GameEngine splits by index.
        // Actually GameEngine expects unique card IDs usually, but let's follow the structure.
        // If I put 'valkyrie' in regular and 'valkyrie' in evo, it might be confusing.
        // Let's just ensure we return a valid list.
        return ['giant', 'witch', 'fireball', 'log', 'skeletons', 'baby_dragon', 'wizard', 'valkyrie', 'wizard'];
    }

    update(dt, gameState, myPlayerId, deployCallback) {
        this.decisionTimer += dt;
        if (this.decisionTimer < this.decisionInterval) return;
        this.decisionTimer = 0;

        const myState = gameState[myPlayerId];
        const enemyId = myPlayerId === 'p1' ? 'p2' : 'p1';
        const enemyState = gameState[enemyId];

        // 1. Analyze Threats
        const threats = this.analyzeThreats(enemyState.units, myPlayerId);

        // 2. Emergency Defense (High Priority)
        if (threats.length > 0) {
            this.handleDefense(myState, threats, myPlayerId, deployCallback);
            return;
        }

        // 3. Offense / Cycle
        this.handleOffense(myState, myPlayerId, deployCallback);
    }

    analyzeThreats(enemyUnits, myPlayerId) {
        const mySideYStart = myPlayerId === 'p1' ? 0 : GAME_CONFIG.FIELD_HEIGHT / 2;
        const mySideYEnd = myPlayerId === 'p1' ? GAME_CONFIG.FIELD_HEIGHT / 2 : GAME_CONFIG.FIELD_HEIGHT;

        // Define "Threat" as any enemy unit on my side of the field
        // Or very close to the bridge
        const bridgeThreshold = 2; // Units within 2 tiles of bridge are incoming threats

        return enemyUnits.filter(u => {
            if (myPlayerId === 'p1') {
                return u.y < (GAME_CONFIG.FIELD_HEIGHT / 2) + bridgeThreshold;
            } else {
                return u.y > (GAME_CONFIG.FIELD_HEIGHT / 2) - bridgeThreshold;
            }
        }).sort((a, b) => {
            // Sort by danger (closer to tower is more dangerous)
            const distA = Math.abs(a.y - (myPlayerId === 'p1' ? 0 : GAME_CONFIG.FIELD_HEIGHT));
            const distB = Math.abs(b.y - (myPlayerId === 'p1' ? 0 : GAME_CONFIG.FIELD_HEIGHT));
            return distA - distB;
        });
    }

    handleDefense(myState, threats, myPlayerId, deployCallback) {
        if (myState.mana < 2) return; // Not enough mana to do much

        const threat = threats[0]; // Deal with most dangerous threat
        const threatStats = UNITS[threat.cardId.toUpperCase()] || threat;

        // Determine counter type needed
        let counterType = 'dps';
        if (threatStats.count > 1 || threatStats.id === 'skeleton_army') counterType = 'splash';
        if (threatStats.type === 'flying') counterType = 'anti_air';
        if (threatStats.hp > 1000) counterType = 'tank_killer';

        // Find best card in hand
        const card = this.findCounterCard(myState.hand, counterType);

        if (card) {
            // Strategic Placement
            // Pull to center (Kiting)
            const centerX = GAME_CONFIG.FIELD_WIDTH / 2;
            const towerY = myPlayerId === 'p1' ? 0 : GAME_CONFIG.FIELD_HEIGHT;

            // Calculate pull position (center, slightly towards my tower)
            let deployX = centerX + (Math.random() - 0.5);
            let deployY = myPlayerId === 'p1' ? 4 : GAME_CONFIG.FIELD_HEIGHT - 4;

            // If threat is very close, place directly on top or slightly behind
            const distToTower = Math.abs(threat.y - towerY);
            if (distToTower < 5) {
                deployX = threat.x;
                deployY = threat.y + (myPlayerId === 'p1' ? 1 : -1); // Block path
            } else if (threatStats.target === 'building') {
                // Pull building targeters to the middle heavily
                deployX = centerX;
                deployY = myPlayerId === 'p1' ? 5 : GAME_CONFIG.FIELD_HEIGHT - 5;
            }

            // Spells logic
            const unitStats = UNITS[card.toUpperCase()];
            if (unitStats.type === 'spell') {
                // Aim at threat
                deployCallback(card, threat.x, threat.y);
            } else {
                deployCallback(card, this.clampX(deployX), this.clampY(deployY));
            }
        }
    }

    handleOffense(myState, myPlayerId, deployCallback) {
        // Strategy: Build a push
        // 1. Wait for full mana (9+)
        // 2. Drop Tank (Giant) at the back
        // 3. Support with Witch/Wizard

        // Check if we already have a tank
        const myUnits = myState.units || [];
        const hasTank = myUnits.some(u => ['giant', 'golem', 'pekka'].includes(u.cardId));

        if (hasTank) {
            // Support the tank!
            if (myState.mana >= 4) {
                const supportCard = this.pickCard(myState.hand, ['witch', 'wizard', 'baby_dragon', 'bomber', 'musketeer']);
                if (supportCard) {
                    // Place behind the tank
                    const tank = myUnits.find(u => ['giant', 'golem', 'pekka'].includes(u.cardId));
                    if (tank) {
                        const deployX = tank.x + (Math.random() - 0.5);
                        const deployY = tank.y + (myPlayerId === 'p1' ? -2 : 2); // Behind
                        deployCallback(supportCard, this.clampX(deployX), this.clampY(deployY));
                    }
                }
            }
        } else {
            // Start a push if mana is high
            if (myState.mana >= 9) {
                const tankCard = this.pickCard(myState.hand, ['giant']);
                if (tankCard) {
                    // Place at the back
                    const deployX = GAME_CONFIG.FIELD_WIDTH / 2 + (Math.random() * 4 - 2); // Random side
                    const deployY = myPlayerId === 'p1' ? 0.5 : GAME_CONFIG.FIELD_HEIGHT - 0.5;
                    deployCallback(tankCard, this.clampX(deployX), this.clampY(deployY));
                } else {
                    // Cycle cheap card if no tank
                    const cycleCard = this.pickCard(myState.hand, ['skeletons', 'log', 'ice_spirit']);
                    if (cycleCard && myState.mana === 10) {
                        deployCallback(cycleCard, GAME_CONFIG.FIELD_WIDTH / 2, myPlayerId === 'p1' ? 2 : GAME_CONFIG.FIELD_HEIGHT - 2);
                    }
                }
            }
        }
    }

    findCounterCard(hand, type) {
        const counters = {
            'splash': ['valkyrie', 'wizard', 'witch', 'baby_dragon', 'bomber', 'log', 'fireball'],
            'anti_air': ['wizard', 'witch', 'baby_dragon', 'archer', 'musketeer'],
            'tank_killer': ['skeletons', 'barbarians', 'minion_horde', 'inferno_tower'], // Skeletons distract
            'dps': ['knight', 'valkyrie', 'baby_dragon', 'skeletons']
        };

        const preferred = counters[type] || [];
        // Also consider general good cards
        const candidates = hand.filter(c => preferred.includes(c));

        if (candidates.length > 0) return candidates[0];

        // Fallback: pick any unit that isn't a spell (unless spell is needed)
        const anyUnit = hand.find(c => {
            const stats = UNITS[c.toUpperCase()];
            return stats && stats.type !== 'spell';
        });
        return anyUnit || hand[0];
    }

    pickCard(hand, preferredCards) {
        const candidates = hand.filter(c => preferredCards.includes(c));
        if (candidates.length > 0) {
            return candidates[Math.floor(Math.random() * candidates.length)];
        }
        return null;
    }

    clampX(x) {
        return Math.max(0.5, Math.min(GAME_CONFIG.FIELD_WIDTH - 0.5, x));
    }

    clampY(y) {
        return Math.max(0.5, Math.min(GAME_CONFIG.FIELD_HEIGHT - 0.5, y));
    }
}

module.exports = BotAI;
