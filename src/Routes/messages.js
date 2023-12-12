const express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors');
const Message = require("../Model/messages.js");
const router = new express.Router();
//middlewire
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
router.use(cors());

router.post("/", async (req, res) => {
    const { conversationId, sender, text } = req.body; // Assuming you have a 'text' field for the message
    if (!conversationId || !sender) {
        return res.status(400).json({ status: 0, message: "Please provide conversationId, sender, and text" });
    }

    const newMessage = new Message({
        conversationId,
        sender,
        text,
        // Add other message properties if necessary
    });

    try {
        const savedMessage = await newMessage.save();
        res.status(200).json(savedMessage);
    } catch (err) {
        res.status(500).json(err);
    }
});

//get

router.get("/:conversationId", async (req, res) => {
    const { conversationId } = req.params;
    if (!conversationId) {
        return res.status(400).json({ status: 0, message: "Please provide conversationId" });
    }
    try {
        const messages = await Message.find({
            conversationId: req.params.conversationId,
        });
        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
