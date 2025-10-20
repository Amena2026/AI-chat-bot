const { db } = require('../config/firebase-admin');
const axios = require('axios');

exports.sendMessage = async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    const userId = req.user.uid;

    // Verify session belongs to user
    const sessionSnapshot = await db.ref(`sessions/${userId}/${sessionId}`).once('value');
    if (!sessionSnapshot.exists()) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Save user message to Firebase
    const userMessageRef = db.ref(`messages/${sessionId}`).push();
    await userMessageRef.set({
      role: 'user',
      content: message,
      timestamp: Date.now()
    });

    // Get conversation history
    const messagesSnapshot = await db.ref(`messages/${sessionId}`).once('value');
    const conversationHistory = [];
    
    messagesSnapshot.forEach((child) => {
      const msg = child.val();
      conversationHistory.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      });
    });

    // Call Gemini API
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const contents = conversationHistory.map(msg => ({
      role: msg.role,
      parts: msg.parts
    }));

    console.log('Calling Gemini 2.5 Flash...');
    
    const geminiResponse = await axios.post(url, {
      contents: contents,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const aiResponse = geminiResponse.data.candidates[0].content.parts[0].text;
    console.log('✅ Gemini API responded successfully');

    // Save AI response to Firebase
    const aiMessageRef = db.ref(`messages/${sessionId}`).push();
    await aiMessageRef.set({
      role: 'assistant',
      content: aiResponse,
      timestamp: Date.now()
    });

    // Update session timestamp
    await db.ref(`sessions/${userId}/${sessionId}`).update({
      lastMessageAt: Date.now()
    });

    res.json({
      success: true,
      message: aiResponse
    });

  } catch (error) {
    console.error('Error sending message:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false,
      error: 'Failed to send message',
      details: error.response?.data || error.message
    });
  }
};

// Keep all other functions the same (createSession, getSessions, getMessages, deleteSession)
exports.createSession = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { title } = req.body;

    const sessionRef = db.ref(`sessions/${userId}`).push();
    const sessionId = sessionRef.key;

    await sessionRef.set({
      title: title || 'New Chat',
      createdAt: Date.now(),
      lastMessageAt: Date.now()
    });

    res.json({
      success: true,
      sessionId: sessionId,
      session: {
        title: title || 'New Chat',
        createdAt: Date.now()
      }
    });

  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
};

exports.getSessions = async (req, res) => {
  try {
    const userId = req.user.uid;
    const sessionsSnapshot = await db.ref(`sessions/${userId}`).once('value');
    const sessions = {};

    sessionsSnapshot.forEach((child) => {
      sessions[child.key] = child.val();
    });

    res.json({
      success: true,
      sessions: sessions
    });

  } catch (error) {
    console.error('Error getting sessions:', error);
    res.status(500).json({ error: 'Failed to get sessions' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.uid;

    const sessionSnapshot = await db.ref(`sessions/${userId}/${sessionId}`).once('value');
    if (!sessionSnapshot.exists()) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const messagesSnapshot = await db.ref(`messages/${sessionId}`).once('value');
    const messages = {};

    messagesSnapshot.forEach((child) => {
      messages[child.key] = child.val();
    });

    res.json({
      success: true,
      messages: messages
    });

  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
};

exports.deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.uid;

    await db.ref(`sessions/${userId}/${sessionId}`).remove();
    await db.ref(`messages/${sessionId}`).remove();
    
    res.json({
      success: true,
      message: 'Session deleted'
    });

  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
};