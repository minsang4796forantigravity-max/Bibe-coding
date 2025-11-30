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
        this.decisionInterval = 0.8; // Faster decision making (0.8s)

        this.state = 'DEFEND'; // DEFEND, PREPARE_PUSH, ATTACK
    }

    getDeck() {
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

        // Check entire half of the field
        return enemyUnits.filter(u => {
            if (myPlayerId === 'p1') {
                return u.y < GAME_CONFIG.FIELD_HEIGHT / 2 + 1; // Include bridge
            } else {
                return u.y > GAME_CONFIG.FIELD_HEIGHT / 2 - 1; // Include bridge
            }
        }).sort((a, b) => {
            // Sort by danger (closer to tower is more dangerous)
            const distA = Math.abs(a.y - (myPlayerId === 'p1' ? 0 : GAME_CONFIG.FIELD_HEIGHT));
            const distB = Math.abs(b.y - (myPlayerId === 'p1' ? 0 : GAME_CONFIG.FIELD_HEIGHT));
            return distA - distB;
        });
    }

    handleDefense(myState, threats, myPlayerId, deployCallback) {
        if (myState.mana < 1) return; // Need at least 1 mana

        const threat = threats[0]; // Deal with most dangerous threat
        const threatStats = UNITS[threat.cardId.toUpperCase()] || threat;
        const towerY = myPlayerId === 'p1' ? 0 : GAME_CONFIG.FIELD_HEIGHT;
        const distToTower = Math.abs(threat.y - towerY);

        // Emergency: Threat is hitting tower or very close
        if (distToTower < 4) {
            // Drop ANYTHING to block/distract
            const cheapCard = this.pickCard(myState.hand, ['skeletons', 'knight', 'valkyrie', 'goblin', 'log']);
            const anyCard = cheapCard || myState.hand[0];

            if (anyCard) {
                // Place directly on top/in front to block
                const deployY = threat.y + (myPlayerId === 'p1' ? 1 : -1);
                deployCallback(anyCard, threat.x, this.clampY(deployY));
                return;
            }
        }

        // Determine counter type needed
        let counterType = 'dps';
        if (threatStats.count > 1 || threatStats.id === 'skeleton_army') counterType = 'splash';
        if (threatStats.type === 'flying') counterType = 'anti_air';
        if (threatStats.hp > 1000) counterType = 'tank_killer';

        // Find best card in hand
        const card = this.findCounterCard(myState.hand, counterType);

        if (card) {
            // Strategic Placement
            const centerX = GAME_CONFIG.FIELD_WIDTH / 2;

            // Kiting Logic:
            // If threat is ground and not building-targeter (or is building targeter but we have a building), pull to center.
            // If threat is ranged, drop unit on top of it (surround).

            let deployX, deployY;
            const unitStats = UNITS[card.toUpperCase()];

            if (unitStats.type === 'spell') {
                // Aim at threat
                deployCallback(card, threat.x, threat.y);
                return;
            }

            if (threatStats.range > 2) {
                // Ranged threat (Musketeer, Wizard) -> Drop ON TOP
                deployX = threat.x;
                deployY = threat.y;
            } else {
                // Melee threat -> Kite to center
                deployX = centerX + (Math.random() - 0.5);
                deployY = myPlayerId === 'p1' ? 4 : GAME_CONFIG.FIELD_HEIGHT - 4; // Kill zone
            }

            deployCallback(card, this.clampX(deployX), this.clampY(deployY));
        }
    }

    handleOffense(myState, myPlayerId, deployCallback) {
        // Strategy: Build a push
        // 1. Wait for full mana (9+)
        // 2. Drop Tank (Giant) at the back
        // 3. Support with Witch/Wizard

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
