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
    coins: {
        type: Number,
        default: 100 // Starting coins
    },
    lastDailyReward: {
        type: Date,
        default: null
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
    }],
    savedDecks: {
        type: [{
            name: { type: String, required: true },
            cards: [String], // Array of card IDs
            createdAt: { type: Date, default: Date.now }
        }],
        default: []
    },
    inventory: {
        type: [mongoose.Schema.Types.Mixed], // Flexible list of items (IDs or objects)
        default: []
    },
    activeBuffs: {
        type: [{
            type: { type: String, required: true }, // 'rating_2x', 'attendance_auto'
            expiresAt: { type: Date, default: null }, // Null for single-use items like attendance ticket
            count: { type: Number, default: 1 } // For consumable stacks
        }],
        default: []
    },
    dailyStreak: {
        type: Number,
        default: 0
    },
    equippedEmotes: {
        type: [String],
        default: ['emote_thumbsup', 'emote_angry', 'emote_crying', 'emote_laugh'] // Default basic emotes
    },
    activeDeck: {
        type: [String],
        default: ['knight', 'archer', 'giant', 'wizard', 'fireball', 'cannon', 'goblin', 'skeletons']
    }
});

module.exports = mongoose.model('User', userSchema);
