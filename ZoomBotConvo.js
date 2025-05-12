const axios = require('axios');
require('./ERPChatBotApp');

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const {sendChatMessage}=require('./sendChat');
const teamConfigs = require('./teamConfigs');
require('./OracleBotToken');



const {  headermsg0, headermsg002, POheadermsg002,reqbody0} = require('./OracleChatBotConstant');
const { getReqheaderDataApi, getreqlinesDataApi, getReqApprovalDataApi, getPOheaderDataApi, checkUserRoles, getPOLifeCycleDetails, runReportAndProcessSOAP } = require('./OracleRestApi');
const { v4: uuidv4 } = require('uuid'); 

/**
 * Executes a Zoom incoming webhook.
 * 
 * @param {string} webhookId - The unique webhook identifier.
 * @param {string} authToken - The authorization token.
 * @param {object} payload - The payload to send in the POST request.
 * @returns {Promise<object>} - The response from the Zoom webhook.
 */ 
async function executeZoomWebhook(webhookId, authToken, rows, teamConfig,P_DM_TO_USE,tag) {
  const url = `https://integrations.zoom.us/chat/webhooks/incomingwebhook/${webhookId}?format=full`;

  for (const row of rows) {
    const payload = {
      "is_markdown_support": true,
      "content": {
        "head": {
          "text": teamConfig.headerText
        },
        "body": [
          {
            "type": "fields",
            "items": teamConfig.getPayloadItems(row)
          },
          {
            "type": "message",
            "text": `Assignees :${tag === 'GLAPTaxFyi' ? row.TAG : tag}`  // Jira#OE20-3534
          },
          ...(P_DM_TO_USE === 'ApTaxTeamAlert1' ? [{
            "type": "message",
            "text": "Note: It's possible to have a fully approved Oracle Invoice but the payment still unpaid because it's pending the separate Payment Approval email that AP sends.",
            "style": {
                "italic": true,
                "color": "#666666"
            }
          }] : [])
        ]
      }
    };
    try {
      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Zoom webhook response:', response.data); // Log the response from Zoom
    } catch (error) {
      console.error('Error executing Zoom webhook:',   error.message); // Log detailed error
    //  throw error;
    }

    
  }
}

/*
 * Extracts a formatted requisition number from the given input string.
 *
 * @param {string} inputString - The input string containing the requisition number.
 * @returns {string|null} - The formatted requisition number if the input string matches the expected pattern, or `null` if the input is invalid.
 */
let extractRequisition = (inputString) => {
  const match = inputString.match(/req[-\s]?(\w{2})(\d{6,7})/i);
  if (match) {
    const prefix = match[1].toUpperCase();
    const requisitionNumber = match[2];
    const outputString = `REQ-${prefix}${requisitionNumber}`;
    //console.log('outputString', outputString);
    return outputString;
  } else {
    return null;
  }
};

/*
 * Extracts a formatted PO (Purchase Order) number from the given input string.
 *
 * @param {string} inputString - The input string containing the PO number.
 * @returns {string|null} - The formatted PO number if the input string matches the expected pattern, or `null` if the input is invalid.
 */
let extractPO = (inputString) => {
  const match = inputString.match(/po[-\s]?(\w{2,3})(\d{6,7})/i);

  if (match) {
    const prefix = match[1].toUpperCase();
    const poNumber = match[2];
    const outputString = `PO-${prefix}${poNumber}`;
    //console.log('outputString', outputString);
    return outputString;
  } else {
    return null;
  }
};


/*
 * Checks if the given command contains a common greeting.
 * 
 * @param {string} command - The command to check for a greeting.
 * @returns {boolean} - True if the command contains a greeting, false otherwise.
 */
function containsGreeting(command) {
  // List of common greetings to check against
  const greetings = ['hi', 'hello', 'hey', 'howdy', 'greetings', 'help'];

  // Convert command to lowercase for case-insensitive matching
  const lowercaseCommand = command.toLowerCase();

  // Create a regular expression that matches whole words only
  const greetingsRegex = new RegExp(`\\b(${greetings.join('|')})\\b`, 'i');

  // Check if the command contains any of the greetings
  return greetingsRegex.test(lowercaseCommand);
}



/*
 * Checks if the given invoice status indicates the invoice has been approved.
 *
 * @param {string} status - The status of the invoice.
 * @returns {boolean} - True if the invoice status indicates approval, false otherwise.
 */
/*
 * Checks if the given invoice status indicates the invoice has been paid.
 *
 * @param {string} status - The status of the invoice.
 * @returns {boolean} - True if the invoice status indicates payment, false otherwise.
 */





/*
 * Processes a purchasing request by extracting the Requisition number from the command, retrieving the Requisition details, and sending a chat message with the Requisition information.
 *
 * @param {string} command2 - The command containing the Requisition number.
 * @param {string} chatbotToken - The token for the chatbot.
 * @param {object} payloadfinal - The final payload for the chat message.
 * @param {object} reqbody7 - The request body for the chat message.
 * @param {object} headerbody7 - The header body for the chat message.
 * @returns {Promise<void>} - A promise that resolves when the chat message has been sent.
 */
async function processRequisitionRequest(command2, chatbotToken, payloadfinal, reqbody7, headerbody7, OraleBearerTokenNew, UserName) {
  const toJid = payloadfinal.to_jid;

  let pourl = null;
  let requrl = null;
  const reqNuminput = extractRequisition(command2);
  try {

    let { documentStatus, FunctionalCurrencyCode, Description, Requisition, RequisitionHeaderId } = await getReqheaderDataApi(OraleBearerTokenNew, reqNuminput);

    if (RequisitionHeaderId !== "Invalid Requisition Number") {
      let { distinctRequestors, PurchaseOrder, Amount, buyeronpo, supplieronpo, POHeaderId } = await getreqlinesDataApi(OraleBearerTokenNew, RequisitionHeaderId);
      let { currenapprover } = await getReqApprovalDataApi(OraleBearerTokenNew, RequisitionHeaderId);
      let distinctcurrentApprover = "";
      console.log('Requisition Status', documentStatus);
      console.log('RequisitionHeaderId', RequisitionHeaderId);
      //console.log('currenapprover', currenapprover);
      // pourl=process.env.oraclepodname+process.env.OraclePODeepLink+POHeaderId; //OE20-3341
      //OE20-3341 start 
      let distinctPOnum = PurchaseOrder;
      const poItems = [];

      if (POHeaderId !== "Invalid Purchase Order Number") {
        if (POHeaderId && POHeaderId.includes(',')) {
          const poHeaderIds = POHeaderId.split(',');
          const poNumbers = distinctPOnum.split(',');

          // Generate separate field items for each PO
          poHeaderIds.forEach((id, index) => {
            poItems.push({
              "key": `Purchase Order ${index + 1}`,  // Add index to make it unique
              "value": poNumbers[index]?.trim() || "N/A",
              "link": `${process.env.oraclepodname}${process.env.OraclePODeepLink}${id.trim()}`,
              "short": true
            });
          });
          // console.log('poItems', poItems);
        } else {
          poItems.push({
            "key": "Purchase Order",
            "value": distinctPOnum || "N/A",
            "link": `${process.env.oraclepodname}${process.env.OraclePODeepLink}${POHeaderId}`,
            "short": true
          });
        }
      }
      //OE20-3341 end 
      requrl = process.env.oraclepodname + process.env.OracleReqDeepLink + RequisitionHeaderId;

      if (currenapprover !== 'Task not created' && currenapprover !== undefined || !currenapprover) {
        distinctcurrentApprover = currenapprover;
      } else {
        distinctcurrentApprover = 'Not Applicable';
      }

      let distinctbuyeronpo = buyeronpo;
      let distinctsupplieronpo = supplieronpo;

      if (documentStatus !== 'Pending approval' || !documentStatus) {
        distinctcurrentApprover = 'Not Applicable';
      }

      if (PurchaseOrder === 'null' || PurchaseOrder === null || !PurchaseOrder) {
        distinctPOnum = "No Purchase Orders is created";
        pourl = null;
      }

      if (buyeronpo === 'null' || buyeronpo === null || !buyeronpo) {
        distinctbuyeronpo = "Not Applicable";

      }

      if (supplieronpo === 'null' || supplieronpo === null || !supplieronpo) {
        distinctsupplieronpo = "Not Applicable";
      }
  // Normalize userName with comprehensive cleanup
  let normalizedUser = '';
      if (UserName) {
        // First extract just the base name by removing all special formatting
        // This regex keeps only the first word or the text before any special character
        normalizedUser = UserName
          // Remove anything in parentheses including the parentheses
          .replace(/\([^)]*\)/g, '')
          // Remove anything after a dash, brace, bracket, or other special character
          .replace(/[-{}\[\]()<>\/\\|:;,!?@#$%^&*=+~`].*$/, '')
          // Remove any remaining special characters
          .replace(/[^a-zA-Z0-9\s]/g, '')
          // Normalize whitespace and trim
          .replace(/\s+/g, ' ')
          .trim()
          .toLowerCase();
      }
      UserName=normalizedUser;
      await checkUserRoles(UserName, OraleBearerTokenNew)
        .then(result => {
          if (result !== null) {
            requrl = process.env.oraclepodname + process.env.OracleReqDeepLinkWithRole + RequisitionHeaderId;
          } else {
            requrl = process.env.oraclepodname + process.env.OracleReqDeepLink + RequisitionHeaderId;
          }
        })
        .catch(error => {
          console.error('An error occurred:', error);
        });


      let formatReqAmount = Amount.toLocaleString('en-US', { minimumFractionDigits: 2 });


      const reqbody2item = [
        {
          "key": "Requisition",
          "value": Requisition,
          "link": requrl,
          "short": true
        },
        {
          "key": "Requisition Status",
          "value": documentStatus,
          "short": true
        },
        {
          "key": "Supplier",
          "value": distinctsupplieronpo,
          "short": true
        },
        {
          "key": "Total Amount",
          "value": formatReqAmount + " " + FunctionalCurrencyCode,
          "short": true
        },
        {
          "key": "Current Approver",
          "value": distinctcurrentApprover,
          "short": true
        },
        {
          "key": "Requestor",
          "value": distinctRequestors ? distinctRequestors : "  ",
          "short": true
        },/* //OE20-3341 start 
        {
          "key": "Purchase Order",
          "value": distinctPOnum ,
          "link": pourl,
          "short" : true
        },*///OE20-3341 end
        {
          "key": "Requisition Description",
          "value": Description ? Description : "  ",
        }
        /*,
        {
          "key": "Buyer",
          "value": distinctbuyeronpo,
          "short" : true
        } */
      ];

      // Add each "Purchase Order" item directly to reqbody2item without using an array //OE20-3341 start 
      poItems.forEach(item => {
        reqbody2item.push(item);

      });
      //OE20-3341 end  
      const reqbody2new = [
        {
          "type": "fields",
          "items": reqbody2item
        }
      ];

      // Chain the promises to ensure order
      sendChatMessage(reqbody2new, toJid, chatbotToken, headermsg002)
        .then(() => sendChatMessage(reqbody0, toJid, chatbotToken, headermsg0))
        .catch(error => {
          console.error('Error in sending chat messages:', error);
        });
      }
   else if (RequisitionHeaderId === "Invalid Requisition Number" || RequisitionHeaderId === "Requisition Not Found" || RequisitionHeaderId === "Bearer token expired or invalid.") {
      let reqbody10 = [

        {
          "type": "section",
          "sections": [
            {
              "type": "message",
              "style": {
                "bold": true,
                "color": "#FF0000"
              },
              "text": "Invalid Requisition Number given, please retry with correct Requisition Number"
            }
          ]
        }
      ];
       
        sendChatinteractive(reqbody10, chatbotToken, payloadfinal, headermsg10, 'bot_notification');

    }

  } catch (error) {
    console.log('Error occurred in processRequisitionRequest:', error);
  }
}




/**
 * Processes a purchasing request by fetching purchase order data from an API and formatting it for display in a chat message.
 *
 * @param {string} command2 - The purchase order number input by the user.
 * @param {string} chatbotToken - The token used to authenticate the chatbot.
 * @param {object} payloadfinal - The final payload object containing information about the chat message.
 * @param {object} reqbody7 - The request body for the chat message.
 * @param {string} headerbody7 - The header for the chat message.
 * @returns {Promise<void>} - A promise that resolves when the chat messages have been sent.
 */
async function processPurchasingRequest(command2, chatbotToken, payloadfinal, reqbody7, headerbody7, OraleBearerTokenNew) {
  const toJid = payloadfinal.to_jid;

  const PONuminput = extractPO(command2);
  try {

    let { postatus, PurchaseOrder, Description, TotalPOAmount, SupplierName, BuyerName, POHeaderId, CurrencyCode, RequesterDisplayName } = await getPOheaderDataApi(OraleBearerTokenNew, PONuminput);

    if (POHeaderId !== "Invalid Purchase Order Number") {
      // OE20-3326 start
      let { OrderedAmount, totalInvoiceAmount } = await getPOLifeCycleDetails(OraleBearerTokenNew, POHeaderId);
      // let {  TotalInvoicedAmount}=await  getPOLifeCycleInvoices(OraleBearerTokenNew, POHeaderId);

      let PORemainingAmount = (OrderedAmount - totalInvoiceAmount);
      // OE20-3326 end 
      let distinctbuyer = BuyerName;
      let distinctsupplier = SupplierName;
      let formatPOAmount = TotalPOAmount.toLocaleString('en-US', { minimumFractionDigits: 2 });
      let formatPORemainingAmount = PORemainingAmount.toLocaleString('en-US', { minimumFractionDigits: 2 });
      let formatInvoiceAmount = totalInvoiceAmount.toLocaleString('en-US', { minimumFractionDigits: 2 });

      if (BuyerName === 'null' || BuyerName === null || !BuyerName) {
        distinctbuyer = "Not Applicable";
      }

      if (SupplierName === 'null' || SupplierName === null || !SupplierName) {
        distinctsupplier = "Not Applicable";
      }
      let pourl = process.env.oraclepodname + process.env.OraclePODeepLink + POHeaderId;

      const PObody2item = [
        {
          "key": "Purchase Order",
          "value": PurchaseOrder,
          "link": pourl,
          "short": true
        },
        {
          "key": "Status",
          "value": postatus,
          "short": true
        },
        {
          "key": "Supplier",
          "value": SupplierName ? SupplierName : "No Supplier Found",
          "short": true
        },
        {
          "key": "Buyer Name",
          "value": distinctbuyer,
          "short": true
        },
        {
          "key": "Total PO Amount"
          , "value": formatPOAmount + " " + CurrencyCode,
          "short": true
        },
        // OE20-3326 start 
        {
          "key": "Invoiced Amount",
          "value": (totalInvoiceAmount && totalInvoiceAmount !== 0)
            ? formatInvoiceAmount + " " + CurrencyCode
            : "Not Applicable",
          "short": true
        }
        ,
        {
          "key": "PO Remaining Amount"
          , "value": formatPORemainingAmount + " " + CurrencyCode,
          "short": true
        },
        // OE20-3326 end
        //OE20-3418 start
        {
          "key": "Requester Name",
          "value": RequesterDisplayName ? RequesterDisplayName : "  ",
          "short": true
        },
        //OE20-3418 end      
        {
          "key": "PO Description",
          "value": Description ? Description : "  ",
          "short": true
        }
      ];
      const PObody2new = [
        {
          "type": "fields",
          "items": PObody2item
        }
      ];
      // Chain the promises to ensure order
      sendChatMessage(PObody2new, toJid, chatbotToken, POheadermsg002)
        .then(() => sendChatMessage(reqbody0, toJid, chatbotToken, headermsg0))
        .catch(error => {
          console.error('Error in sending chat messages:', error);
        });
      
    } else {
      let PObody10 = [

        {
          "type": "section",
          "sections": [
            {
              "type": "message",
              "style": {
                "bold": true,
                "color": "#FF0000"
              },
              "text": "Invalid purchase order number provided. Please retry with the correct purchase order number."
            }
          ]
        }
      ];
    
      sendChatMessage(PObody10, toJid, chatbotToken, " ");
      
    }

  } catch (error) {
    console.log('Error occurred in processPurchasingRequest:', error);
  }
}


async function processAPTaxAndSendToZoom(OraleBearerTokenNew, webhookId, authToken, params) {
  try {
    const reportResults = await Promise.all([
      await runReportAndProcessSOAP(OraleBearerTokenNew, params[0].P_DM_TO_USE, process.env.OracleAlertReportPath, params[0].P_DataSetName)
    ]);

    let totalRecordsProcessed = 0;

    for (let i = 0; i < reportResults.length; i++) {
      const reportData = reportResults[i];
      if (reportData && reportData.length > 0) {
        console.log(`Processing ${reportData.length} records for ${params[i].P_DM_TO_USE}`);
        
        for (const row of reportData) {
          await sendToZoomWebhook(webhookId, authToken, row, params[i].P_DM_TO_USE, params[i].Tag);
          console.log(`Successfully sent notification for invoice ${row.INVOICE_NUMBER}`);
        }
        
        totalRecordsProcessed += reportData.length;
      }
    }

    if (totalRecordsProcessed === 0) {
      console.log("No records to process at this time");
    }

    console.log(`Successfully completed processing ${totalRecordsProcessed} records`);
    return { success: true, recordsProcessed: totalRecordsProcessed };
  } catch (error) {
    console.log(`Error processing alert: ${error.message}`);
  }
}

/**
 * Sends the row data to the Zoom webhook.
 * @param {string} webhookId - The Zoom webhook ID.
 * @param {string} authToken - The Zoom authentication token.
 * @param {Object} row - The row data to send.
 * @param {string} P_DM_TO_USE - The report parameter value.
 */

async function sendToZoomWebhook(webhookId, authToken, row, P_DM_TO_USE,tag) {
  await executeZoomWebhook(webhookId, authToken, [row], teamConfigs[P_DM_TO_USE],P_DM_TO_USE,tag);
  // console.log(`Sent data to Zoom for ${P_DM_TO_USE}: Total rows processed: ${[row].length} `);
}








// For GenAI end

module.exports = {
  containsGreeting: containsGreeting,
  extractRequisition: extractRequisition,
  extractPO: extractPO,
  processRequisitionRequest: processRequisitionRequest,
  processPurchasingRequest: processPurchasingRequest,
  processAPTaxAndSendToZoom: processAPTaxAndSendToZoom
};

