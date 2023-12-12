const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    subject_name: {
        type: String,
        unique: true,
        required: true,
    },
    subject_id: {
        type: Number,
        unique: true,
    },
    status: {
        type: Number,
        default: 1,
        enum: [0, 1],
    },
});

// Auto-generate subject_id starting from 1
subjectSchema.pre('save', async function (next) {
    const doc = this;
    if (!doc.subject_id) {
        const lastSubject = await mongoose.model('subjects').findOne({}, {}, { sort: { 'subject_id': -1 } });
        doc.subject_id = (lastSubject && lastSubject.subject_id + 1) || 1;
    }
    next();
});

const SubjectModel = mongoose.model('subjects', subjectSchema);

module.exports = SubjectModel;
