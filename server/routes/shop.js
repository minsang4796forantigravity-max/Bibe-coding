const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Hardcoded Shop Items
const SHOP_ITEMS = [
    // Emotes
    { id: 'emote_gg', name: 'GG Emote', type: 'emote', price: 500, desc: 'Say Good Game with style!', icon: '🤝' },
    { id: 'emote_fire', name: 'Fire Emote', type: 'emote', price: 300, desc: 'This is fine.', icon: '🔥' },
    { id: 'emote_ghost', name: 'Ghost Emote', type: 'emote', price: 400, desc: 'Spooky!', icon: '👻' },
    { id: 'emote_party', name: 'Party Popper', type: 'emote', price: 300, desc: 'Celebrate victory!', icon: '🎉' },

    // Consumables / Buffs
    { id: 'buff_rating_2x_5d', name: '2x Rating (5 Days)', type: 'buff', price: 1000, desc: 'Double rating gain for 5 days.', icon: '🚀', durationDays: 5 },
    { id: 'item_attendance_ticket', name: 'Attendance Ticket', type: 'consumable', price: 200, desc: 'Recover a missed daily reward.', icon: '🎫' },
];

// GET /api/shop/items
router.get('/items', (req, res) => {
    res.json(SHOP_ITEMS);
});

// POST /api/shop/buy
router.post('/buy', async (req, res) => {
    const { username, itemId } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const item = SHOP_ITEMS.find(i => i.id === itemId);
        if (!item) return res.status(400).json({ message: 'Invalid item' });

        if (user.coins < item.price) {
            return res.status(400).json({ message: 'Not enough coins' });
        }

        // Deduct coins
        user.coins -= item.price;
        let pruchaseMsg = `Purchased ${item.name}!`;

        // Handle Item Type
        if (item.type === 'emote') {
            if (user.inventory.includes(item.id)) {
                return res.status(400).json({ message: 'You already own this emote.' });
            }
            user.inventory.push(item.id);
            // Auto-equip if space (limit 8? user.equippedEmotes)
            if (user.equippedEmotes.length < 8) {
                user.equippedEmotes.push(item.id);
            }
        } else if (item.type === 'buff') {
            // Check if already active
            const existingBuff = user.activeBuffs.find(b => b.type === 'rating_2x');
            const durationMs = item.durationDays * 24 * 60 * 60 * 1000;

            if (existingBuff) {
                // Extend duration
                existingBuff.expiresAt = new Date(new Date(existingBuff.expiresAt).getTime() + durationMs);
                pruchaseMsg = `Extended 2x Rating for ${item.durationDays} days!`;
            } else {
                user.activeBuffs.push({
                    type: 'rating_2x',
                    expiresAt: new Date(Date.now() + durationMs)
                });
            }
        } else if (item.type === 'consumable') {
            // Stacking consumables (Attendance Ticket)
            const existingItem = user.activeBuffs.find(b => b.type === 'attendance_auto');
            if (existingItem) {
                existingItem.count = (existingItem.count || 0) + 1;
            } else {
                user.activeBuffs.push({
                    type: 'attendance_auto',
                    count: 1,
                    expiresAt: null // No expiry, just usage
                });
            }
        }

        await user.save();

        res.json({
            message: pruchaseMsg,
            coins: user.coins,
            inventory: user.inventory,
            activeBuffs: user.activeBuffs
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
