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
    peakRating: {
        type: Number,
        default: 1000 // Highest rating achieved
    },
    coins: {
        type: Number,
        default: 500 // Starting coins
    },
    winStreak: {
        type: Number,
        default: 0 // Current win streak
    },
    cardLevels: {
        type: Map,
        of: Number,
        default: {} // card_id -> level (1-10)
    },
    matchHistory: [{
        result: { type: String, enum: ['win', 'lose', 'draw'] },
        opponent: String,
        aiDifficulty: String,
        aiDeck: String, // New field for AI Deck name
        date: { type: Date, default: Date.now },
        ratingChange: Number,
        coinsEarned: Number, // Coins earned/lost in this match
        myDeck: [String]
    }],
    savedDecks: [{
        name: { type: String, required: true },
        cards: [String], // Array of card IDs
        createdAt: { type: Date, default: Date.now }
    }]
});

module.exports = mongoose.model('User', userSchema);
