const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');
const TopicModal = require("../Model/topic");
const router = new express.Router();
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
router.use(cors());

// 1. Add Topic list
router.post("/addTopics", async (req, res) => {
    try {
        const topics = req.body;

        // Validate the presence of topics array
        if (!topics || !Array.isArray(topics) || topics.length === 0) {
            return res.status(400).json({ status: 0, message: 'Please provide an array of topics' });
        }

        const newTopics = [];

        for (const topicData of topics) {
            const { topic_name, subject_id } = topicData;

            // Check if a topic with the same name and subject_id already exists
            const existingTopic = await TopicModal.findOne({ topic_name, subject_id });

            if (existingTopic) {
                if (existingTopic.status === 0) {
                    // If topic exists with status 0, update status to 1
                    existingTopic.status = 1;
                    await existingTopic.save();
                    newTopics.push(existingTopic);
                } else {
                    return res.status(400).json({ status: 0, message: `Topic with name ${topic_name} already exists for the given subject` });
                }
            } else {
                // If no existing topic found, proceed to add the new topic
                const newTopic = new TopicModal({ topic_name, subject_id });
                await newTopic.save();
                newTopics.push(newTopic);
            }
        }

        res.status(200).json({ status: 1, message: 'Topics added successfully' });
    } catch (error) {
        console.error('Error adding topics:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 2. Get all Topics
router.get("/getAllTopics", async (req, res) => {
    try {
        // Fetch all board from the database
        const topics = await TopicModal.find({ status: 1 }, { topic_name: 1, topic_id: 1, subject_id: 1, _id: 0 });

        // Send the filtered data in the response
        res.status(200).json({ status: 1, message: "Topics data", data: topics });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


// 3. Get all Topics
router.get("/getAllTopicsDeteled", async (req, res) => {
    try {
        // Fetch all board from the database
        const topics = await TopicModal.find({ status: 0 }, { topic_name: 1, topic_id: 1, subject_id: 1, _id: 0 });

        // Send the filtered data in the response
        res.status(200).json({ status: 1, message: "Topics data", data: topics });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// 4. Get Topic by subject_id
router.get("/getTopicsBySubject", async (req, res) => {
    try {
        const subject_id = req.query.subject_id;

        // Validate if subject_id is provided
        if (!subject_id) {
            return res.status(400).json({ status: 0, message: 'Please provide subject_id parameter' });
        }

        // Fetch all topics for the given subject_id from the database
        const topics = await TopicModal.find({ subject_id, status: 1 }, { topic_name: 1, topic_id: 1, subject_id: 1, _id: 0 });

        // Send the filtered data in the response
        res.status(200).json({ status: 1, message: `Topics data for subject_id ${subject_id}`, data: topics });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// 5. Update Topic Status by ID
router.post('/updateTopicStatusById', async (req, res) => {
    try {
        const { id } = req.body;

        // Validate the presence of the topic ID
        if (!id) {
            return res.status(400).json({ status: 0, message: 'Please provide a topic ID' });
        }

        // Find the topic by ID and update its status to 0
        const updatedTopic = await TopicModal.findOneAndUpdate(
            { topic_id: id },
            { $set: { status: 0 } },
            { new: true } // Return the updated document
        );

        if (updatedTopic) {
            res.status(200).json({ status: 1, message: 'Topic status updated successfully' });
        } else {
            res.status(404).json({ status: 0, message: 'Topic not found' });
        }
    } catch (error) {
        console.error('Error updating topic status:', error);
        res.status(500).json({ status: 0, error: 'Internal Server Error' });
    }
});


// 6. Delete Topic(s) by ID
router.post('/deleteTopicsById', async (req, res) => {
    try {
        const { id } = req.body;

        // Validate the presence of the topic ID(s)
        if (!id) {
            return res.status(400).json({ status: 0, message: 'Please provide a topic ID or an array of topic IDs' });
        }

        // If a single ID is provided, convert it to an array
        const topicIds = Array.isArray(id) ? id : [id];

        // Delete the topics by ID(s)
        const deleteResult = await TopicModal.deleteMany({ topic_id: { $in: topicIds } });

        if (deleteResult.deletedCount > 0) {
            res.status(200).json({ status: 1, message: 'Topic(s) deleted successfully' });
        } else {
            res.status(404).json({ status: 0, message: 'Topic(s) not found' });
        }
    } catch (error) {
        console.error('Error deleting topic(s):', error);
        res.status(500).json({ status: 0, error: 'Internal Server Error' });
    }
});

module.exports = router;