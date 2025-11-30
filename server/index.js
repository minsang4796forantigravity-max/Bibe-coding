const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const GameEngine = require('./GameEngine');
const BotAI = require('./BotAI');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all for now
        methods: ["GET", "POST"]
    }
});

const games = {}; // roomId -> GameEngine

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_game', (roomId, selectedDeck) => {
        let game = games[roomId];
        if (!game) {
            game = new GameEngine(roomId, io);
            games[roomId] = game;
        }

        const playerRole = game.addPlayer(socket.id, selectedDeck || []); // 덱 정보 전달
        if (playerRole) {
            socket.join(roomId);
            socket.emit('game_start', {
                state: game.getSerializableState(),
                player: playerRole
            });
            console.log(`User ${socket.id} joined room ${roomId} as ${playerRole}`);

            if (game.state.p1.id && game.state.p2.id) {
                console.log(`Room ${roomId} full. Starting game.`);
                game.start();
            }
        } else {
            socket.emit('error', 'Room is full');
        }
    });

    socket.on('start_single_player', ({ deck, difficulty }) => {
        console.log('[DEBUG] start_single_player received:', { deckLength: deck?.length, difficulty });
        const roomId = `single_${socket.id}`;

        // Clean up existing game if any
        if (games[roomId]) {
            games[roomId].stop();
            delete games[roomId];
        }

        const game = new GameEngine(roomId, io);
        games[roomId] = game;

        // Add Human
        const playerRole = game.addPlayer(socket.id, deck || []);
        console.log('[DEBUG] Player role:', playerRole);

        // Add Bot
        const bot = new BotAI(difficulty || 'medium');
        const botDeck = bot.getDeck();
        console.log('[DEBUG] Bot deck length:', botDeck?.length);
        const botRole = game.addPlayer('bot', botDeck);
        console.log('[DEBUG] Bot role:', botRole);
        game.setBot(botRole, bot);

        if (playerRole && botRole) {
            socket.join(roomId);
            const gameState = game.getSerializableState();
            socket.emit('game_start', {
                state: gameState,
                player: playerRole
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
        for (const roomId in games) {
            const game = games[roomId];
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
        // Handle cleanup if needed (end game, etc.)
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
