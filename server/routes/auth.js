const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// 회원가입
router.post('/signup', async (req, res) => {
    try {
        const { username, password } = req.body;

        // 유효성 검사
        if (!username || !password) {
            return res.status(400).json({ message: '아이디와 비밀번호를 입력해주세요.' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: '비밀번호는 6자 이상이어야 합니다.' });
        }

        // 중복 확인
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: '이미 존재하는 아이디입니다.' });
        }

        // 비밀번호 해싱
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 사용자 생성
        const newUser = new User({
            username,
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json({ message: '회원가입 성공!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// 로그인
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // 사용자 확인
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: '아이디 또는 비밀번호가 올바르지 않습니다.' });
        }

        // 비밀번호 확인
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: '아이디 또는 비밀번호가 올바르지 않습니다.' });
        }

        // 로그인 성공 (세션/토큰 없이 간단히 성공 응답)
        res.json({
            message: '로그인 성공!',
            user: {
                username: user.username,
                id: user._id
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// 프로필/전적 조회
router.get('/profile/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username }).select('-password');
        if (!user) {
            return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

module.exports = router;
