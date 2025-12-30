const { UNITS, GAME_CONFIG } = require('./constants');

const DECKS = {
    BEATDOWN: {
        cards: ['giant', 'witch', 'fireball', 'log', 'skeletons', 'baby_dragon'],
        evolutions: ['wizard', 'valkyrie']
    },
    HOG_CYCLE: {
        cards: ['hog_rider', 'air_defense', 'skeletons', 'goblin', 'fireball', 'log'],
        evolutions: ['knight', 'archer']
    },
    AIR_ASSAULT: {
        cards: ['balloon', 'baby_dragon', 'wizard', 'fireball', 'tornado', 'skeletons'],
        evolutions: ['archer', 'knight']
    },
    SPAWNER: {
        cards: ['goblin_hut', 'barbarians', 'bomber', 'fireball', 'log', 'archer'],
        evolutions: ['witch', 'knight']
    },
    EGG_RANDOM: {
        cards: ['egg_1', 'egg_2', 'egg_3', 'egg_4', 'egg_5', 'log'],
        evolutions: ['valkyrie', 'wizard']
    },
    CHICKEN_FARM: {
        cards: ['chicken', 'egg_2', 'egg_3', 'baby_dragon', 'fireball', 'log'],
        evolutions: ['knight', 'witch']
    },
    SNIPER_ELITE: {
        cards: ['sniper', 'knight', 'electro_wizard', 'air_defense', 'log', 'fireball'],
        evolutions: ['giant', 'valkyrie']
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
        // Return 8 cards: 6 regular + 2 evolutions
        return [...this.selectedDeck.cards, ...this.selectedDeck.evolutions];
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
        const centerX = GAME_CONFIG.FIELD_WIDTH / 2;

        // Kiting Logic (Hard/Impossible)
        if (this.difficulty === 'hard' || this.difficulty === 'impossible') {
            // If threat is melee and not building targeter, try to kite to center
            if (threatStats.type === 'ground' && threatStats.range < 2 && threatStats.target !== 'building') {
                const kiteCard = this.pickCard(myState.hand, ['skeletons', 'goblin', 'ice_spirit', 'knight', 'archer']);
                if (kiteCard) {
                    // Place in center to pull
                    const deployX = centerX;
                    const deployY = myPlayerId === 'p1' ? 3 : GAME_CONFIG.FIELD_HEIGHT - 3;
                    deployCallback(kiteCard, deployX, deployY);
                    return;
                }
            }
        }

        // Building Defense
        if (threatStats.target === 'building' || threatStats.hp > 1000 || threatStats.type === 'flying') {
            const buildingCards = ['cannon', 'air_defense', 'goblin_hut'];
            const preferredBuilding = threatStats.type === 'flying' ? 'air_defense' : 'cannon';
            const buildingCard = this.pickCard(myState.hand, [preferredBuilding, ...buildingCards]);

            if (buildingCard) {
                // Place in center kill zone
                const deployX = centerX;
                const deployY = myPlayerId === 'p1' ? 4 : GAME_CONFIG.FIELD_HEIGHT - 4;
                deployCallback(buildingCard, deployX, deployY);
                return;
            }
        }

        // Standard Counter Logic
        let counterType = 'dps';
        if (threatStats.count > 1 || threatStats.id === 'skeleton_army') counterType = 'splash';
        if (threatStats.type === 'flying') counterType = 'anti_air';
        if (threatStats.hp > 1000) counterType = 'tank_killer';

        const card = this.findCounterCard(myState.hand, counterType);

        if (card) {
            let deployX, deployY;
            const unitStats = UNITS[card.toUpperCase()];

            if (unitStats.type === 'spell') {
                deployCallback(card, threat.x, threat.y);
                return;
            }

            // Easy mode: Less optimal placement (but still defensive)
            if (this.difficulty === 'easy') {
                deployX = threat.x;
                // Place between threat and tower
                deployY = threat.y + (myPlayerId === 'p1' ? -2 : 2);
            } else {
                // Optimal Placement
                if (unitStats.range > 2) {
                    // Ranged unit: place back
                    deployX = threat.x;
                    deployY = myPlayerId === 'p1' ? 1 : GAME_CONFIG.FIELD_HEIGHT - 1;
                } else {
                    // Melee unit: place on top or slightly in front
                    deployX = threat.x;
                    deployY = threat.y + (myPlayerId === 'p1' ? 1.5 : -1.5);
                }
            }

            deployCallback(card, this.clampX(deployX), this.clampY(deployY));
        }
    }

    handleOffense(myState, myPlayerId, deployCallback) {
        const myUnits = myState.units || [];
        const tanks = ['giant', 'golem', 'pekka', 'hog_rider', 'balloon', 'goblin_hut'];
        const hasTankOnField = myUnits.some(u => tanks.includes(u.cardId));

        // Elixir Management: Don't leak elixir
        if (myState.mana >= 9.5) {
            // Must play something
            const cycleCard = this.pickCard(myState.hand, ['skeletons', 'goblin', 'archer', 'knight', 'log', 'egg_1', 'egg_2']);
            const anyCard = cycleCard || myState.hand[0];

            // Play in back
            const deployX = GAME_CONFIG.FIELD_WIDTH / 2;
            const deployY = myPlayerId === 'p1' ? 0.5 : GAME_CONFIG.FIELD_HEIGHT - 0.5;
            deployCallback(anyCard, deployX, deployY);
            return;
        }

        if (hasTankOnField) {
            // Support the tank
            if (myState.mana >= 3.5) {
                const supportCard = this.pickCard(myState.hand, ['witch', 'wizard', 'baby_dragon', 'bomber', 'archer', 'sniper', 'egg_3']);
                if (supportCard) {
                    const tank = myUnits.find(u => tanks.includes(u.cardId));
                    if (tank) {
                        // Place behind tank
                        const deployX = tank.x + (Math.random() - 0.5);
                        const deployY = tank.y + (myPlayerId === 'p1' ? -2 : 2);
                        deployCallback(supportCard, this.clampX(deployX), this.clampY(deployY));
                    }
                }
            }
        } else {
            // Start a push
            const pushMana = this.difficulty === 'easy' ? 8 : 9;

            if (myState.mana >= pushMana) {
                const tankCard = this.pickCard(myState.hand, [...tanks, 'egg_4', 'egg_5']);
                if (tankCard) {
                    // Build push from back
                    const deployX = GAME_CONFIG.FIELD_WIDTH / 2 + (Math.random() * 4 - 2);
                    const deployY = myPlayerId === 'p1' ? 0.5 : GAME_CONFIG.FIELD_HEIGHT - 0.5;
                    deployCallback(tankCard, this.clampX(deployX), this.clampY(deployY));
                }
            }
        }
    }

    findCounterCard(hand, type) {
        const counters = {
            'splash': ['valkyrie', 'wizard', 'witch', 'baby_dragon', 'bomber', 'log', 'fireball', 'tornado'],
            'anti_air': ['air_defense', 'wizard', 'witch', 'baby_dragon', 'archer', 'musketeer', 'sniper'],
            'tank_killer': ['skeletons', 'barbarians', 'barbarian_hut', 'cannon', 'pekka'],
            'dps': ['knight', 'valkyrie', 'baby_dragon', 'skeletons', 'goblin', 'archer', 'sniper']
        };

        const preferred = counters[type] || [];
        const candidates = hand.filter(c => preferred.includes(c));

        if (candidates.length > 0) return candidates[0];

        // Fallback
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
