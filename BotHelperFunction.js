const express = require('express');
const router = express.Router();
require('dotenv').config();
const { Buffer } = require('node:buffer');
require('./ERPChatBotApp');


global.preventGreetingResponse = false;
global.afternoid = 1;

// Function to get the current day and month in cron expression format
function getDynamicCronExpression() {
  const today = new Date();
const yesterday = new Date(today);
// Subtract one day
yesterday.setDate(today.getDate() - 1);
const dayOfMonth = yesterday.getDate();
const month = yesterday.getMonth() + 1; // Convert to 1-based mont

  // Cron expression format: 'minute hour day month weekday'
  return `0 0 ${dayOfMonth} ${month} *`;
}

module.exports = { 
    router ,
    getDynamicCronExpression
};

