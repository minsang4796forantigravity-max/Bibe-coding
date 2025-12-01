const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    rating: {
        type: Number,
        default: 1000 // Starting rating
    },
    matchHistory: [{
        result: { type: String, enum: ['win', 'lose', 'draw'] },
        opponent: String,
        aiDifficulty: String,
        aiDeck: String, // New field for AI Deck name
        date: { type: Date, default: Date.now },
        ratingChange: Number,
        myDeck: [String]
    }],
    savedDecks: [{
        name: { type: String, required: true },
        cards: [String], // Array of card IDs
        createdAt: { type: Date, default: Date.now }
    }]
});

module.exports = mongoose.model('User', userSchema);
