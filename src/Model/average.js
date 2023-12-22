const mongoose = require('mongoose');

const averageSchema = new mongoose.Schema({
    learner_id: { type: Number, required: true },
    subject_id: { type: Number, required: true },
    average: {
        type: Number,
        required: true,
        validate: {
            validator: function (value) {
                return value >= 0 && value <= 5;
            },
            message: 'Average should be between 0 and 5.',
        },
    },
});

const AverageModel = mongoose.model('averageResult', averageSchema);

module.exports = AverageModel;