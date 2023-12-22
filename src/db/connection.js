const mongoose = require('mongoose');
const db_uri = 'mongodb+srv://root:Root1234@cluster0.pkhazhq.mongodb.net';

mongoose.connect(db_uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("MongoDb is connected successfully");
}).catch((err) => {
    console.log("Error:", err);
})
