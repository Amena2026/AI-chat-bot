require('dotenv').config();  // contains environment variables from the .env file like port #, API key, Database

// imports express and cors libraries
const express = require('express');
const cors = require('cors');

const chatRoutes = require('./routes/chat');

const app = express(); // creates an express app

// Middleware
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://ai-chatbot-13281.web.app',
    'https://ai-chatbot-13281.firebaseapp.com'
  ],
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json()); // parses json data in to JavaScript objects 

// any url starting with /api/chat should be handled by the chatRoutes file
app.use('/api/chat', chatRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'AI Chatbot API is running!' });
});

const PORT = process.env.PORT || 5000; // load the port env variable

// starts the server on port 5000 and listens for requests
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});