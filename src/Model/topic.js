const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
    topic_name: {
        type: String,
        required: true,
    },
    topic_id: {
        type: Number,
        unique: true,
    },
    status: {
        type: Number,
        default: 1,
        enum: [0, 1]
    },
    subject_id: {
        type: Number,
        required: true,
    }
})

topicSchema.pre("save", async function (next) {
    const doc = this;
    if (!doc.topic_id) {
        const lastTopicId = await mongoose.model("topics").findOne({}, {}, { sort: { 'topic_id': -1 } });
        doc.topic_id = (lastTopicId && lastTopicId.topic_id + 1) || 1;
    }
    next();
});

const TopicModal = mongoose.model('topics', topicSchema);
module.exports = TopicModal;