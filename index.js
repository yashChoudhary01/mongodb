const express = require("express");

const app = express();

const PORT = 8080;

require("./src/db/connection");

app.use(express.json());

const router = require("./src/Routes/classesRoute");
const board_router = require("./src/Routes/boardRoute");
const subject_router = require("./src/Routes/subjectRoute");
const quiz_router = require("./src/Routes/quizRoute");
const topic_router = require("./src/Routes/topicsRoute");
const result = require("./src/Routes/submitRoute");
const conversationRoute = require("./src/Routes/conversation");
const messageRoute = require("./src/Routes/messages");

app.use(router);
app.use(board_router);
app.use(subject_router);
app.use(quiz_router);
app.use(topic_router);
app.use(result);
app.use("/api/conversations", conversationRoute);
app.use("/api/messages", messageRoute);

app.listen(PORT, (err) => {
    if (err) throw err;
    console.log("Server is working on Port: ", PORT);
});