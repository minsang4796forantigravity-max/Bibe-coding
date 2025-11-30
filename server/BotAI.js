const { UNITS, GAME_CONFIG } = require('./constants');

const DECKS = {
    BEATDOWN: {
        cards: ['giant', 'witch', 'fireball', 'log', 'skeletons', 'baby_dragon', 'wizard', 'valkyrie', 'wizard'],
        evolutions: ['valkyrie', 'wizard']
    },
    HOG_CYCLE: {
        cards: ['hog_rider', 'cannon', 'skeletons', 'goblin', 'fireball', 'log', 'archer', 'knight', 'archer'],
        evolutions: ['knight', 'archer']
    },
    AIR_ASSAULT: {
        cards: ['balloon', 'baby_dragon', 'wizard', 'fireball', 'tornado', 'skeletons', 'knight', 'archer', 'archer'],
        evolutions: ['archer', 'wizard']
    },
    SPAWNER: {
        cards: ['goblin_hut', 'barbarians', 'bomber', 'fireball', 'log', 'archer', 'knight', 'witch', 'archer'],
        evolutions: ['archer', 'knight']
    }
};

class BotAI {
    constructor(difficulty = 'medium') {
        this.difficulty = difficulty;

        // Select a random deck
        const deckKeys = Object.keys(DECKS);
        const randomKey = deckKeys[Math.floor(Math.random() * deckKeys.length)];
        this.selectedDeck = DECKS[randomKey];

        console.log(`Bot initialized with difficulty: ${difficulty}, Deck: ${randomKey}`);

        this.decisionTimer = 0;

        // Difficulty settings
        switch (difficulty) {
            case 'easy':
                this.decisionInterval = 2.0;
                break;
            case 'medium':
                this.decisionInterval = 1.2;
                break;
            case 'hard':
                this.decisionInterval = 0.8;
                break;
            case 'impossible':
                this.decisionInterval = 0.5;
                break;
            default:
                this.decisionInterval = 1.2;
        }
    }

    getDeck() {
        return this.selectedDeck.cards;
    }

    update(dt, gameState, myPlayerId, deployCallback) {
        this.decisionTimer += dt;
        if (this.decisionTimer < this.decisionInterval) return;
        this.decisionTimer = 0;

        const myState = gameState[myPlayerId];
        const enemyId = myPlayerId === 'p1' ? 'p2' : 'p1';
        const enemyState = gameState[enemyId];

        // Easy mode: Random mistakes or slower reaction (already handled by decisionInterval)
        // Hard/Impossible: Optimal play

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
        if (myState.mana < 1) return;

        const threat = threats[0];
        const threatStats = UNITS[threat.cardId.toUpperCase()] || threat;
        const towerY = myPlayerId === 'p1' ? 0 : GAME_CONFIG.FIELD_HEIGHT;
        const distToTower = Math.abs(threat.y - towerY);

        // Emergency: Threat is hitting tower or very close
        if (distToTower < 4) {
            const cheapCard = this.pickCard(myState.hand, ['skeletons', 'knight', 'valkyrie', 'goblin', 'log']);
            const anyCard = cheapCard || myState.hand[0];

            if (anyCard) {
                const deployY = threat.y + (myPlayerId === 'p1' ? 1 : -1);
                deployCallback(anyCard, threat.x, this.clampY(deployY));
                return;
            }
        }

        let counterType = 'dps';
        if (threatStats.count > 1 || threatStats.id === 'skeleton_army') counterType = 'splash';
        if (threatStats.type === 'flying') counterType = 'anti_air';
        if (threatStats.hp > 1000) counterType = 'tank_killer';

        const card = this.findCounterCard(myState.hand, counterType);

        if (card) {
            const centerX = GAME_CONFIG.FIELD_WIDTH / 2;
            let deployX, deployY;
            const unitStats = UNITS[card.toUpperCase()];

            if (unitStats.type === 'spell') {
                deployCallback(card, threat.x, threat.y);
                return;
            }

            // Easy mode: Less optimal placement
            if (this.difficulty === 'easy') {
                deployX = threat.x;
                deployY = threat.y + (myPlayerId === 'p1' ? 2 : -2);
            } else {
                // Optimal Kiting
                if (threatStats.range > 2) {
                    deployX = threat.x;
                    deployY = threat.y;
                } else {
                    deployX = centerX + (Math.random() - 0.5);
                    deployY = myPlayerId === 'p1' ? 4 : GAME_CONFIG.FIELD_HEIGHT - 4;
                }
            }

            deployCallback(card, this.clampX(deployX), this.clampY(deployY));
        }
    }

    handleOffense(myState, myPlayerId, deployCallback) {
        // Strategy depends on deck archetype ideally, but generic push logic works for now

        const myUnits = myState.units || [];
        // Check for tanks in current deck
        const tanks = ['giant', 'golem', 'pekka', 'hog_rider', 'balloon', 'goblin_hut'];
        const hasTankOnField = myUnits.some(u => tanks.includes(u.cardId));

        if (hasTankOnField) {
            // Support
            if (myState.mana >= 4) {
                const supportCard = this.pickCard(myState.hand, ['witch', 'wizard', 'baby_dragon', 'bomber', 'musketeer', 'archer']);
                if (supportCard) {
                    const tank = myUnits.find(u => tanks.includes(u.cardId));
                    if (tank) {
                        const deployX = tank.x + (Math.random() - 0.5);
                        const deployY = tank.y + (myPlayerId === 'p1' ? -2 : 2);
                        deployCallback(supportCard, this.clampX(deployX), this.clampY(deployY));
                    }
                }
            }
        } else {
            // Start push
            const pushMana = this.difficulty === 'easy' ? 7 : 9; // Easy mode attacks sooner/weaker

            if (myState.mana >= pushMana) {
                const tankCard = this.pickCard(myState.hand, tanks);
                if (tankCard) {
                    const deployX = GAME_CONFIG.FIELD_WIDTH / 2 + (Math.random() * 4 - 2);
                    const deployY = myPlayerId === 'p1' ? 0.5 : GAME_CONFIG.FIELD_HEIGHT - 0.5;
                    deployCallback(tankCard, this.clampX(deployX), this.clampY(deployY));
                } else {
                    // Cycle
                    const cycleCard = this.pickCard(myState.hand, ['skeletons', 'log', 'ice_spirit', 'goblin']);
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
            'tank_killer': ['skeletons', 'barbarians', 'minion_horde', 'inferno_tower', 'cannon'],
            'dps': ['knight', 'valkyrie', 'baby_dragon', 'skeletons', 'goblin', 'archer']
        };

        const preferred = counters[type] || [];
        const candidates = hand.filter(c => preferred.includes(c));

        if (candidates.length > 0) return candidates[0];

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
