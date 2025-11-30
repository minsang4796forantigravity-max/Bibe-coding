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
    matchHistory: [{
        result: String, // 'win' or 'lose'
        opponent: String,
        date: {
            type: Date,
            default: Date.now
        },
        myDeck: [String] // Array of card IDs
    }]
});

module.exports = mongoose.model('User', userSchema);
