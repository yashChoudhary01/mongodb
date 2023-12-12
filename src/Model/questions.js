const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true,
    },
    question_title: {
        type: String,
        required: true,
    },
    options: [
        {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },
    ],
    remarks: String,
    quiz_id: {
        type: Number,
        required: true,
    },
    correct_answer: {
        type: String,
        required: true,
    },
    class_id: {
        type: Number,
        required: true,
    },
    subject_id: {
        type: Number,
        required: true,
    },
    board_id: {
        type: Number,
        required: true,
    },
    topic_id: {
        type: Number,
        required: true,
    }
});

// Auto-generate subject_id starting from 1
quizSchema.pre('save', async function (next) {
    const doc = this;
    if (!doc.id) {
        const quiz_id = await mongoose.model('Quiz').findOne({}, {}, { sort: { 'id': -1 } });
        doc.id = (quiz_id && quiz_id.id + 1) || 1;
    }
    next();
});

const QuizModel = mongoose.model('Quiz', quizSchema);

module.exports = QuizModel;
