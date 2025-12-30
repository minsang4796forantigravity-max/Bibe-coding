const express = require('express');
const router = express.Router();
const User = require('../models/User');

const UPGRADE_COSTS = {
    1: { coins: 50, shards: 10 },
    2: { coins: 150, shards: 20 },
    3: { coins: 400, shards: 50 },
    4: { coins: 1000, shards: 100 },
    5: { coins: 2500, shards: 250 }
};

const ALL_CARD_IDS = [
    'skeletons', 'goblin', 'spear_goblin', 'knight', 'archer',
    'bomber', 'kamikaze', 'cannon', 'valkyrie', 'hog_rider',
    'baby_dragon', 'sniper', 'air_defense', 'electro_wizard',
    'giant', 'wizard', 'witch', 'barbarians', 'balloon',
    'goblin_hut', 'mana_collector', 'fireball', 'log', 'tornado',
    'goblin_barrel', 'freeze', 'rage', 'heal'
];

const BOX_CONFIG = {
    silver: { cost: 200, name: 'Silver Box', cards: 3, shardMin: 5, shardMax: 15, emoji: '📦' },
    gold: { cost: 500, name: 'Gold Box', cards: 5, shardMin: 12, shardMax: 30, emoji: '🎁' },
    diamond: { cost: 1200, name: 'Diamond Box', cards: 8, shardMin: 30, shardMax: 70, emoji: '💎' }
};

// Buy Mystery Box
router.post('/buy-box', async (req, res) => {
    const { username, boxType = 'silver' } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const config = BOX_CONFIG[boxType] || BOX_CONFIG.silver;

        if (user.coins < config.cost) {
            return res.status(400).json({ message: '코인이 부족합니다.' });
        }

        user.coins -= config.cost;

        const rewards = [];
        for (let i = 0; i < config.cards; i++) {
            const cardId = ALL_CARD_IDS[Math.floor(Math.random() * ALL_CARD_IDS.length)];
            const shards = Math.floor(Math.random() * (config.shardMax - config.shardMin + 1)) + config.shardMin;
            rewards.push({ cardId, shards });

            const invItem = user.inventory.find(item => item.cardId === cardId);
            if (invItem) {
                invItem.shards += shards;
            } else {
                user.inventory.push({ cardId, shards, level: 1 });
            }
        }

        await user.save();
        res.json({
            message: `${config.name} Opened!`,
            rewards,
            coins: user.coins,
            inventory: user.inventory
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Buy Shards Directly
router.post('/buy-shards', async (req, res) => {
    const { username, cardId, shards, cost } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.coins < cost) {
            return res.status(400).json({ message: '코인이 부족합니다.' });
        }

        user.coins -= cost;

        const invItem = user.inventory.find(item => item.cardId === cardId);
        if (invItem) {
            invItem.shards += shards;
        } else {
            user.inventory.push({ cardId, shards, level: 1 });
        }

        await user.save();
        res.json({ message: 'Purchase successful!', coins: user.coins, inventory: user.inventory });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Upgrade Card
router.post('/upgrade-card', async (req, res) => {
    const { username, cardId } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const invItem = user.inventory.find(item => item.cardId === cardId);
        if (!invItem) return res.status(404).json({ message: 'Card not found in inventory' });

        const currentLevel = invItem.level;
        const upgradeCost = UPGRADE_COSTS[currentLevel];

        if (!upgradeCost) {
            return res.status(400).json({ message: '최대 레벨에 도달했습니다.' });
        }

        if (user.coins < upgradeCost.coins) {
            return res.status(400).json({ message: '코인이 부족합니다.' });
        }

        if (invItem.shards < upgradeCost.shards) {
            return res.status(400).json({ message: '샤드가 부족합니다.' });
        }

        user.coins -= upgradeCost.coins;
        invItem.shards -= upgradeCost.shards;
        invItem.level += 1;

        await user.save();
        res.json({
            message: `${cardId} upgraded to Level ${invItem.level}!`,
            coins: user.coins,
            inventory: user.inventory
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
