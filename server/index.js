require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const GameEngine = require('./GameEngine');
const BotAI = require('./BotAI');
const authRoutes = require('./routes/auth');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bibe-game')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', authRoutes);

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const games = new Map(); // roomId -> GameEngine

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_game', (data) => {
        const username = data ? data.username : null;
        let game = null;
        let gameId = null;

        // Find waiting game
        for (const [id, g] of games.entries()) {
            if (!g.isFull() && !id.startsWith('single_')) {
                game = g;
                gameId = id;
                break;
            }
        }

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

    socket.on('start_single_player', (data) => {
        const { deck, difficulty, username } = data || {};
        console.log('[DEBUG] start_single_player received:', { deckLength: deck?.length, difficulty, username });
        const roomId = `single_${socket.id}`;

        // Clean up existing game if any
        if (games.has(roomId)) {
            games.get(roomId).stop();
            games.delete(roomId);
        }

        const game = new GameEngine(roomId, io);
        games.set(roomId, game);

        // Add Human
        const playerRole = game.joinGame(socket.id, username);
        if (deck) {
            game.setPlayerDeck(playerRole, deck);
        }
        console.log('[DEBUG] Player role:', playerRole);

        // Add Bot
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

    socket.on('deploy_card', ({ cardId, x, y }) => {
        // Find which game this socket is in
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
        // Handle cleanup if needed
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
