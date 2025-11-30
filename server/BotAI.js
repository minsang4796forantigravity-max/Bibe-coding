const { UNITS, GAME_CONFIG } = require('./constants');

class BotAI {
    constructor() {
        this.deck = [
            'knight', 'archer', 'bomber', 'giant',
            'fireball', 'skeletons', 'musketeer', 'baby_dragon'
        ];
        // Fallback if some cards don't exist in UNITS (musketeer might not be there, checking constants.js)
        // Constants has: SKELETONS, GOBLIN, KNIGHT, ARCHER, BOMBER, KAMIKAZE, CANNON, SNIPER, VALKYRIE, HOG_RIDER, BABY_DRAGON, FIREBALL, TORNADO, RAGE, HEAL, LOG, FREEZE, ELECTRO_WIZARD, GOBLIN_BARREL, GIANT, WIZARD, WITCH, BARBARIANS, BALLOON, GOBLIN_HUT, MANA_COLLECTOR

        this.deck = [
            'knight', 'archer', 'bomber', 'giant',
            'fireball', 'skeletons', 'wizard', 'baby_dragon'
        ];
        this.evolutions = ['knight', 'archer']; // Example evolutions

        this.decisionTimer = 0;
        this.decisionInterval = 2.0; // Make a decision every 2 seconds
    }

    getDeck() {
        // Return 9 cards structure as expected by GameEngine: 7 regular + 2 evo
        // Actually GameEngine expects [card1...card7, evo1, evo2]
        // My deck above has 8 cards. Let's make it 7 unique + 2 evos.
        const regular = ['knight', 'archer', 'bomber', 'giant', 'fireball', 'skeletons', 'wizard'];
        const evos = ['knight', 'archer']; // These must be in the regular deck usually, or separate?
        // GameEngine: 
        // const regularCards = selectedDeck.slice(0, 7);
        // const evolutionCards = selectedDeck.slice(7, 9);
        // So I should provide 9 items.
        return [...regular, ...evos];
    }

    update(dt, gameState, myPlayerId, deployCallback) {
        this.decisionTimer += dt;
        if (this.decisionTimer < this.decisionInterval) return;

        this.decisionTimer = 0;

        const myState = gameState[myPlayerId];
        const enemyId = myPlayerId === 'p1' ? 'p2' : 'p1';
        const enemyState = gameState[enemyId];

        // Simple Logic:
        // 1. If mana is full (or close to), play a card.
        // 2. If enemy units are on my side, play a defensive card.
        // 3. Otherwise, play an offensive card at the back.

        if (myState.mana < 3) return; // Wait for some mana

        // Check for threats (enemies on my side)
        const mySideYStart = myPlayerId === 'p1' ? 0 : GAME_CONFIG.FIELD_HEIGHT / 2;
        const mySideYEnd = myPlayerId === 'p1' ? GAME_CONFIG.FIELD_HEIGHT / 2 : GAME_CONFIG.FIELD_HEIGHT;

        const threats = enemyState.units.filter(u => {
            if (myPlayerId === 'p1') return u.y < GAME_CONFIG.FIELD_HEIGHT / 2;
            else return u.y > GAME_CONFIG.FIELD_HEIGHT / 2;
        });

        if (threats.length > 0) {
            // Defend!
            // Pick a cheap unit or splash unit
            const cardToPlay = this.pickCard(myState.hand, ['bomber', 'wizard', 'valkyrie', 'skeletons', 'knight', 'archer']);
            if (cardToPlay) {
                // Place near the threat but slightly towards the center/tower
                const threat = threats[0];
                const deployX = threat.x + (Math.random() - 0.5) * 2;
                const deployY = threat.y + (myPlayerId === 'p1' ? 2 : -2); // Place slightly in front of threat relative to tower

                deployCallback(cardToPlay, this.clampX(deployX), this.clampY(deployY));
                return;
            }
        }

        // Attack!
        if (myState.mana > 6) {
            // Play a tank at the back or support
            const cardToPlay = this.pickCard(myState.hand, ['giant', 'knight', 'baby_dragon', 'witch', 'balloon']);
            if (cardToPlay) {
                const deployX = Math.random() * GAME_CONFIG.FIELD_WIDTH;
                const deployY = myPlayerId === 'p1' ? 0.5 : GAME_CONFIG.FIELD_HEIGHT - 0.5; // Behind king tower

                deployCallback(cardToPlay, this.clampX(deployX), this.clampY(deployY));
                return;
            }

            // If no tank, play anything
            const anyCard = myState.hand[Math.floor(Math.random() * myState.hand.length)];
            const deployX = Math.random() * GAME_CONFIG.FIELD_WIDTH;
            const deployY = myPlayerId === 'p1' ? 2 : GAME_CONFIG.FIELD_HEIGHT - 2;
            deployCallback(anyCard, this.clampX(deployX), this.clampY(deployY));
        }
    }

    pickCard(hand, preferredCards) {
        // Find a card in hand that is in preferredCards
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
