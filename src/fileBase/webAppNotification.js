const fs = require("fs");
const path = require('path');
const FCM = require('fcm-node');

module.exports.webSendNotification = (notification, fcm_tokens) => {
    try {
        fs.readFile(path.join(__dirname, "../firebaseConfig.json"), "utf8", (err, jsonString) => {
            if (err) {
                console.error("Error reading firebaseConfig.json:", err);
                // Assuming you have a callback, handle the error here
                return;
            }

            try {
                const data = JSON.parse(jsonString);
                const serverKey = data.SERVER_KEY_IN_HOUSE;
                const fcm = new FCM(serverKey);

                // Split tokens directly and filter out empty tokens
                const tokens = fcm_tokens.split(',').map(token => {
                    const [token_id] = token.split('|');
                    return token_id.trim();
                }).filter(token => token !== '');

                console.log("Here are all tokens:", tokens);

                if (tokens.length > 0) {
                    const pushMessage = {
                        registration_ids: tokens,
                        content_available: true,
                        mutable_content: true,
                        notification: notification
                    };

                    fcm.send(pushMessage, (err, response) => {
                        if (err) {
                            console.error("Error sending push notification:", err);
                        } else {
                            console.log("Push notification sent:", response);
                        }
                    });
                } else {
                    console.log("No valid registration tokens found.");
                }
            } catch (err) {
                console.error("Error parsing JSON string:", err);
            }
        });
    } catch (error) {
        console.error("An error occurred:", error);
    }
};
