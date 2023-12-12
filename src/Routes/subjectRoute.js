const express = require('express');
const bodyParser = require("body-parser");
// import Cors for cross platform connections
const cors = require('cors');
// User Schema Import
const SubjectModel = require("../Model/subject");
const router = new express.Router();
//middlewire
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
router.use(cors());

// 1. Add Subject(s)
router.post('/addSubjects', async (req, res) => {
    try {
        // Extract data from the request body
        const subjects = req.body;

        // Validate the presence of subjects array
        if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
            return res.status(400).json({ status: 0, message: 'Please provide an array of subjects' });
        }

        const newSubjects = [];

        for (const subjectData of subjects) {
            const { subject_name } = subjectData;

            // Check if subject_name already exists
            const existingSubject = await SubjectModel.findOne({ subject_name });

            if (existingSubject) {
                if (existingSubject.status === 0) {
                    // If subject exists with status 0, update status to 1
                    existingSubject.status = 1;
                    await existingSubject.save();
                    newSubjects.push(existingSubject);
                } else {
                    return res.status(400).json({ status: 0, message: `Subject with name ${subject_name} already exists` });
                }
            } else {
                // Create a new SubjectModel instance
                const newSubject = new SubjectModel({
                    subject_name,
                });

                // Save the new subject to the database
                await newSubject.save();
                newSubjects.push(newSubject);
            }
        }

        res.status(201).json({ status: 1, message: 'Subjects added successfully' });
    } catch (error) {
        console.error('Error adding subjects:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 2. Get all subjects

router.get("/getSubject", async (req, res) => {
    try {
        // Fetch all board from the database
        const subject = await SubjectModel.find({ status: 1 }, { subject_name: 1, subject_id: 1, _id: 0 });

        // Send the filtered data in the response
        res.status(200).json({ status: 1, message: "Subject data", data: subject });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// 2. Get all subjects deleted

router.get("/getSubjectDeleted", async (req, res) => {
    try {
        // Fetch all board from the database
        const subject = await SubjectModel.find({ status: 0 }, { subject_name: 1, subject_id: 1, _id: 0 });

        // Send the filtered data in the response
        res.status(200).json({ status: 1, message: "Subject data", data: subject });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// 2. Update Subject Status by ID
router.post('/updateSubjectStatusById', async (req, res) => {
    try {
        const { id } = req.body;

        // Validate the presence of the subject ID
        if (!id) {
            return res.status(400).json({ status: 0, message: 'Please provide a subject ID' });
        }

        // Find the subject by ID and update its status to 0
        const updatedSubject = await SubjectModel.findOneAndUpdate(
            { subject_id: id },
            { $set: { status: 0 } },
            { new: true } // Return the updated document
        );

        if (updatedSubject) {
            res.status(200).json({ status: 1, message: 'Subject status updated successfully' });
        } else {
            res.status(404).json({ status: 0, message: 'Subject not found' });
        }
    } catch (error) {
        console.error('Error updating subject status:', error);
        res.status(500).json({ status: 0, error: 'Internal Server Error' });
    }
});

// 3. Delete Subject(s) by ID
router.post('/deleteSubjectsById', async (req, res) => {
    try {
        const { id } = req.body;

        // Validate the presence of the subject ID(s)
        if (!id) {
            return res.status(400).json({ status: 0, message: 'Please provide a subject ID or an array of subject IDs' });
        }

        // If a single ID is provided, convert it to an array
        const subjectIds = Array.isArray(id) ? id : [id];

        // Delete the subjects by ID(s)
        const deleteResult = await SubjectModel.deleteMany({ id: { $in: subjectIds } });

        if (deleteResult.deletedCount > 0) {
            res.status(200).json({ status: 1, message: 'Subject(s) deleted successfully' });
        } else {
            res.status(404).json({ status: 0, message: 'Subject(s) not found' });
        }
    } catch (error) {
        console.error('Error deleting subject(s):', error);
        res.status(500).json({ status: 0, error: 'Internal Server Error' });
    }
});

module.exports = router;