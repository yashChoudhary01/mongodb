const express = require('express');
const bodyParser = require("body-parser");
// import Cors for cross platform connections
const cors = require('cors');
// User Schema Import
const ClassModel = require('../Model/schema');
const router = new express.Router();
//middlewire
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
router.use(cors());

// Get Hello Request

router.get("/", (req, res) => {
    res.status(200).send('Hello World, Hii Yash');
});
// Classes Routes
// 1. Add Classes
router.post('/addClasses', async (req, res) => {
    try {
        // Extract data from the request body
        const classes = req.body;

        // Validate the presence of classes array
        if (!classes || !Array.isArray(classes) || classes.length === 0) {
            return res.status(400).json({ status: 0, message: 'Please provide an array of classes' });
        }

        const newClasses = [];

        for (const classData of classes) {
            const { class_name } = classData;

            // Check if class_name already exists
            const existingClass = await ClassModel.findOne({ class_name });

            if (existingClass) {
                if (existingClass.status == 0) {
                    // If class exists with status 0, update status to 1
                    existingClass.status = 1;
                    await existingClass.save();
                    newClasses.push(existingClass);
                } else {
                    return res.status(400).json({ status: 0, message: `Class with name ${class_name} already exists` });
                }
            } else {
                // Create a new ClassModel instance
                const newClass = new ClassModel({
                    class_name,
                });

                // Save the new class to the database
                await newClass.save();
                newClasses.push(newClass);
            }
        }

        res.status(201).json({ status: 1, message: 'Classes added successfully' });
    } catch (error) {
        console.error('Error adding classes:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 2. Get Classes
router.get("/getClasses", async (req, res) => {
    try {
        // Fetch classes with status equal to 1 from the database
        const classes = await ClassModel.find({ status: 1 }, { class_name: 1, class_id: 1, _id: 0 });

        // Send the filtered data in the response
        res.status(200).json({ status: 1, message: "Classes data", data: classes });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});
// 3. Get Classes
router.get("/getClassesDeteled", async (req, res) => {
    try {
        // Fetch classes with status equal to 1 from the database
        const classes = await ClassModel.find({ status: 0 }, { class_name: 1, class_id: 1, _id: 0 });

        // Send the filtered data in the response
        res.status(200).json({ status: 1, message: "Classes data", data: classes });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// 2. Delete Classes by ID(s)
router.post('/deleteClassesById', async (req, res) => {
    try {
        const { id } = req.body;

        // Validate the presence of the class ID(s)
        if (!id) {
            return res.status(400).json({ status: 0, message: 'Please provide a class ID or an array of class IDs' });
        }

        // If a single ID is provided, convert it to an array
        const classIds = Array.isArray(id) ? id : [id];

        // Delete the classes by ID(s)
        const deleteResult = await ClassModel.deleteMany({ class_id: { $in: classIds } });

        if (deleteResult.deletedCount > 0) {
            res.status(200).json({ status: 1, message: 'Class(es) deleted successfully' });
        } else {
            res.status(404).json({ status: 0, message: 'Class(es) not found' });
        }
    } catch (error) {
        console.error('Error deleting class(es):', error);
        res.status(500).json({ status: 0, error: 'Internal Server Error' });
    }
});

// 3. Update Class Status by ID
router.post('/updateClassStatusById', async (req, res) => {
    try {
        const { id } = req.body;

        // Validate the presence of the class ID
        if (!id) {
            return res.status(400).json({ status: 0, message: 'Please provide a class ID' });
        }

        // Find the class by ID and update its status to 0
        const updatedClass = await ClassModel.findOneAndUpdate(
            { class_id: id },
            { $set: { status: 0 } },
            { new: true } // Return the updated document
        );

        if (updatedClass) {
            res.status(200).json({ status: 1, message: 'Class delete successfully' });
        } else {
            res.status(404).json({ status: 0, message: 'Class not found' });
        }
    } catch (error) {
        console.error('Error updating class status:', error);
        res.status(500).json({ status: 0, error: 'Internal Server Error' });
    }
});

module.exports = router;