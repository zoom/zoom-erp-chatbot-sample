const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const {sendChatMessage,sendFormChatMessage}=require('./sendChat');
const { getChatbotToken } = require('./chatbotToken');
require('dotenv').config();
let OraleBearerTokenNew = null;
let lcgetglobalExpiresIn = null;
global.useoptions = null;
global.bearerTokenfinal = null;
global.refeshtokenfinal = null;
global.payload = null;
global.userName = null;


const app = express();
//const port = 4000;
const port = process.argv[2] || 4000; 

const userStore = new Map();
const cron = require('node-cron');


const {  newgetoraclebearertoken, generateJWT, getGlobalAccessToken, getGlobalJwt, setGlobalJwt, JWTUserAssertioninit, AccessTokeninit, getglobalExpiresIn } = require('./OracleBotToken');
let { headerbody7, reqbody7, headermsg0, headermsg001, headermsg002, POheadermsg002, messageBody3, POmessageBody3, progressbarreqbody, progressbarreqbodyC
    , reqinvalidbody, poinvalidbody, reqbody0 } = require('./OracleChatBotConstant');
const {router, getDynamicCronExpression } = require('./BotHelperFunction');
const { getReqheaderDataApi, getPOheaderDataApi } = require('./OracleRestApi');
const { processRequisitionRequest, processPurchasingRequest, processAPTaxAndSendToZoom,sendErrorNotification} = require('./ZoomBotConvo');
app.use(bodyParser.json());
app.use(router);
const { URLSearchParams } = require('url');
const { Buffer } = require('node:buffer');
    async function maininit() {
        try {
            // Ensure JWT is initialized
            await JWTUserAssertioninit();

            // Initialize Access Token
            await AccessTokeninit(getGlobalJwt());

            // Retrieve the new access token
            OraleBearerTokenNew = getGlobalAccessToken();
            lcgetglobalExpiresIn = getglobalExpiresIn();
        } catch (error) {
            console.error('Error in main execution:', error);
        }
    }
    maininit();
// Define an async function for the task
async function runTask1() {
    try {
        let globalJwt = null;
        // Assuming `globalJwt` is defined elsewhere
        const result = generateJWT();
        globalJwt = result.token;
        setGlobalJwt(globalJwt);
        // console.log(`New User Assertion token: ${globalJwt}`);
    }
    catch (error) {
        console.error('Error retrieving User assertion token:', error);
    }
}

// Get the dynamic cron expression
const cronExpression = getDynamicCronExpression();
if (getGlobalJwt()) {
    // Schedule the task
    cron.schedule(cronExpression, async () => {
        console.log(`Running task according to cron expression: ${cronExpression}`);
        await runTask1(); // Call the async function
    }, {
        scheduled: true,
        timezone: "America/Los_Angeles" // Pacific Standard Time (PST)
    });
}

/*
 * Handles the incoming bot notification from Zoom and processes the request based on the user's input.
 *
 * @param {Object} event - The event object containing the notification details.
 * @param {string} event.payload.userName - The name of the user who triggered the notification.
 * @param {string} event.payload.cmd - The command or action performed by the user.
 * @param {string} event.payload.toJid - The Zoom chat JID of the recipient.
 * @throws {Error} If there is an error handling the bot notification.
 */
async function handleBotNotification(event) {
    try {


        const chatbotToken = await getChatbotToken();
        if (!event) {
            // throw new Error('Event data is missing.');
            console.log('Event data is missing.');
        }
        global.payload = event.payload;
        const toJid = event.payload.toJid;
        let GreetingsHeader = `Hi, ${event.payload.userName}.\n${headermsg001}`;

            sendChatMessage(reqbody0, toJid, chatbotToken, GreetingsHeader);

    } catch (error) {
        console.error('Error handling bot notification:', error.message);
        throw error;
    }
}
/*
 * Handles the incoming message action notification from Zoom and processes the user's selection.
 *
 * @param {Object} event - The event object containing the notification details.
 * @param {string} event.payload.actionItem.value - The value of the selected action item.
 * @param {string} event.payload.cmd - The command or action performed by the user.
 * @param {string} event.payload.toJid - The Zoom chat JID of the recipient.
 * @throws {Error} If there is an error handling the message action notification.
 */

async function handleMessageActionNotification(event) {
    try {
        const chatbotToken = await getChatbotToken();
        //const userName = event.payload.userName;
        let userToken = OraleBearerTokenNew;// getBearerToken(userName);
        let userData = userStore.get(userToken) || {};

        if (!event) {
            // throw new Error('Event data is missing.');
            console.log('Event data is missing.');
        }
        let command2 = event.payload.actionItem.value;
        // const slashCommand = event.payload.cmd;
        const toJid = event.payload.toJid;
        userData.useOptions = command2;
        console.log("after setting UseOptions: userData.useOptions -  ", userData.useOptions);
        if (command2 === 'x01') {
            sendFormChatMessage(messageBody3, toJid, chatbotToken, headermsg002, "REQ_FORM_ID");
        }
        else if (command2 === 'x02') {
            sendFormChatMessage(POmessageBody3, toJid, chatbotToken, POheadermsg002, "PO_FORM_ID");
        }
    }
    catch (error) {
        console.error('Error handling Message action notification:', error.message);
        throw error;
    }
}

async function handleMessageFormNotification(event, UserName_P) {
    try {
        let UserButton = "";
        let UserInputValue = "";
        const chatbotToken = await getChatbotToken();
        const userName = UserName_P;
        let userToken = OraleBearerTokenNew;// getBearerToken(userName);
        let userData = userStore.get(userToken) || {};
        const toJid = event.payload.object.to_jid;

        if (!event) {
            //throw new Error('Event data is missing.');
            console.log('Event data is missing.');
        }
    
        if (!event) {
            //throw new Error('Event data is missing.');
            console.log('Event data is missing.');
        }
        // Form submission details
        const submitItems = (event.payload.object.submit_items || []).map(item => {
            if (item.actionItem) {
                UserButton = item.actionItem.value;
                return {
                    key: 'actionItem',
                    value: item.actionItem.value

                };
            } else if (item.plain_text_input) {
                UserInputValue = item.plain_text_input.value;
                return {
                    key: item.plain_text_input.text || 'plain_text_input',
                    value: item.plain_text_input.value
                };
            } else {
                return {
                    key: 'unknown_key',
                    value: 'unknown_value'
                };
            }
        });

        console.log('UserInputValue:', UserInputValue);
        console.log('UserButton:', UserButton);

      
        if (UserButton === 'x02PO') {
            let { POHeaderId } = await getPOheaderDataApi(OraleBearerTokenNew, UserInputValue);
            if (POHeaderId === "Invalid Purchase Order Number") {
                sendChatMessage(progressbarreqbody, toJid, chatbotToken, progressbarreqbodyC)
                    .then(() => sendChatMessage(poinvalidbody, toJid, chatbotToken, " "))
                    .then(() => sendChatMessage(reqbody0, toJid, chatbotToken, headermsg0))
                    .catch(error => {
                        console.error('Error in sending chat messages:', error);
                    });
                userData.useOptions = null;
            } else {
                sendChatMessage(progressbarreqbody, toJid, chatbotToken, progressbarreqbodyC);
                await processPurchasingRequest(UserInputValue, chatbotToken, event.payload.object, reqbody7, headerbody7, OraleBearerTokenNew);
                userData.useOptions = null;
            }
        }  else if (UserButton === 'x01REQ') {
            let { RequisitionHeaderId } = await getReqheaderDataApi(OraleBearerTokenNew, UserInputValue);
            if (RequisitionHeaderId === "Invalid Requisition Number") {
                sendChatMessage(progressbarreqbody, toJid, chatbotToken, progressbarreqbodyC)
                    .then(() => sendChatMessage(reqinvalidbody, toJid, chatbotToken, " "))
                    .then(() => sendChatMessage(reqbody0, toJid, chatbotToken, headermsg0))
                    .catch(error => {
                        console.error('Error in sending chat messages:', error);
                    });
                userData.useOptions = null;

            } else {
                sendChatMessage(progressbarreqbody, toJid, chatbotToken, progressbarreqbodyC);
                await processRequisitionRequest(UserInputValue, chatbotToken, event.payload.object, reqbody7, headerbody7, OraleBearerTokenNew, userName);
                userData.useOptions = null;
            }
        }

        userStore.set(userToken, userData);
    }
    catch (error) {
        console.error('Error handling Message Form notification:', error.message);
        throw error;
    }
}

// Function to check if the token is still valid
function isTokenValid() {
    const now = new Date();

    // console.log("isTokenValid() call");
    // Ensure token and expiration time are set
    if (!OraleBearerTokenNew || !lcgetglobalExpiresIn) {
        return false;
    }
    // Convert lcgetglobalExpiresIn from seconds to milliseconds and calculate expiration time
    const expirationTimestamp = new Date(Date.now() + lcgetglobalExpiresIn * 1000);
    // Calculate the threshold as 1 hour before the actual expiration time
    const oneHourBeforeExpiration = new Date(expirationTimestamp.getTime() - (1 * 60 * 60 * 1000));
    console.log("isTokenValid() call", now < oneHourBeforeExpiration);

    // cloudWatchLogger.info('isTokenValid() function call - checking if token is valid or not ',now < oneHourBeforeExpiration); 
    // Check if the current time is before the threshold
    return now < oneHourBeforeExpiration;

}

app.get('/', async (req, res) => {
  try {

    // Send response with all the secrets
    res.send(`Welcome to ERP ChatBot Home Page !!`);
  } catch (err) {
    console.error('Error fetching secrets:', err);
    res.status(500).send('Error fetching secrets: ' + err.message);
  }
});




app.get('/authorize', (req, res) => {
    res.redirect( 'https://zoom.us/launch/chat' +'?jid=robot_' + `${process.env.zoom_bot_jid}`);
});


// Endpoint for receiving bot notifications
/*
 * Handles the incoming request to the '/ERPBot' endpoint, verifying the request signature and processing the request based on the event type.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} req.body - The request body containing the event details.
 * @param {string} req.body.event - The type of event being processed (e.g. 'endpoint.url_validation', 'bot_notification', 'interactive_message_actions').
 * @param {Object} req.body.payload - The payload data associated with the event.
 * @param {string} req.headers['x-zm-signature'] - The signature header used to verify the request.
 * @param {string} req.headers['x-zm-request-timestamp'] - The timestamp header used to verify the request.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} - A Promise that resolves when the request has been processed.
 */

app.post('/ERPBot', async (req, res) => {

    var response

    const message = `v0:${req.headers['x-zm-request-timestamp']}:${JSON.stringify(req.body)}`

    const hashForVerify = crypto.createHmac('sha256', process.env.Zoom_SECRECT_TOKEN).update(message).digest('hex')

    const signature = `v0=${hashForVerify}`

    if (req.headers['x-zm-signature'] === signature) {

        if (req.body.event === 'endpoint.url_validation') {

            const hashForValidate = crypto.createHmac('sha256', process.env.Zoom_SECRECT_TOKEN).update(req.body.payload.plainToken).digest('hex')

            response = {
                message: {
                    plainToken: req.body.payload.plainToken,
                    encryptedToken: hashForValidate
                },
                status: 200
            }

            //console.log(response.message)

            res.status(response.status)
            res.json(response.message)
        } else {
            global.userName = null;
            response = { message: 'Authorized request to Finance Chatbot for Zoom Team Chat. - timestamp - ' + new Date().toISOString(), status: 200 }
            console.log('userName pinged in finchatbot ', req.body.payload.userName);
            global.userName = req.body.payload.userName;
            console.log(response.message)

            res.status(response.status)
            res.json(response)

            if (!isTokenValid()) {

                OraleBearerTokenNew = await newgetoraclebearertoken(getGlobalJwt());
                console.log('New Bearer Token generated for Zoom Chatbot');
                //  cloudWatchLogger.info('New Bearer Token generated for Zoom Chatbot ',now < oneHourBeforeExpiration);  
            }


            try {
                switch (req.body.event) {
                    case 'bot_notification':
                        await handleBotNotification(req.body);
                        break;
                    case 'interactive_message_actions':
                        await handleMessageActionNotification(req.body);
                        break;
                    //OE20-3483 start
                    case 'chat_message.submit':
                        await handleMessageFormNotification(req.body, global.userName);
                        break;
                    //OE20-3483 end
                    default:
                        console.log('Unknown message type');
                }

            } catch (error) {
                console.error('Error handling notification:', error.message);
                res.status(500).send('Error handling notification');
            }

        }
    } else {
        response = { message: 'Unauthorized request to  Finance Chatbot for Zoom Team Chat.', status: 401 }

        console.log(response.message)

        res.status(response.status)
        res.json(response)
    }


});

app.post('/FinopschatAlert', async (req, res) => {
    try {
        const { alertType } = req.body;

        if (!alertType) {
            return res.status(400).json({ message: 'Missing alertType' });
        }
        // Send response immediately to avoid Lambda waiting for backend processing
        res.status(200).json({ message: `Alert type ${alertType} received and processing started.` });
        // Continue backend processing asynchronously
        if (alertType === 'ApTaxTeamAlert') {
            console.log('Triggering chat team notification...');
      
            const params = [
                { P_DM_TO_USE: 'ApTaxTeamAlert1', P_DataSetName: 'APTAXTEAMALERTDS1',Tag: process.env.Unpaidtagging }
            ];
            await processAPTaxAndSendToZoom(
                OraleBearerTokenNew,
                process.env.ApTaxAlertWebhook,
                process.env.ApTaxAlertAuth,
                params
            );   
        } 
    } catch (error) {
        sendErrorNotification(process.env.ApTaxAlertWebhook, process.env.ApTaxAlertAuth, "Please Contact Admin: " + error.message);
        console.log('Error processing alert:', error.message);

    }
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running on ${port}`);
});
