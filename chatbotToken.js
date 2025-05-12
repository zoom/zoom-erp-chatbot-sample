const axios = require('axios');
/*
 * Retrieves a Zoom access token using the client credentials grant flow.
 *
 * This function fetches a new Zoom access token by making a POST request to the Zoom OAuth token endpoint.
 * It uses the client ID and client secret stored in the application's environment variables to authenticate the request.
 *
 * @returns {Promise<string>} The Zoom access token.
 * @throws {Error} If there is an error fetching the access token.
 */
async function getChatbotToken() {
  try {
    const response = await axios.post('https://api.zoom.us/oauth/token', null, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.zoom_client_id}:${process.env.zoom_client_secret}`).toString('base64')}`
      },
      params: {
        grant_type: 'client_credentials'
      }
    });

    if (response.status !== 200) {
      throw new Error('Error getting chatbot_token from Zoom');
    }

    return response.data.access_token;
  } catch (error) {
    throw new Error('Error getting chatbot_token from Zoom');
  }
}

module.exports = {
  getChatbotToken
};