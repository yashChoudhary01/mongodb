const express = require('express');
const bodyParser = require("body-parser");
// import Cors for cross platform connections
const cors = require('cors');
// User Schema Import
const SubmitModel = require("../Model/submitResult");
const AverageModel = require("../Model/average");
const SubjectModel = require("../Model/subject");
const TopicModel = require("../Model/topic");
const router = new express.Router();
//middlewire
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
router.use(cors());

// POST route to handle incoming payload data
router.post('/submitResult', async (req, res) => {
    try {
        // Check if all required fields are present in the request body
        const requiredFields = ['learner_id', 'learner_name', 'subject_id', 'topic_id', 'questions', 'time_taken', 'date'];
        for (const field of requiredFields) {
            if (!(field in req.body)) {
                return res.status(400).json({ status: 0, error: `Missing required field: ${field}` });
            }
        }

        const { questions, learner_id, subject_id, topic_id } = req.body;
        let counter = 0;

        // Loop through the questions array
        for (const question of questions) {
            // Check if correct_answer and answer are equal
            if (question.correct_answer == question.answer) {
                counter++;
            }
        }

        // Calculate result out of 5
        const resultOutOfFive = Math.round((counter / questions.length) * 5);

        // Fetch subject_name from the subjects collection
        const subject = await SubjectModel.findOne({ subject_id });
        const subject_name = subject ? subject.subject_name : 'Unknown Subject';

        // Fetch topic_name from the topics collection
        const topic = await TopicModel.findOne({ topic_id });
        const topic_name = topic ? topic.topic_name : 'Unknown Topic';

        // Check if the subject_id is already present in the AverageModel collection
        const existingAverage = await AverageModel.findOne({ learner_id, subject_id });

        if (!existingAverage) {
            // If subject_id is not present, create a new document
            const newAverage = new AverageModel({
                learner_id,
                subject_id,
                average: resultOutOfFive,
            });

            await newAverage.save();
        } else {
            // If subject_id is already present, update the existing document
            const updatedAverage = await AverageModel.findOneAndUpdate(
                { learner_id, subject_id },
                { $set: { average: (existingAverage.average + resultOutOfFive) / 2 } },
                { new: true, runValidators: true }
            );
        }

        // Assuming the payload is sent in the request body
        const payloadData = {
            ...req.body,
            results_out_of_five: resultOutOfFive,
            subject_name,
            topic_name,
            total_question: questions.length,
            total_correct_answer: counter
        };

        // Create a new payload document using the SubmitModel
        const payload = new SubmitModel(payloadData);

        // Save the payload to the database
        await payload.save();

        res.status(201).json({ status: 1, message: 'Payload saved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 0, error: 'Internal Server Error' });
    }
});

module.exports = router;