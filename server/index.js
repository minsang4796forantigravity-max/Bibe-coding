const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const GameEngine = require('./GameEngine');

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

    socket.on('deploy_card', ({ cardId, x, y }) => {
        // Find which game this socket is in
        // Inefficient search but okay for prototype
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
