const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// 회원가입
router.post('/signup', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ message: '아이디와 비밀번호를 입력해주세요.' });
        if (password.length < 6) return res.status(400).json({ message: '비밀번호는 6자 이상이어야 합니다.' });

        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ message: '이미 존재하는 아이디입니다.' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: '회원가입 성공!' });
    } catch (error) {
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// 로그인
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: '아이디 또는 비밀번호가 올바르지 않습니다.' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: '아이디 또는 비밀번호가 올바르지 않습니다.' });

        res.json({
            message: '로그인 성공!',
            user: { username: user.username, id: user._id, coins: user.coins, activeDeck: user.activeDeck }
        });
    } catch (error) {
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// 프로필/전적 조회
router.get('/profile/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username }).select('-password');
        if (!user) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// 특정 상대와의 전적 조회
router.get('/stats/:username/:opponent', async (req, res) => {
    try {
        const { username, opponent } = req.params;
        const user = await User.findOne({ username }).select('matchHistory');
        if (!user) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });

        const opponentMatches = user.matchHistory.filter(m => m.opponent === opponent);
        if (opponentMatches.length === 0) {
            return res.json({ opponent, totalGames: 0, wins: 0, losses: 0, winRate: 0, lastPlayed: null, matches: [] });
        }

        const wins = opponentMatches.filter(m => m.result === 'win').length;
        const losses = opponentMatches.filter(m => m.result === 'lose').length;
        const lastPlayed = opponentMatches[opponentMatches.length - 1].date;

        res.json({
            opponent,
            totalGames: opponentMatches.length,
            wins,
            losses,
            winRate: parseFloat(((wins / opponentMatches.length) * 100).toFixed(1)),
            lastPlayed,
            matches: opponentMatches.slice(-10).reverse()
        });
    } catch (error) {
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// Leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        const topPlayers = await User.find().sort({ rating: -1 }).limit(100).select('username rating');
        res.json(topPlayers);
    } catch (error) {
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// Decks
router.post('/decks/save', async (req, res) => {
    try {
        const { username, deckName, cards } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: 'User not found' });
        user.savedDecks.push({ name: deckName, cards });
        await user.save();
        res.json(user.savedDecks);
    } catch (error) {
        res.status(500).json({ message: 'Error saving deck' });
    }
});

router.get('/decks/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user.savedDecks);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching decks' });
    }
});

router.delete('/decks/:username/:deckId', async (req, res) => {
    try {
        const { username, deckId } = req.params;
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: 'User not found' });
        user.savedDecks = user.savedDecks.filter(deck => deck._id.toString() !== deckId);
        await user.save();
        res.json(user.savedDecks);
    } catch (error) {
        res.status(500).json({ message: 'Error deleting deck' });
    }
});

router.post('/active-deck', async (req, res) => {
    try {
        const { username, deck } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: 'User not found' });
        user.activeDeck = deck;
        await user.save();
        res.json({ message: 'Active deck updated', activeDeck: user.activeDeck });
    } catch (error) {
        res.status(500).json({ message: 'Error updating active deck' });
    }
});

module.exports = router;
