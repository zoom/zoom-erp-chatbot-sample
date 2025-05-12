require('./ERPChatBotApp');
require('dotenv').config();

const headerbody7 = "Do you want to Continue this conversations?";
const reqbody7 = [
  {

    "type": "message",
    "text": "Do you want to Continue this conversations?"
  },
  {
    "type": "actions",
    "items": [

      {
        "value": "x07",
        "style": "Primary",
        "text": "Yes"
      },
      {
        "value": "x911",
        "style": "Primary",
        "text": "No"
      }
    ]
  }

];

const reqbody1 = [
  {
    "type": "actions",
    "items": [
      {
        "value": "x04",
        "style": "Primary",
        "text": "PR Details"
      },
      {
        "value": "x05",
        "style": "Primary",
        "text": "Purchase Order"
      },
      {
        "value": "x06",
        "style": "Primary",
        "text": "PR Approver"
      }
    ]
  }
];
const reqbody0 = [
  {
    "type": "actions",
    "items": [
      {
        "value": "x01",
        "style": "Enabled",
        "text": "Requisitions"
      },
      {
        "value": "x02",
        "style": "Enabled",
        "text": "Purchase Order"
      }
    ]
  }
];


const reqbodynewchat = [
  {
    "type": "actions",
    "items": [
      {
        "value": "x09",
        "style": "Primary",
        "text": "Requisitions"
      },
      {
        "value": "x10",
        "style": "Disabled",
        "text": "Purchase Order"
      },
      {
        "value": "x11",
        "style": "Disabled",
        "text": "Invoice"
      },
      {
        "value": "x012",
        "style": "Disabled",
        "text": "Payments"
      }
    ]
  }
];
const headermsgnew = "Please select one of the options to proceed";
const headermsgnewafterno1 = "Please select one of the options to proceed";

const headermsg0 = "Please select one of the options to proceed";
const headermsg001 = "Welcome to Oracle Financials Chatbot. Please select one of the inquiry options below to proceed.";

const headermsg002 = "Requisition Inquiry";

const POheadermsg002 = "PO Inquiry";

const messageBody3 = [
    
  {
    "type": "plain_text_input",
    "text": "Requisition Number: [Example: REQ-US012152]",
    "action_id": "action_id_001",
    "value": "",
    "placeholder": "Format: REQ-US012152"
  },
  {
    "type": "actions",
    "items": [
      {
        "value": "x01REQ",
        "text": "Submit",
        "style": "Primary",
        "submit": true
      }
    ]
  }

];

const POmessageBody3 = [
    
  {
    "type": "plain_text_input",
    "text": "PO Number: [Example: PO-US005960]",
    "action_id": "action_id_002",
    "value": "",
    "placeholder": "Format: PO-US005960"
  },
  {
    "type": "actions",
    "items": [
      {
        "value": "x02PO",
        "text": "Submit",
        "style": "Primary",
        "submit": true
      }
    ]
  }

];



//OE20-3483 end
const progressbarreqbody = [
  {
    "type": "progress_bar",
    "value": 75
  }
];
const progressbarreqbodyC="Oracle Chatbot is fetching your data ...";

const Aprheadermsg002 = "Pending Approvals List";
const OracleAdmin = "Oracle Admin";
let ApprNoRecordBody = [

  {
    "type": "section",
    "sections": [
      {
        "type": "message",
        "style": {
          "bold": true,
          "color": "#FF0000"
        },
        "text": "No pending approvals found for you at this time."
      }
    ]
  }
];




module.exports =
{

  headerbody7,
  reqbody7,
  headermsg0,
  reqbody1,
  headermsg001, 
   headermsg002,POheadermsg002,messageBody3,POmessageBody3, headermsgnew, reqbodynewchat, headermsgnewafterno1, progressbarreqbody,progressbarreqbodyC

,Aprheadermsg002,ApprNoRecordBody,OracleAdmin
,reqbody0
};


