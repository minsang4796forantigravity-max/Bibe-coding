const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { UNITS } = require('../constants');

// Get card levels for a user
router.get('/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Convert Map to object for JSON response
        const cardLevels = {};
        if (user.cardLevels) {
            user.cardLevels.forEach((level, cardId) => {
                cardLevels[cardId] = level;
            });
        }

        res.json({
            cardLevels,
            coins: user.coins || 500
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching card levels', error: error.message });
    }
});

// Level up a card
router.post('/level-up', async (req, res) => {
    try {
        const { username, cardId } = req.body;

        if (!username || !cardId) {
            return res.status(400).json({ message: 'Username and cardId required' });
        }

        // Verify card exists
        const cardKey = cardId.toUpperCase();
        if (!UNITS[cardKey]) {
            return res.status(400).json({ message: 'Invalid card ID' });
        }

        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Get current level (default to 1)
        const currentLevel = user.cardLevels.get(cardId) || 1;

        // Check max level
        if (currentLevel >= 10) {
            return res.status(400).json({ message: 'Card is already at max level' });
        }

        // Calculate cost: 100 * 2^(level-1)
        const cost = 100 * Math.pow(2, currentLevel - 1);

        // Check if user has enough coins
        if ((user.coins || 0) < cost) {
            return res.status(400).json({
                message: 'Not enough coins',
                required: cost,
                current: user.coins || 0
            });
        }

        // Update level and deduct coins
        user.cardLevels.set(cardId, currentLevel + 1);
        user.coins -= cost;

        await user.save();

        res.json({
            success: true,
            newLevel: currentLevel + 1,
            coinsRemaining: user.coins,
            coinsSpent: cost
        });
    } catch (error) {
        res.status(500).json({ message: 'Error leveling up card', error: error.message });
    }
});

module.exports = router;
