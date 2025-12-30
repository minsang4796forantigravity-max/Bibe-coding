const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { UNITS, EMOTES, BOOSTERS, RARITY_WEIGHTS } = require('../constants');

const BOX_CONFIG = {
    silver: { cost: 200, name: 'Silver Box', unlockCount: 1, emoji: '📦' },
    gold: { cost: 500, name: 'Gold Box', unlockCount: 3, emoji: '🎁' },
    diamond: { cost: 1200, name: 'Diamond Box', unlockCount: 6, emoji: '💎' }
};

// Helper to pick random card by rarity
function pickRandomCard(rarityWeights) {
    const totalWeight = Object.values(rarityWeights).reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;

    let selectedRarity = 'normal';
    for (const [rarity, weight] of Object.entries(rarityWeights)) {
        if (random < weight) {
            selectedRarity = rarity;
            break;
        }
        random -= weight;
    }

    const cardsOfRarity = Object.values(UNITS).filter(u => u.rarity === selectedRarity && u.id !== 'king_tower' && u.id !== 'side_tower');
    if (cardsOfRarity.length === 0) return pickRandomCard(rarityWeights); // Fallback
    return cardsOfRarity[Math.floor(Math.random() * cardsOfRarity.length)].id;
}

function ensureInventoryObject(user) {
    // If inventory is an array or missing required fields, migrate it
    if (Array.isArray(user.inventory) || !user.inventory || !user.inventory.unlockedCards) {
        console.log(`Migrating inventory for user: ${user.username}`);
        const oldItems = Array.isArray(user.inventory) ? user.inventory : [];
        const unlockedFromOld = oldItems.map(item => item.cardId).filter(id => id);

        const STARTER_CARDS = ['knight', 'archer', 'giant', 'wizard', 'fireball', 'cannon', 'goblin', 'skeletons', 'egg_1', 'egg_2', 'egg_3', 'egg_4', 'egg_5', 'chicken'];
        const uniqueUnlocked = [...new Set([...STARTER_CARDS, ...unlockedFromOld])];

        user.inventory = {
            unlockedCards: uniqueUnlocked,
            ownedEmotes: user.inventory?.ownedEmotes || ['smile', 'angry', 'thumbsup'],
            boosters: user.inventory?.boosters || { coinBoost: 0, eggBoost: 0 }
        };
        user.markModified('inventory');
    }
}

// Buy Mystery Box (Unlocked Cards)
router.post('/buy-box', async (req, res) => {
    const { username, boxType = 'silver' } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: 'User not found' });

        ensureInventoryObject(user);

        const config = BOX_CONFIG[boxType] || BOX_CONFIG.silver;
        if (user.coins < config.cost) {
            return res.status(400).json({ message: '코인이 부족합니다.' });
        }

        user.coins -= config.cost;

        const unlocked = [];
        for (let i = 0; i < config.unlockCount; i++) {
            const cardId = pickRandomCard(RARITY_WEIGHTS);
            unlocked.push(cardId);
            if (!user.inventory.unlockedCards.includes(cardId)) {
                user.inventory.unlockedCards.push(cardId);
            }
        }

        await user.save();
        res.json({
            message: `${config.name} Opened!`,
            rewards: unlocked,
            coins: user.coins,
            inventory: user.inventory
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Buy Emote
router.post('/buy-emote', async (req, res) => {
    const { username, emoteId } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: 'User not found' });

        ensureInventoryObject(user);

        const emote = EMOTES[emoteId];
        if (!emote) return res.status(404).json({ message: 'Emote not found' });

        if (user.inventory.ownedEmotes.includes(emoteId)) {
            return res.status(400).json({ message: '이미 보유한 이모티콘입니다.' });
        }

        if (user.coins < emote.price) {
            return res.status(400).json({ message: '코인이 부족합니다.' });
        }

        user.coins -= emote.price;
        user.inventory.ownedEmotes.push(emoteId);
        await user.save();

        res.json({ message: 'Emote purchased!', coins: user.coins, inventory: user.inventory });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Buy Booster
router.post('/buy-booster', async (req, res) => {
    const { username, boosterId } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: 'User not found' });

        ensureInventoryObject(user);

        const booster = BOOSTERS[boosterId.toUpperCase()];
        if (!booster) return res.status(404).json({ message: 'Booster not found' });

        if (user.coins < booster.cost) {
            return res.status(400).json({ message: '코인이 부족합니다.' });
        }

        user.coins -= booster.cost;
        if (boosterId.toLowerCase().includes('coin')) {
            user.inventory.boosters.coinBoost += booster.matches;
        } else if (boosterId.toLowerCase().includes('egg')) {
            user.inventory.boosters.eggBoost += booster.matches;
        }

        await user.save();
        res.json({ message: 'Booster purchased!', coins: user.coins, inventory: user.inventory });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
