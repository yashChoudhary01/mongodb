const express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors');
const Conversation = require("../Model/conversations.js");
const router = new express.Router();
//middlewire
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
router.use(cors());

//new conversations

router.post("/", async (req, res) => {
    const { senderId, receiverId } = req.body;

    if (!senderId || !receiverId) {
        return res.status(400).json({ status: 0, message: "Please provide sender and receiver ids" });
    }

    const sortedMembers = [senderId, receiverId].sort();

    try {
        // Check if conversation with these members already exists
        const existingConversation = await Conversation.findOne({
            members: {
                $all: sortedMembers
            }
        });

        if (existingConversation) {
            return res.status(200).json(existingConversation);
        }

        // If conversation does not exist, create a new one
        const newConversation = new Conversation({
            members: sortedMembers,
        });

        const savedConversation = await newConversation.save();
        res.status(200).json(savedConversation);
    } catch (err) {
        res.status(500).json({ status: 0, message: "Internal server error" });
    }
});
//get conversation of a user

router.get("/:userId", async (req, res) => {
    console.log(req.params.userId);
    if (!req.params.userId) {
        res.status(400).json({ status: 0, message: "User id not provided" });
    }
    try {
        const conversation = await Conversation.find({
            members: { $in: [req.params.userId] },
        });
        console.log(conversation);
        res.status(200).json(conversation);
    } catch (err) {
        res.status(500).json(err);
    }
});


// get conv includes two userId

router.get("/find/:firstUserId/:secondUserId", async (req, res) => {
    const { firstUserId, secondUserId } = req.params;

    // Check if both user IDs are provided
    if (!firstUserId || !secondUserId) {
        return res.status(400).json({ status: 0, message: "Both user IDs are required" });
    }

    try {
        const conversation = await Conversation.findOne({
            members: { $all: [firstUserId, secondUserId] },
        });

        // Check if a conversation is found
        if (!conversation) {
            return res.status(404).json({ status: 0, message: "Conversation not found" });
        }

        res.status(200).json(conversation);
    } catch (err) {
        res.status(500).json({ status: 0, message: "Internal server error" });
    }
});


module.exports = router;