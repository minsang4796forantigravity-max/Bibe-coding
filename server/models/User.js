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
        result: String, // 'win' or 'lose'
        opponent: String,
        aiDifficulty: String, // 'easy', 'medium', 'hard', 'impossible' for AI games, null for PvP
        ratingChange: Number, // Rating gained/lost in this match
        date: {
            type: Date,
            default: Date.now
        },
        myDeck: [String] // Array of card IDs
    }]
});

module.exports = mongoose.model('User', userSchema);
