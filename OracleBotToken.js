
const axios = require('axios');


const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const result = require('dotenv').config();
if (result.error) {
  console.error('Error loading .env file:', result.error);
}
const express = require('express');
require('dotenv').config();

//const ngrok = require('ngrok');

const crypto = require('crypto');
const qs = require('querystring');
let tokenGenerationTime = null; // To store the time when the token was generated



const { exec } = require('child_process');
const schedule = require('node-schedule');

// In-memory storage for JWT and expiration date
let globalJwt = null;
let expirationDate = null;
let globalExpiresIn = null;
// Singleton instance
let instance = null;
let globalAccessToken = null; // Global variable to store the access token

const fs = require('fs');


// Function to make URL-safe Base64
const base64url = (str) => {
    return str.replace(/=/g, '')
              .replace(/\+/g, '-')
              .replace(/\//g, '_');
};



 const  generateJWT = () => {

    const APP_ID =`${process.env.OracleAPP_ID}`;    // from IDCS Oracle Application ID
    const AUD =`${process.env.OracleAUDIENCE}`;    // Identity Domain Audience
    const SUB =  `${process.env.OracleSUB}` ;     // Service Account Username
    const JTI = `${process.env.OracleJTI}`;      // any unique identifier
    const KID =`${process.env.OracleKID}`;      // Service Account Without Underscore
    const IAT = Math.floor(Date.now() / 1000); // current time in seconds
    const EXP = IAT + 365 * 24 * 60 * 60;     // expire 1 year in the future

    const header = {
        alg: "RS256",
        typ: "JWT",
        kid: KID
    };

    const payload = {
        sub: SUB,
        jti: JTI,
        iat: IAT,
        exp: EXP,
        iss: APP_ID,
        aud: AUD
    };

    // Convert object to base64url
    const headerBase64 = base64url(Buffer.from(JSON.stringify(header)).toString('base64'));
    const payloadBase64 = base64url(Buffer.from(JSON.stringify(payload)).toString('base64'));

    const headerPayload = `${headerBase64}.${payloadBase64}`;

    // Read private key from file
    const privateKey =  fs.readFileSync(path.resolve(__dirname, 'private_key.pem'), 'utf8');

    const sign = crypto.createSign('RSA-SHA256');
    sign.update(headerPayload);
    const signatureBase64 = base64url(sign.sign(privateKey, 'base64'));

    const jwt = `${headerPayload}.${signatureBase64}`;

    return {
        token: jwt,
        expDate: new Date(EXP * 1000).toISOString()
    };
};


async function newgetoraclebearertoken(JWTUserAssertion1) {

  const clientId     = `${process.env.OracleAppClienttID}`;
  const clientSecret = `${process.env.OracleAppClienttSecrect}`;
  const base64Credentials = btoa(`${clientId}:${clientSecret}`);
  const Scope="urn:opc:resource:fa:instanceid="+`${process.env.OracleScope}`+"urn:opc:resource:consumer::all";
  const granttype="urn:ietf:params:oauth:grant-type:jwt-bearer";
  let data = qs.stringify({
    'grant_type': granttype,
    'assertion':JWTUserAssertion1,
    'scope':Scope
  });
       const idcsurlapi=process.env.oracleIDCS_Url;

// Check if .env file exists
const envPath = path.resolve(process.cwd(), '.env');
console.log('.env file exists:', fs.existsSync(envPath));
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url:idcsurlapi ,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'Authorization': 'Basic '+ base64Credentials,
      'HTTPAccept': '*/*'
    },
    data: data
  };

  try {

   // Example fix for OracleBotToken.js
const apiUrl =idcsurlapi; // or whatever URL is being used
console.log('apiUrl;', apiUrl);
if (!apiUrl) {
  console.error('API URL is undefined. Check your environment variables.');
  throw new Error('API URL is undefined. Check your environment variables.');
}
    const response = await axios.request(config);
    const access_token = response.data.access_token;
    const expires_in= response.data.expires_in;
  // Store the access token globally
 
  globalAccessToken = access_token;
  globalExpiresIn = expires_in;
    return {
      access_token: access_token,
      expires_in: expires_in
    };
  } catch (error) {
     console.log(error);
    throw new Error('Error while calling REST API newgetoraclebearertoken');
  }
}

async function JWTUserAssertioninit() {
  try {
    const result = generateJWT();
    globalJwt = result.token;
    expirationDate = result.expDate;
    //console.log(`Initial JWT: ${globalJwt}`);
    //console.log(`Initial Expiration Date: ${expirationDate}`);
  } catch (error) {
    console.error(`Error initializing JWT: ${error}`);
  }
}

async function AccessTokeninit(JWToken) {
  try {
    const Results2 = await newgetoraclebearertoken(JWToken);
    setGlobalAccessToken(Results2.access_token);
    setglobalExpiresIn(Results2.expires_in);
   // console.log(`Initial Access Token: ${Results2.access_token}`);
  } catch (error) {
    console.error(`Error initializing Bearer token: ${error}`);
  }
}




function getGlobalAccessToken() {
  return globalAccessToken;
}

function setGlobalAccessToken(token) {
  globalAccessToken = token;
}
function getglobalExpiresIn() {
  return globalExpiresIn;
}

function setglobalExpiresIn(exptime) {
  globalExpiresIn = exptime;
}


function getGlobalJwt() {
  return globalJwt;
}

function setGlobalJwt(jwt) {
  globalJwt = jwt;
}

  module.exports = {
    newgetoraclebearertoken:newgetoraclebearertoken,
    generateJWT,
    getGlobalAccessToken,
    setGlobalAccessToken,
    getGlobalJwt,
    setGlobalJwt,
    JWTUserAssertioninit,
    AccessTokeninit,
    getglobalExpiresIn,
    setglobalExpiresIn
  };
  
 