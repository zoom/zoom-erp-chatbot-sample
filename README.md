# Zoom ERP Chatbot

## Overview
Zoom ERP Chatbot is a Node.js application that integrates Zoom Team Chat with Oracle ERP systems. This chatbot allows users to query and interact with Oracle ERP data directly within Zoom, providing easy access to requisitions, purchase orders. It also allow to receive real-time financial alerts.

## Features

- **Oracle ERP Integration**: Access requisition, purchase order, and invoice data
- **Secure Authentication**: JWT-based authentication with Oracle systems
- **Interactive UI**: Form-based inputs for data queries
- **Automated Notifications**: Support for tax alerts and financial notifications
- **Real-time Data Access**: Get up-to-date information from Oracle ERP

## Technology Stack

- **Backend**: Node.js, Express.js
- **Authentication**: JWT, OAuth
- **API Communication**: Axios
- **Scheduling**: Node-schedule, node-cron
- **Environment Management**: Dotenv
- **Cryptography**: Crypto
- **Body Parsing**: Body-parser
- **Local Development**: ngrok (for tunneling)

## Prerequisites
- Node.js (v14 or higher)
- NPM (v6 or higher)
- Zoom Developer Account
- Oracle ERP instance with API access
- Oracle IDCS credentials
- ngrok (for local development and testing)

## Installation
1. Clone the repository:

```bash
git clone https://github.com/yourusername/Zoom-erp-chatbot.git
cd Zoom-erp-chatbot
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

### Zoom credentials
```
zoom_client_id=YOUR_ZOOM_CLIENT_ID
zoom_client_secret=YOUR_ZOOM_CLIENT_SECRET
zoom_bot_jid=YOUR_ZOOM_BOT_JID
zoom_verification_token=YOUR_ZOOM_VERIFICATION_TOKEN
Zoom_SECRECT_TOKEN=YOUR_ZOOM_SECRET_TOKEN
```

### Oracle credentials
```
OracleAUDIENCE=https://identity.oraclecloud.com/
OracleAPP_ID=YOUR_ORACLE_APP_ID
OracleSUB=YOUR_ORACLE_SUB
OracleJTI=YOUR_ORACLE_JTI
OracleKID=YOUR_ORACLE_KID
OracleAppClienttID=YOUR_ORACLE_APP_CLIENT_ID
OracleAppClienttSecrect=YOUR_ORACLE_APP_CLIENT_SECRET
OracleScope=YOUR_ORACLE_SCOPE
oracleIDCS_Url=YOUR_ORACLE_IDCS_URL
```
 > :warning: **Do not store credentials in plain text on production environments**
 
4. Create a private_key.pem file in the root directory with your Oracle private key:

### Authentication for Oracle Application Using Chatbot

#### Steps to Authenticate API call for Oracle Application
- Generate Public and Private Key
- Prepare JWT Token and Sign in with private key 
- Prepare Pem File
- Define Confidential application in IDCS
- Add certificate to Setting → Trusted partner Certificate

### Windows User Commands

#### Generate a Public and Private Key Pair:

- Generate Private Key:
- Use keytool JWK command in window Powershell to generate public and private key:

```powershell
keytool -genkey -keyalg RSA -alias INTMSUSER -keystore "C:\Users\XXXX\Downloads\tmp\NewCertificate\IntegrationUserKey.jks" -storepass <*******> -validity 365 -keysize 2048
```

**Details of Certificate**

- Enter the distinguished name. 
- What is your first and last name?
  [Unknown]:  XXX User
- What is the name of your organizational unit?
  [Unknown]:  XXXXX Apps
- What is the name of your organization?
  [Unknown]:  XXXXX Inc.
- What is the name of your City or Locality?
  [Unknown]:  San Jose
- What is the name of your State or Province?
  [Unknown]:  CA
- What is the two-letter country code for this unit?
  [Unknown]:  US
- Is CN=XXX User, OU=XXXXX Apps, O=XXXXX Inc., L=San Jose, ST=CA, C=US correct?
  [no]:  yes

- Export Private Key
```powershell
keytool -exportcert -alias INTMSUSER -file "C:\Users\XXXXX\Downloads\tmp\NewCertificate\IntegrationUser.cer" -keystore "C:\Users\XXXXX\Downloads\tmp\NewCertificate\IntegrationUserKey.jks" -storepass <******>
```

- **Generate Public Key**
```powershell
keytool -importkeystore -srckeystore "C:\Users\XXXX\Downloads\tmp\NewCertificate\IntegrationUserKey.jks" -srcstorepass Ora@21#34cle -srckeypass XXXX -srcalias INTMSUSER -destalias INTMSUSER -destkeystore "C:\Users\XXXXX\Downloads\tmp\NewCertificate\INTMSUSER.p12" -deststoretype PKCS12 -deststorepass <*******> -destkeypass <*********>
```

- Prepare JWT Token and Sign in with private key 
```powershell
openssl pkcs12 -in "C:\Users\XXXXX\Downloads\tmp\NewCertificate\INTMSUSER.p12" -nodes -nocerts -out "C:\Users\XXXXX\Downloads\tmp\NewCertificate\INTMSUSER.pem"
```

### Apple Mac Book User Commands

**Note**: Ensure your terminal is in the same folder when running below command so that all files are generated in same location

Generate a Public and Private Key Pair:

Use keytool JWK command to generate public and private key

Generate Private Key:
```bash
keytool -genkey -keyalg RSA -alias INTMSUSER -keystore "IntegrationUserKey.jks" -storepass '*********' -validity 365 -keysize 2048
```

**Details of Certificate**

- Enter the distinguished name. 
- What is your first and last name?
  [Unknown]:  XXX User
- What is the name of your organizational unit?
  [Unknown]:  XXXXX Apps
- What is the name of your organization?
  [Unknown]:  XXXXX Inc.
- What is the name of your City or Locality?
  [Unknown]:  San Jose
- What is the name of your State or Province?
  [Unknown]:  CA
- What is the two-letter country code for this unit?
  [Unknown]:  US
- Is CN=XXX User, OU=XXXXX Apps, O=XXXXX Inc., L=San Jose, ST=CA, C=US correct?
  [no]:  yes

- Export Private Key
```bash
keytool -exportcert -alias INTMSUSER -file "IntegrationUser.cer" -keystore "IntegrationUserKey.jks" -storepass '*********'
```

- **Generate Public Key**
```bash
keytool -importkeystore -srckeystore "IntegrationUserKey.jks" -srcstorepass '***********' -srckeypass '***********' -srcalias INTMSUSER -destalias INTMSUSER -destkeystore "INTMSUSER.p12" -deststoretype PKCS12 -deststorepass '***********' -destkeypass '**********'
```

- **Prepare PEM File** 
```bash
openssl pkcs12 -in "INTMSUSER.p12" -nodes -nocerts -out "INTMSUSER.pem"
```
- Enter Import Password:
  (Give same password as given all above '***********')

### Oracle App Client Credentials
- **Define Trusted application in IDCS**:

  - Define trusted application in IDCS with OAuth configuration as JWT assertion and Client Credentials. 
  
  ![Step1 - Trusted Application](https://github.com/user-attachments/assets/6f3396c3-bc66-492e-a748-f8524e327a3c)

  **Note**: In this screen only u will be get all below fields
  - OracleAPP_ID=YOUR_ORACLE_APP_ID
  - OracleAppClienttID=YOUR_ORACLE_APP_CLIENT_ID
  - OracleAppClienttSecrect=YOUR_ORACLE_APP_CLIENT_SECRET
  - OracleScope=YOUR_ORACLE_SCOPE
   
  ![Step2 - Trusted Application](https://github.com/user-attachments/assets/9e208b32-a587-4620-8fb7-d9992be775cd)

- **Add Certificate to Trusted partner** 
 
  ![Step3 - Add Certificate to Trusted partner](https://github.com/user-attachments/assets/11fad0bc-769f-461d-ba5d-1988fbdca59e)
  
  Import by uploading IntegrationUser.cer generated above to the trusted partner certificate 
  
  # Post successful configuration you will get below response
  ```plaintext
  -----BEGIN PRIVATE KEY-----
  YOUR_PRIVATE_KEY_CONTENT
  -----END PRIVATE KEY-----
  ```

## Configuration

### Zoom Marketplace Configuration

- Create a Chatbot app in the Zoom Marketplace
- Configure the bot endpoint URL to point to your server's /ERPBot endpoint
- Set up the verification token and client credentials
- Add the necessary scopes for chat interactions

### Oracle ERP Configuration

- Create a service account in Oracle Identity Cloud Service
- Generate a public/private key pair for JWT authentication
- Configure the application in IDCS with appropriate scopes
- Set up API access to the required ERP modules

### Local Development with ngrok
For local development and testing, you can use ngrok to expose your local server to the internet:

1. Install ngrok if you haven't already:
```bash
npm install -g ngrok
```

2. Start your application:  
```bash
npm start
```

3. In a separate terminal, start ngrok:
```bash
ngrok http 4000
```

4. Use the ngrok URL (e.g., https://your-ngrok-url.ngrok.io) as your bot endpoint URL in the Zoom Marketplace configuration.

## 🗂 Project Structure

```plaintext
Zoom-erp-chatbot/
├── ERPChatBotApp.js         # Main application file
├── OracleBotToken.js        # Oracle authentication handling
├── chatbotToken.js          # Zoom chatbot token management
├── OracleRestApi.js         # Oracle REST API integration
├── ZoomBotConvo.js          # Conversation flow handling
├── sendChat.js              # Functions for sending Zoom messages
├── BotHelperFunction.js     # Helper functions
├── OracleChatBotConstant.js # Constants and message templates
├── generateChatBody.js      # Chat message body generation
├── zoomOAuth.js             # Zoom OAuth functionality
├── private_key.pem          # Oracle private key (not committed)
├── .env                     # Environment variables (not committed) 
├── env_template             # Environment variables Template 
└── package.json             # Project dependencies
```

## Usage

### Starting the Server
```bash
npm start
```
The server will run on port 4000 by default or the port specified in the PORT environment variable.

### Bot Commands
Users can interact with the bot in Zoom Team Chat to:

- Query requisition information
- Look up purchase order details
- Check invoice status

### API Endpoints
**/ERPBot**

Main endpoint for receiving Zoom bot events and commands.

- Method: POST
- Authentication: Zoom signature verification
- Events Handled:
  - endpoint.url_validation: Validates the Zoom endpoint
  - bot_notification: Handles initial bot interactions
  - interactive_message_actions: Processes user selections
  - chat_message.submit: Handles form submissions

**/authorize**
Endpoint for authorizing the bot in Zoom.

- Method: GET
- Redirects: To Zoom chat with the bot

### Authentication Flow
- JWT Generation: Creates a JWT token using the Oracle private key
- Bearer Token: Exchanges the JWT for an OAuth bearer token
- Token Refresh: Automatically refreshes tokens before expiration
- Request Signing: Signs all requests to Oracle APIs with the bearer token

## Sample Output

![Requisition](https://github.com/user-attachments/assets/9c135e38-394a-4e15-9497-2f2483d25621)
![Purchase Order](https://github.com/user-attachments/assets/3438eeef-e092-4aea-9cf6-188d38300232)

## Zoom's Incoming Webhook Chatbot

### How to add and configure Incoming Webhooks in Zoom:
You will need to have admin permissions on your Zoom account to add and configure the Incoming Webhook Chatbot.
- Sign in to the [Zoom App Marketplace](https://marketplace.zoom.us/) as the account administrator.
- In the top right of the window, search for Incoming Webhook.
- In your search results, find the Incoming Webhook app and click it.
- Note: If the app is not pre-approved, contact your [Zoom admin](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0062300) to approve this app for your account. Learn more about admin app approvals.
- Click Add.
- Confirm the permissions the app requires, then click Authorize.
- The Incoming Webhook app is now added.

### Configure the Incoming Webhook Chatbot
- Sign in to the Zoom desktop app.
- Click the Team Chat tab.
- Under Apps, find and select Incoming Webhook, or select a chat channel from above that you would like to receive messages in.
- Enter one of the following commands to make a new connection:
  - /inc connect <connectionName>: Creates a connection and responds with a 1:1 chat message with the following details:
    - endpoint
    - verification token
    - example cURL requests

### How to send messages to Zoom Team Chat
After you have created your connection, you can then start sending POST requests to the integration's endpoint. Ensure that your POST requests include verification token to the Authorization header.
Note: The endpoint only accepts POST requests.

You can schedule your POST requests to be sent at a specific time using a tool like AWS Events based on AWS Lambda or Cron or any other tool. You can schedule your requests based on Json formatted data. (refer the example in code)

**/FinopschatAlert**

Endpoint for triggering Ops alerts to be sent to Zoom chats.

- Method: POST
- Body: { "alertType": "ApTaxTeamAlert" }
- Authentication: Zoom signature verification

## Sample Output
![Zoom Incoming webhook app alert](images/Output2.png)

For detailed instructions on creating and configuring Zoom Chatbots, see the [Zoom's Incoming Webhook Chatbot](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0067640).
