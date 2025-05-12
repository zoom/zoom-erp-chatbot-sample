const axios = require('axios');
require('dotenv').config();
/*
 * Sends a chat message to the Zoom Chat API.
 *
 * This function sends a chat message to the Zoom Chat API using the provided message, recipient JID, and chatbot token.
 * The message will have a header with the provided header message, formatted in bold black text.
 *
 * @param {string} message - The body of the chat message to send.
 * @param {string} toJid - The Zoom user JID to send the message to.
 * @param {string} chatbotToken - The access token for the Zoom chatbot.
 * @param {string} headermsg - The header message to include in the chat message.
 * @throws {Error} If there is an error sending the chat message.
 */
function sendChatMessage(message, toJid, chatbotToken, headermsg) {
    return axios.post(process.env.ZoomsendchatUrl, {
        robot_jid:  process.env.zoom_bot_jid,
        to_jid: toJid,
        user_jid: toJid,
        content: {
            head: {
                text: headermsg,
                style: {
                    "bold": true,
                    "color": "#000000"
                }
            },
            body: message
        }
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + chatbotToken
        }
    }).catch(error => {
        console.error('Error sending chat message to open and send Zoom Chat API in main app:', error);
        if (error.response) {
            console.error('Error response status:', error.response.status);
            console.error('Error response data:', error.response.data);
        }
        throw error;
    });
}

/*
* Sends a Form based Chat message to the Zoom Chat API.
*
* This function sends a chat message to the Zoom Chat API using the provided message, recipient JID, and chatbot token.
* The message will have a header with the provided header message, formatted in bold black text.
*
* @param {string} message - The body of the chat message to send.
* @param {string} toJid - The Zoom user JID to send the message to.
* @param {string} chatbotToken - The access token for the Zoom chatbot.
* @param {string} headermsg - The header message to include in the chat message.
* @param {string} FormId - The Form ID to include in the chat message.
* @throws {Error} If there is an error sending the chat message.
*/
function sendFormChatMessage(message, toJid, chatbotToken, headermsg, FormId) {
    return axios.post(process.env.ZoomsendchatUrl, {
        robot_jid: process.env.zoom_bot_jid,
        to_jid: toJid,
        user_jid: toJid,

        content: {
            "settings": {
                "form": true,
                "form_id": FormId,
                "is_split_sidebar": true

            },
            head: {
                text: headermsg,
                style: {
                    "bold": true
                }
            },
            body: message
        }
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + chatbotToken
        }
    }).catch(error => {
        console.error('Error sending chat message to open and send Zoom Chat API in main app:', error);
        if (error.response) {
            console.error('Error response status:', error.response.status);
            console.error('Error response data:', error.response.data);
        }
        throw error;
    });
}

module.exports = {
  sendChatMessage,sendFormChatMessage
};