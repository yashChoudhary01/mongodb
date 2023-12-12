const express = require('express');
const bodyParser = require("body-parser");
// import Cors for cross platform connections
const cors = require('cors');
// User Schema Import
const QuizModel = require("../Model/questions");
const router = new express.Router();
//middlewire
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
router.use(cors());

// 1. Add Questions
router.post('/addQuestions', async (req, res) => {
    try {
        const questions = req.body;

        // Validate the presence of questions array
        if (!questions || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ status: 0, message: 'Please provide an array of questions' });
        }

        const newQuestions = [];

        // Validate and save each question in the array
        for (const question of questions) {
            const {
                question_title,
                options,
                remarks,
                correct_answer,
                class_id,
                subject_id,
                board_id,
                quiz_id,
                topic_id
            } = question;

            // Validate the required fields for each question
            if (!question_title || !options || !correct_answer || !class_id || !subject_id || !board_id || !quiz_id || !topic_id) {
                return res.status(400).json({ status: 0, message: 'Please provide all required fields for each question' });
            }

            // Create a new QuizModel instance for each question
            const newQuestion = new QuizModel({
                question_title,
                options,
                remarks,
                correct_answer,
                class_id,
                subject_id,
                board_id,
                quiz_id,
                topic_id,
            });

            // Save each new question to the database
            await newQuestion.save();
            newQuestions.push(newQuestion);
        }
        // console.log(newQuestions);
        res.status(201).json({ status: 1, message: 'Questions added successfully' });
    } catch (error) {
        console.error('Error adding questions:', error);
        res.status(500).json({ status: 0, error: 'Internal Server Error' });
    }
});

// Get all questions
router.get('/getAllQuestions', async (req, res) => {
    try {
        // Fetch all questions from the database
        // const questions = await QuizModel.find({}, { _id: 0 });
        const questions = await QuizModel.find({});
        res.status(200).json({ status: 1, message: 'All questions retrieved successfully', data: questions });
    } catch (error) {
        console.error('Error retrieving questions:', error);
        res.status(500).json({ status: 0, error: 'Internal Server Error' });
    }
});

// Get questions based on class_id, subject_id, and board_id
router.post('/getQuestionsByCriteria', async (req, res) => {
    try {
        const { class_id, subject_id, board_id, topic_id } = req.body;
        console.log(req.body);

        // Validate the required fields
        if (!class_id || !subject_id || !board_id || !topic_id) {
            return res.status(400).json({ status: 0, message: 'Please provide all fields' });
        }

        // Fetch questions based on the provided criteria
        const questions = await QuizModel.find({ class_id, subject_id, board_id, topic_id }, { class_id: 0, subject_id: 0, board_id: 0 });

        res.status(200).json({ status: 1, message: 'Questions retrieved successfully', data: questions });
    } catch (error) {
        console.error('Error retrieving questions by criteria:', error);
        res.status(500).json({ status: 0, error: 'Internal Server Error' });
    }
});

// 2. Delete Question(s) by ID
router.post('/deleteQuestionById', async (req, res) => {
    try {
        const { id } = req.body;

        // Validate the presence of the question ID(s)
        if (!id) {
            return res.status(400).json({ status: 0, message: 'Please provide a question ID or an array of question IDs' });
        }

        // If a single ID is provided, convert it to an array
        const questionIds = Array.isArray(id) ? id.map(Number) : [Number(id)];

        // Delete the questions by ID(s)
        const deleteResult = await QuizModel.deleteMany({ id: { $in: questionIds } });

        if (deleteResult.deletedCount > 0) {
            res.status(200).json({ status: 1, message: 'Question(s) deleted successfully' });
        } else {
            res.status(404).json({ status: 0, message: 'Question(s) not found' });
        }
    } catch (error) {
        console.error('Error deleting question(s):', error);
        res.status(500).json({ status: 0, error: 'Internal Server Error' });
    }
});

module.exports = router;