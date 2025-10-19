// chat.js routes the different things that we can do like
// send a message, create a new session, get all user sessions, get a message for a specific session
// delete a session etc.

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const chatController = require('../controllers/chatController');

// tells the router that every route that comes through must be verified through its token 
router.use(verifyToken);

// POST /api/chat/message - Send a message
router.post('/message', chatController.sendMessage);

// POST /api/chat/session - Create new session
router.post('/session', chatController.createSession);

// GET /api/chat/sessions - Get all user sessions
router.get('/sessions', chatController.getSessions);

// GET /api/chat/messages/:sessionId - Get messages for a session
router.get('/messages/:sessionId', chatController.getMessages);

// DELETE /api/chat/session/:sessionId - Delete a session
router.delete('/session/:sessionId', chatController.deleteSession);

module.exports = router;