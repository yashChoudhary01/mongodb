const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    class_name: {
        type: String,
        unique: true,
        required: true,
    },
    class_id: {
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
classSchema.pre('save', async function (next) {
    const doc = this;
    if (!doc.class_id) {
        const lastClass = await mongoose.model('Classes').findOne({}, {}, { sort: { 'class_id': -1 } });
        doc.class_id = (lastClass && lastClass.class_id + 1) || 1;
    }
    next();
});

const ClassModel = mongoose.model('Classes', classSchema);

module.exports = ClassModel;
