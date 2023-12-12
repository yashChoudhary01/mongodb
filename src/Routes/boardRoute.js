const express = require('express');
const bodyParser = require("body-parser");
// import Cors for cross platform connections
const cors = require('cors');
// User Schema Import
const BoardModel = require("../Model/board");
const router = new express.Router();
//middlewire
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
router.use(cors());

// 1. Add Board(s)
router.post('/addBoards', async (req, res) => {
    try {
        // Extract data from the request body
        const boards = req.body;

        // Validate the presence of boards array
        if (!boards || !Array.isArray(boards) || boards.length === 0) {
            return res.status(400).json({ status: 0, message: 'Please provide an array of boards' });
        }

        const newBoards = [];

        for (const boardData of boards) {
            const { board_name } = boardData;

            // Check if board_name already exists
            const existingBoard = await BoardModel.findOne({ board_name });

            if (existingBoard) {
                if (existingBoard.status === 0) {
                    // If board exists with status 0, update status to 1
                    existingBoard.status = 1;
                    await existingBoard.save();
                    newBoards.push(existingBoard);
                } else {
                    return res.status(400).json({ status: 0, message: `Board with name ${board_name} already exists` });
                }
            } else {
                // Create a new BoardModel instance
                const newBoard = new BoardModel({
                    board_name,
                });

                // Save the new board to the database
                await newBoard.save();
                newBoards.push(newBoard);
            }
        }

        res.status(201).json({ status: 1, message: 'Boards added successfully' });
    } catch (error) {
        console.error('Error adding boards:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 2. Get all Board

router.get("/getBoard", async (req, res) => {
    try {
        // Fetch all board from the database
        const board = await BoardModel.find({ status: 1 }, { board_name: 1, board_id: 1, _id: 0 });

        // Send the filtered data in the response
        res.status(200).json({ status: 1, message: "Board data", data: board });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// 3. Get all Board deleted

router.get("/getBoardDeleted", async (req, res) => {
    try {
        // Fetch all board from the database
        const board = await BoardModel.find({ status: 0 }, { board_name: 1, board_id: 1, _id: 0 });

        // Send the filtered data in the response
        res.status(200).json({ status: 1, message: "Board data", data: board });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// 4. Update Board Status by ID
router.post('/updateBoardStatusById', async (req, res) => {
    try {
        const { id } = req.body;

        // Validate the presence of the board ID
        if (!id) {
            return res.status(400).json({ status: 0, message: 'Please provide a board ID' });
        }

        // Find the board by ID and update its status to 0
        const updatedBoard = await BoardModel.findOneAndUpdate(
            { board_id: id },
            { $set: { status: 0 } },
            { new: true } // Return the updated document
        );

        if (updatedBoard) {
            res.status(200).json({ status: 1, message: 'Board status updated successfully' });
        } else {
            res.status(404).json({ status: 0, message: 'Board not found' });
        }
    } catch (error) {
        console.error('Error updating board status:', error);
        res.status(500).json({ status: 0, error: 'Internal Server Error' });
    }
});


// 5. Delete Board(s) by ID
router.post('/deleteBoardsById', async (req, res) => {
    try {
        const { id } = req.body;

        // Validate the presence of the board ID(s)
        if (!id) {
            return res.status(400).json({ status: 0, message: 'Please provide a board ID or an array of board IDs' });
        }

        // If a single ID is provided, convert it to an array
        const boardIds = Array.isArray(id) ? id : [id];

        // Delete the boards by ID(s)
        const deleteResult = await BoardModel.deleteMany({ board_id: { $in: boardIds } });

        if (deleteResult.deletedCount > 0) {
            res.status(200).json({ status: 1, message: 'Board deleted successfully' });
        } else {
            res.status(404).json({ status: 0, message: 'Board not found' });
        }
    } catch (error) {
        console.error('Error deleting board(s):', error);
        res.status(500).json({ status: 0, error: 'Internal Server Error' });
    }
});


module.exports = router;