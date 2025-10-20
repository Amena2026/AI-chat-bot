import React from 'react';

const SessionSidebar = ({ 
  sessions, 
  activeSessionId, 
  onSelectSession, 
  onNewChat, 
  onDeleteSession,
  isOpen,
  onToggle 
}) => {
  const sessionArray = Object.entries(sessions).sort((a, b) => {
    return b[1].lastMessageAt - a[1].lastMessageAt;
  });

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <h1 className="sidebar-title">Chats</h1>
        <button className="btn-new-chat" onClick={onNewChat}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          New Chat
        </button>
      </div>

      <div className="sessions-list">
        {sessionArray.length === 0 ? (
          <div className="no-sessions">
            <p>No previous chats</p>
            <p className="text-muted">Start a new conversation</p>
          </div>
        ) : (
          sessionArray.map(([sessionId, session]) => (
            <div
              key={sessionId}
              className={`session-item ${activeSessionId === sessionId ? 'active' : ''}`}
              onClick={() => onSelectSession(sessionId)}
            >
              <div className="session-info">
                <svg className="session-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span className="session-title">{session.title}</span>
              </div>
              <button
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Delete this chat?')) {
                    onDeleteSession(sessionId);
                  }
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SessionSidebar;