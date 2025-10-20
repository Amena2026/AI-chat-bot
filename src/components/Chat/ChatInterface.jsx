import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import SessionSidebar from './SessionSidebar';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { createSession, getSessions, deleteSession } from '../../services/chatService';
import '../../styles/Chat.css';

const ChatInterface = () => {
  const { currentUser, logout } = useAuth();
  const [sessions, setSessions] = useState({});
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Load sessions when component mounts
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const userSessions = await getSessions();
      setSessions(userSessions || {});

      // If user has sessions, set the most recent as active
      if (userSessions && Object.keys(userSessions).length > 0) {
        const sessionIds = Object.keys(userSessions);
        const mostRecentId = sessionIds.reduce((latest, current) => {
          return userSessions[current].lastMessageAt > userSessions[latest].lastMessageAt
            ? current
            : latest;
        });
        setActiveSessionId(mostRecentId);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = async () => {
    try {
      const response = await createSession('New Chat');
      const newSessionId = response.sessionId;
      
      // Add new session to state
      setSessions(prev => ({
        ...prev,
        [newSessionId]: response.session
      }));
      
      // Set as active session
      setActiveSessionId(newSessionId);
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const handleSelectSession = (sessionId) => {
    setActiveSessionId(sessionId);
  };

  const handleDeleteSession = async (sessionId) => {
    try {
    // IMPORTANT: Import deleteSession at the top first!
    // Call backend to delete from Firebase
      await deleteSession(sessionId);
    
    // Remove from state
    setSessions(prev => {
      const updated = { ...prev };
      delete updated[sessionId];
      return updated;
    });

    // If deleted session was active, switch to another or null
    if (sessionId === activeSessionId) {
      const remainingSessions = Object.keys(sessions).filter(id => id !== sessionId);
      if (remainingSessions.length > 0) {
        setActiveSessionId(remainingSessions[0]);
      } else {
        setActiveSessionId(null);
      }
    }
  } catch (error) {
    console.error('Error deleting session:', error);
    alert('Failed to delete chat');
  }
  }; 

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (loading) {
    return (
      <div className="chat-loading">
        <div className="loading-spinner"></div>
        <p>Loading your chats...</p>
      </div>
    );
  }

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <SessionSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
      />

      {/* Main Chat Area */}
      <div className="chat-main">
        {/* Header */}
        <div className="chat-header">
          <button className="menu-toggle" onClick={toggleSidebar}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <h2 className="chat-title">
            {activeSessionId && sessions[activeSessionId] 
              ? sessions[activeSessionId].title 
              : 'AI Chatbot'}
          </h2>
          <div className="user-menu">
            <span className="user-name">{currentUser?.displayName || 'User'}</span>
            <button className="logout-btn" onClick={logout}>Logout</button>
          </div>
        </div>

        {/* Messages or Empty State */}
        {activeSessionId ? (
          <>
            <MessageList sessionId={activeSessionId} />
            <MessageInput 
              sessionId={activeSessionId} 
              onMessageSent={loadSessions}
            />
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-state-content">
              <svg className="empty-icon" width="80" height="80" viewBox="0 0 24 24" fill="none">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h2>Start a new conversation</h2>
              <p>Click "New Chat" to begin chatting with the AI assistant</p>
              <button className="btn-primary" onClick={handleNewChat}>
                New Chat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;