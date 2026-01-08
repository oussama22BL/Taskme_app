import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import './ChatWidget.css';

const ChatWidget: React.FC = () => {
  const { user } = useAuth();
  const {
    conversations,
      messages,
    onlineUsers,
    sendMessage,
    startConversation,
    markAsRead,
    
    isTyping,
    setIsTyping
  } = useChat();
  
  const { widgetOpen, closeWidget, toggleWidget } = useChat();
  const [isOpen, setIsOpen] = useState(widgetOpen);
  const [messageInput, setMessageInput] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // sync with context widget state
    setIsOpen(widgetOpen);
  }, [widgetOpen]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = () => {
    if (messageInput.trim() && selectedUser) {
      sendMessage(selectedUser, messageInput.trim());
      setMessageInput('');
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getOtherUser = (participantIds: string[]) => {
    const otherId = participantIds.find(id => id !== user?.id);
    return onlineUsers.find(u => u.id === otherId);
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-widget-container">
      <button
        className="chat-toggle-button"
        onClick={() => toggleWidget()}
        aria-label="Ouvrir le chat"
      >
        <span className="chat-icon">💬</span>
        {conversations.some(c => c.unreadCount > 0) && (
          <span className="chat-badge">
            {conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>Chat interne</h3>
            <button className="chat-close" onClick={() => closeWidget()}>
              ×
            </button>
          </div>

          <div className="chat-content">
            <div className="chat-sidebar">
              <div className="online-users">
                <h4>En ligne ({onlineUsers.filter(u => u.isOnline).length})</h4>
                <div className="user-list">
                  {onlineUsers.map(userItem => (
                    <div
                      key={userItem.id}
                      className={`user-item ${selectedUser === userItem.id ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedUser(userItem.id);
                        startConversation(userItem.id);
                      }}
                    >
                      <span className="user-avatar">{userItem.avatar}</span>
                      <span className="user-name">{userItem.name}</span>
                      <span className={`user-status ${userItem.isOnline ? 'online' : 'offline'}`}>
                        {userItem.isOnline ? '●' : '○'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="chat-conversations">
                <h4>Conversations</h4>
                <div className="conversation-list">
                  {conversations.map(conv => {
                    const otherUser = getOtherUser(conv.participantIds);
                    if (!otherUser) return null;

                    return (
                      <div
                        key={conv.id}
                        className={`conversation-item ${selectedUser === otherUser.id ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedUser(otherUser.id);
                          startConversation(otherUser.id);
                          markAsRead(conv.id);
                        }}
                      >
                        <span className="conversation-avatar">{otherUser.avatar}</span>
                        <div className="conversation-info">
                          <div className="conversation-name">{otherUser.name}</div>
                          <div className="conversation-preview">
                            {conv.lastMessage?.content.substring(0, 30)}...
                          </div>
                        </div>
                        {conv.unreadCount > 0 && (
                          <span className="conversation-unread">{conv.unreadCount}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="chat-main">
              {selectedUser ? (
                <>
                  <div className="chat-messages">
                    {messages.map(message => {
                      const isOwn = message.senderId === user?.id;
                      const sender = onlineUsers.find(u => u.id === message.senderId);

                      return (
                        <div
                          key={message.id}
                          className={`message ${isOwn ? 'sent' : 'received'}`}
                        >
                          {!isOwn && (
                            <span className="message-avatar">{sender?.avatar}</span>
                          )}
                          <div className="message-content">
                            <div className="message-text">{message.content}</div>
                            <div className="message-time">{formatTime(message.timestamp)}</div>
                          </div>
                        </div>
                      );
                    })}
                    {isTyping && (
                      <div className="typing-indicator">
                        <span>●</span>
                        <span>●</span>
                        <span>●</span>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="chat-input-container">
                    <textarea
                      value={messageInput}
                      onChange={(e) => {
                        setMessageInput(e.target.value);
                        setIsTyping(e.target.value.length > 0);
                      }}
                      onKeyPress={handleKeyPress}
                      placeholder="Tapez votre message..."
                      rows={2}
                      className="chat-input"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim()}
                      className="send-button"
                    >
                      Envoyer
                    </button>
                  </div>
                </>
              ) : (
                <div className="chat-placeholder">
                  <p>Sélectionnez une conversation pour commencer à discuter</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;