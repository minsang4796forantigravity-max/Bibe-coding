const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Notice = require('../models/Notice');

// Get all notices
router.get('/notices', async (req, res) => {
    try {
        const notices = await Notice.find().sort({ createdAt: -1 }).limit(10);
        res.json(notices);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Post a notice (Admin only - simplified check)
router.post('/notices', async (req, res) => {
    const { username, title, content, type, coinsReward } = req.body;
    if (username !== 'Grand Warden') {
        return res.status(403).json({ message: '관리자 전용 기능입니다.' });
    }

    try {
        console.log(`[Admin] Notice attempt by ${username}: ${title}`);
        const notice = new Notice({ title, content, type, coinsReward });
        await notice.save();
        res.status(201).json(notice);
    } catch (err) {
        console.error(`[Admin] Notice error:`, err);
        res.status(400).json({ message: err.message });
    }
});

// Claim Daily Reward
router.post('/daily-reward', async (req, res) => {
    const { username } = req.body;
    try {
        console.log(`[Economy] Daily reward attempt by ${username}`);
        const user = await User.findOne({ username });
        if (!user) {
            console.log(`[Economy] User ${username} not found`);
            return res.status(404).json({ message: 'User not found' });
        }

        const now = new Date();
        const lastReward = user.lastDailyReward ? new Date(user.lastDailyReward) : null;
        let streak = user.dailyStreak || 0;

        if (lastReward) {
            const isToday = lastReward.getUTCFullYear() === now.getUTCFullYear() &&
                lastReward.getUTCMonth() === now.getUTCMonth() &&
                lastReward.getUTCDate() === now.getUTCDate();
            if (isToday) {
                return res.status(400).json({ message: '오늘은 이미 보상을 받았습니다.' });
            }

            // Calculate days diff
            const diffTime = Math.abs(now - lastReward);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                // Consecutive day
                streak += 1;
            } else if (diffDays > 1) {
                // Missed a day
                // Check if has attendance ticket
                const ticketIndex = user.activeBuffs.findIndex(b => b.type === 'attendance_auto');
                if (ticketIndex !== -1) {
                    const ticket = user.activeBuffs[ticketIndex];
                    if (ticket.count > 0) {
                        ticket.count -= 1;
                        if (ticket.count === 0) user.activeBuffs.splice(ticketIndex, 1);

                        console.log(`[Economy] Used Attendance Ticket for ${username}`);
                        streak += 1; // Saved!
                    } else {
                        streak = 1; // Reset
                    }
                } else {
                    streak = 1; // Reset
                }
            }
        } else {
            streak = 1;
        }

        const rewardCoins = 50 + (streak > 1 ? (streak - 1) * 10 : 0); // Bonus for streak
        user.coins = (user.coins || 0) + rewardCoins;
        user.lastDailyReward = now;
        user.dailyStreak = streak;
        await user.save();

        console.log(`[Economy] Daily reward granted to ${username}: ${rewardCoins} coins (Streak: ${streak})`);
        res.json({ message: `보상 획득! +${rewardCoins} 코인 (연속 ${streak}일)`, coins: user.coins });
    } catch (err) {
        console.error(`[Economy] Daily reward error for ${username}:`, err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
