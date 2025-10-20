require('dotenv').config();
const axios = require('axios');

const apiKey = process.env.GEMINI_API_KEY;

async function testGeneration() {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const response = await axios.post(url, {
      contents: [{
        parts: [{ text: "Say hello in a friendly way!" }]
      }]
    });
    
    console.log('✅ SUCCESS!');
    console.log('AI Response:', response.data.candidates[0].content.parts[0].text);
    
  } catch (error) {
    console.log('❌ FAILED');
    console.log('Error:', error.response?.data || error.message);
  }
}

testGeneration();