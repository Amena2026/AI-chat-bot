const { db } = require('../config/firebase-admin');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// allows a user to send a message, save that message to the database, pass that message to a LLM, and then 
// saves the AI message to the database 
exports.sendMessage = async (req, res) => {
  try {

    // first extract data from the request
    const { sessionId, message } = req.body; // the body of the request ie the user information
    const userId = req.user.uid;             // user information from the verified token

    // Verifies that the session belongs to this user
    const sessionSnapshot = await db.ref(`sessions/${userId}/${sessionId}`).once('value');
    if (!sessionSnapshot.exists()) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Saves the user's message to the Firebase real time database 
    const userMessageRef = db.ref(`messages/${sessionId}`).push();
    await userMessageRef.set({
      role: 'user',
      content: message,
      timestamp: Date.now()
    });

    // get all of the previous messages for this context so that the LLM knows the full conversation
    // history for this particular session
    const messagesSnapshot = await db.ref(`messages/${sessionId}`).once('value');
    const messages = [];
    messagesSnapshot.forEach((child) => {
      const msg = child.val();
      messages.push({
        role: msg.role,
        content: msg.content
      });
    });

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages, // full conversation history
    });

    // store the AI response in this variable 
    const aiResponse = completion.choices[0].message.content;

    // Save AI response to database
    const aiMessageRef = db.ref(`messages/${sessionId}`).push();
    await aiMessageRef.set({
      role: 'assistant',
      content: aiResponse,
      timestamp: Date.now()
    });

    // Update session's last message timestamp
    await db.ref(`sessions/${userId}/${sessionId}`).update({
      lastMessageAt: Date.now()
    });
    // send the response back to react 
    res.json({
      success: true,
      message: aiResponse
    });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Create a new chat session
exports.createSession = async (req, res) => {
  try {

    const userId = req.user.uid; // grab user id 
    const { title } = req.body;

    // generate a new unique session ID so that the user can reference this session again in the future
    const sessionRef = db.ref(`sessions/${userId}`).push();
    const sessionId = sessionRef.key; // auto generated session ID

    // save the session to firebase 
    await sessionRef.set({
      title: title || 'New Chat',
      createdAt: Date.now(),
      lastMessageAt: Date.now()
    });

    // send the session info back to react 
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

// getSessions loads chat history
exports.getSessions = async (req, res) => {
  try {
    const userId = req.user.uid;

    // gets all of the user sessions and returns a snapshot (ie like a picture of all the users current sessions)
    const sessionsSnapshot = await db.ref(`sessions/${userId}`).once('value');
    const sessions = {};

    // loops through every session in our snapshot, builds a session object that contains info on all of the users sessions
    // we can then use this to display a sidebar list of chats, sort by most recent, last etc
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

// Get messages for a specific session
exports.getMessages = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.uid;

    // Verify session belongs to user
    // if a user tries to accesss someone elses sesssion it will fail
    const sessionSnapshot = await db.ref(`sessions/${userId}/${sessionId}`).once('value');
    if (!sessionSnapshot.exists()) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // read all messages for this specific snapshot 
    const messagesSnapshot = await db.ref(`messages/${sessionId}`).once('value');
    const messages = {};

    // loop through every message in our message snapshot and build a message object containing all messages for 
    // this particular session
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

// Delete a session
exports.deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.uid;

    // Delete the session  from /sessions/userId/sessionId
    await db.ref(`sessions/${userId}/${sessionId}`).remove(); // .remove is a firebase method to delete data at specified path
    // Delete all messages from /messages/sessionId
    await db.ref(`messages/${sessionId}`).remove();

    // if a user tries to delete at a session that doesnt belong to him it wont work, or if they try to delete a session
    // that doesnt exist it wont work either
    
    res.json({
      success: true,
      message: 'Session deleted'
    });

  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
};