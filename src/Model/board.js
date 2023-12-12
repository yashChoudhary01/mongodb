const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
    board_name: {
        type: String,
        unique: true,
        required: true,
    },
    board_id: {
        type: Number,
        unique: true,
    },
    status: {
        type: Number,
        default: 1,
        enum: [0, 1],
    },
});

// Auto-generate class_id starting from 1
boardSchema.pre('save', async function (next) {
    const doc = this;
    if (!doc.board_id) {
        const lastClass = await mongoose.model('boards').findOne({}, {}, { sort: { 'board_id': -1 } });
        doc.board_id = (lastClass && lastClass.board_id + 1) || 1;
    }
    next();
});

const BoardModel = mongoose.model('boards', boardSchema);

module.exports = BoardModel;
