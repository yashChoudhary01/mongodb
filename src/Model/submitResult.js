const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question_id: { type: String, required: true },
    correct_answer: { type: String, required: true },
    answer: { type: String },
});

const submitSchema = new mongoose.Schema({
    learner_id: { type: Number, required: true },
    learner_name: { type: String, required: true },
    subject_id: { type: Number, required: true },
    subject_name: { type: String, required: true },
    topic_id: { type: Number, required: true },
    topic_name: { type: String, required: true },
    questions: { type: [questionSchema], required: true },
    results_out_of_five: { type: Number, default: 0 },
    date: { type: String, required: true },
    total_question: { type: Number },
    total_correct_answer: { type: Number },
    time_taken: { type: Number },
    average: { type: Number, default: 0 },
});

const SubmitModal = mongoose.model('quizResult', submitSchema);

module.exports = SubmitModal;