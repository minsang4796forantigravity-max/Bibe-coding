// 환경변수(.env) 읽기
require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');

const GameEngine = require('./GameEngine');
const BotAI = require('./BotAI');
const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/game');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Notice = require('./models/Notice');

// ======================= MongoDB 연결 =======================
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bibe-game';

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log("✅ MongoDB 연결 성공");

        // Create Admin account if it doesn't exist
        const adminUsername = 'Grand Warden';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin777', salt);

        const existingAdmin = await User.findOne({ username: adminUsername });
        if (!existingAdmin) {
            const admin = new User({
                username: adminUsername,
                password: hashedPassword,
                coins: 999999
            });
            await admin.save();
            console.log("👑 Admin 'Grand Warden' created. Password: admin777");

            // Create welcome notice
            const welcomeNotice = new Notice({
                title: 'Welcome to Bibe Royale!',
                content: '새롭게 단장한 로비에 오신 것을 환영합니다. 매일 접속해서 보상을 받고 순위권에 도전하세요!',
                type: 'event'
            });
            await welcomeNotice.save();
        }
    })
    .catch(err => console.error("❌ MongoDB 연결 실패:", err));

// ======================= Express / Socket.io 기본 설정 =======================
const app = express();
app.use(cors());
app.use(express.json());

// 계정 관련 API 라우트
// 클라이언트에서 POST /api/auth/signup, /api/auth/login 호출
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);
// 만약 /api/auth로도 쓰고 싶으면 아래 줄 추가해도 됨
// app.use('/api/auth', authRoutes);

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

// 방마다 GameEngine 저장
const games = new Map(); // roomId -> GameEngine

// ======================= Socket.io 이벤트 =======================
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // 멀티플레이 매칭
    socket.on('join_game', (data) => {
        const { username, deck } = data || {};
        socket.username = username; // Store for reconnection fallback
        let game = null;
        let gameId = null;

        // 찾기 전에, 이미 방에 들어가 있는 같은 유저인지 확인 (재연결 지원)
        if (username && username !== 'Guest') {
            for (const [id, g] of games.entries()) {
                if ((g.state.p1.username === username || g.state.p2.username === username) && !id.startsWith('single_')) {
                    game = g;
                    gameId = id;
                    console.log(`[Server] User ${username} found existing multiplayer game ${gameId}. Handling reconnection.`);
                    break;
                }
            }
        }

        if (!game) {
            // 빈 방 찾기
            for (const [id, g] of games.entries()) {
                if (!g.isFull() && !id.startsWith('single_')) {
                    game = g;
                    gameId = id;
                    break;
                }
            }
        }

        // 없으면 새 게임 생성
        if (!game) {
            gameId = Math.random().toString(36).substring(7);
            game = new GameEngine(gameId, io);
            games.set(gameId, game);
        }

        const playerRole = game.joinGame(socket.id, username);

        // Set player deck if provided
        if (playerRole && deck) {
            game.setPlayerDeck(playerRole, deck);
        }

        if (playerRole) {
            socket.join(gameId);
            socket.emit('game_start', {
                state: game.getSerializableState(),
                player: playerRole,
                gameId: gameId
            });
            console.log(`User ${socket.id} joined room ${gameId} as ${playerRole}`);

            if (game.isFull()) {
                console.log(`Room ${gameId} full. Starting game.`);

                // Ensure both players have decks before starting
                const defaultDeck = ['knight', 'archer', 'giant', 'wizard', 'fireball', 'cannon', 'goblin', 'skeletons'];
                if (!game.state.p1.deck || game.state.p1.deck.length === 0) {
                    console.log('Player 1 missing deck, assigning default');
                    game.setPlayerDeck('p1', defaultDeck);
                }
                if (!game.state.p2.deck || game.state.p2.deck.length === 0) {
                    console.log('Player 2 missing deck, assigning default');
                    game.setPlayerDeck('p2', defaultDeck);
                }

                game.start();
            }
        } else {
            socket.emit('error', 'Room is full');
        }
    });

    // 싱글 플레이 시작
    socket.on('start_single_player', (data) => {
        const { deck, difficulty, username } = data || {};
        socket.username = username; // Store for reconnection fallback
        console.log('[DEBUG] start_single_player received:', { deckLength: deck?.length, difficulty, username });
        const roomId = `single_${socket.id}`;

        // 기존 싱글 게임 있으면 정리
        if (games.has(roomId)) {
            games.get(roomId).stop();
            games.delete(roomId);
        }

        const game = new GameEngine(roomId, io);
        games.set(roomId, game);

        // 플레이어 참가
        const playerRole = game.joinGame(socket.id, username);
        if (deck) {
            game.setPlayerDeck(playerRole, deck);
        }
        console.log('[DEBUG] Player role:', playerRole);

        // 봇 생성 및 참가
        const bot = new BotAI(difficulty || 'medium');
        const botDeck = bot.getDeck();
        const botRole = game.joinGame('bot', 'AI'); // Bot joins as 'bot' ID
        game.setPlayerDeck(botRole, botDeck);
        game.setBot(botRole, bot);

        if (playerRole && botRole) {
            socket.join(roomId);
            const gameState = game.getSerializableState();
            socket.emit('game_start', {
                state: gameState,
                player: playerRole,
                gameId: roomId
            });
            console.log(`✅ Single player game started for ${socket.id} in room ${roomId} with difficulty ${difficulty}`);
            game.start();
        } else {
            console.log('[ERROR] Failed to create game. playerRole:', playerRole, 'botRole:', botRole);
            socket.emit('error', 'Failed to start single player game');
        }
    });

    // 카드 배치
    socket.on('deploy_card', ({ cardId, x, y }) => {
        for (const game of games.values()) {
            if (game.state.p1.id === socket.id || (socket.username && game.state.p1.username === socket.username)) {
                // If it was a username match but ID mismatched, update ID
                if (game.state.p1.id !== socket.id) game.state.p1.id = socket.id;
                game.deployCard('p1', cardId, x, y);
                return;
            } else if (game.state.p2.id === socket.id || (socket.username && game.state.p2.username === socket.username)) {
                if (game.state.p2.id !== socket.id) game.state.p2.id = socket.id;
                game.deployCard('p2', cardId, x, y);
                return;
            }
        }
        console.log(`[WARN] Received deploy_card from ${socket.id} (${socket.username}) but no active game found.`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // TODO: 방 정리 로직 필요하면 여기서
    });
});

// ======================= 서버 시작 =======================
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
