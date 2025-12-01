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

// ======================= MongoDB 연결 =======================
const MONGO_URI = process.env.MONGO_URI;  // ← 더 이상 localhost로 fallback 하지 않음

if (!MONGO_URI) {
    console.error("❌ 환경 변수 MONGO_URI가 설정되어 있지 않습니다.");
    process.exit(1);
}

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB 연결 성공"))
    .catch(err => {
        console.error("❌ MongoDB 연결 실패:", err);
        process.exit(1);
    });


// ======================= Express / Socket.io 기본 설정 =======================
const app = express();
app.use(cors());
app.use(express.json());

// 계정 관련 API 라우트
// 클라이언트에서 POST /api/auth/signup, /api/auth/login 호출
app.use('/api/auth', authRoutes);
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
        const username = data ? data.username : null;
        let game = null;
        let gameId = null;

        // 기다리는 게임 찾기
        for (const [id, g] of games.entries()) {
            if (!g.isFull() && !id.startsWith('single_')) {
                game = g;
                gameId = id;
                break;
            }
        }

        // 없으면 새 게임 생성
        if (!game) {
            gameId = Math.random().toString(36).substring(7);
            game = new GameEngine(gameId, io);
            games.set(gameId, game);
        }

        const playerRole = game.joinGame(socket.id, username);

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
                game.start();
            }
        } else {
            socket.emit('error', 'Room is full');
        }
    });

    // 싱글 플레이 시작
    socket.on('start_single_player', (data) => {
        const { deck, difficulty, username } = data || {};
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
            if (game.state.p1.id === socket.id) {
                game.deployCard('p1', cardId, x, y);
                break;
            } else if (game.state.p2.id === socket.id) {
                game.deployCard('p2', cardId, x, y);
                break;
            }
        }
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
