import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../api/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const Chat = () => {
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);
  const pollingRef = useRef(null);

  // Fetch all staff and admin users eligible for chat
  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get('/chats/users');
      setUsers(res.data.data || []);
    } catch {
      toast.error('Failed to load active staff and admin members.');
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Poll for user list updates (to dynamically re-sort and show unread blue dots)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUsers();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchUsers]);

  // Fetch message thread for chosen user
  const fetchMessages = useCallback(async (otherUserId, showSpinner = false) => {
    if (showSpinner) setLoadingMessages(true);
    try {
      const res = await api.get(`/chats/${otherUserId}`);
      setMessages(res.data.data || []);
    } catch {
      // Don't show toast errors during polling to keep experience smooth
      if (showSpinner) toast.error('Failed to load message thread.');
    } finally {
      if (showSpinner) setLoadingMessages(false);
    }
  }, []);

  // Poll for new messages every 3 seconds when active conversation exists
  useEffect(() => {
    if (activeUser) {
      fetchMessages(activeUser.id, true);

      pollingRef.current = setInterval(() => {
        fetchMessages(activeUser.id, false);
      }, 3000);
    } else {
      setMessages([]);
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [activeUser, fetchMessages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeUser) return;

    setSending(true);
    try {
      await api.post('/chats', {
        receiverId: activeUser.id,
        messageText: inputText
      });
      setInputText('');
      // Immediately refresh messages and sorting
      fetchMessages(activeUser.id, false);
      fetchUsers();
    } catch {
      toast.error('Could not send message.');
    } finally {
      setSending(false);
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatMessageDate = (dateStr) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (d.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return d.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
    }
  };

  const { user: currentUser } = useAuth();

  return (
    <div className="page-container" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <div>
          <h1 className="page-title">Internal Team Chat</h1>
          <p className="page-subtitle">Chat in real-time with other active Staff and Administrators.</p>
        </div>
      </div>

      <div className="card" style={{ flex: 1, display: 'flex', overflow: 'hidden', padding: 0, minHeight: 0 }}>
        {/* Users Sidebar */}
        <div style={{
          width: '320px',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(255, 255, 255, 0.01)'
        }}>
          <div style={{ padding: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <h4 style={{ margin: 0, fontWeight: 600 }}>Team Members</h4>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
            {loadingUsers ? (
              <div className="text-center text-muted" style={{ padding: '20px' }}>⏳ Loading team list…</div>
            ) : users.length === 0 ? (
              <div className="text-center text-muted" style={{ padding: '20px' }}>No other staff or admins found.</div>
            ) : (
              users.map((u) => (
                <div
                  key={u.id}
                  onClick={() => {
                    setActiveUser(u);
                    setTimeout(() => { fetchUsers(); }, 200);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: activeUser?.id === u.id ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                    border: activeUser?.id === u.id ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                    marginBottom: '4px'
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: u.role === 'Admin' ? 'linear-gradient(135deg, #ec4899, #f43f5e)' : 'linear-gradient(135deg, #6366f1, #3b82f6)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}>
                    {getInitials(u.fullName)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#fff' }}>
                        {u.fullName}
                        {u.unreadCount > 0 && (
                          <span style={{
                            width: '8px',
                            height: '8px',
                            backgroundColor: '#3b82f6',
                            borderRadius: '50%',
                            display: 'inline-block',
                            boxShadow: '0 0 8px #3b82f6',
                            flexShrink: 0
                          }} />
                        )}
                      </span>
                      <span className={`badge ${u.role === 'Admin' ? 'badge-danger' : 'badge-info'}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                        {u.role}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {u.email}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Thread Panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(255, 255, 255, 0.005)' }}>
          {activeUser ? (
            <>
              {/* Active User Header */}
              <div style={{
                padding: '12px 20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(255, 255, 255, 0.01)'
              }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#fff' }}>{activeUser.fullName}</h3>
                  <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>{activeUser.email}</span>
                </div>
                <span className={`badge ${activeUser.role === 'Admin' ? 'badge-danger' : 'badge-info'}`}>{activeUser.role}</span>
              </div>

              {/* Chat Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {loadingMessages ? (
                  <div className="text-center text-muted" style={{ margin: 'auto' }}>⏳ Loading messages…</div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-muted" style={{ margin: 'auto' }}>💬 No messages yet. Say hello!</div>
                ) : (
                  (() => {
                    let lastDateStr = null;
                    return messages.map((m) => {
                      const isSelf = m.senderId === currentUser?.id;
                      const msgDateStr = new Date(m.sentAt).toDateString();
                      const showDateHeader = msgDateStr !== lastDateStr;
                      lastDateStr = msgDateStr;

                      return (
                        <React.Fragment key={m.id}>
                          {showDateHeader && (
                            <div style={{
                              alignSelf: 'center',
                              margin: '16px 0 8px 0',
                              padding: '4px 12px',
                              borderRadius: '12px',
                              background: 'rgba(255, 255, 255, 0.08)',
                              color: 'rgba(255, 255, 255, 0.6)',
                              fontSize: '11px',
                              fontWeight: '600',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                            }}>
                              {formatMessageDate(m.sentAt)}
                            </div>
                          )}
                          <div
                            style={{
                              alignSelf: isSelf ? 'flex-end' : 'flex-start',
                              maxWidth: '70%',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: isSelf ? 'flex-end' : 'flex-start'
                            }}
                          >
                            <div style={{
                              padding: '10px 16px',
                              borderRadius: isSelf ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                              background: isSelf ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'rgba(255, 255, 255, 0.08)',
                              color: '#fff',
                              fontSize: '14px',
                              lineHeight: '1.4',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                              {m.messageText}
                            </div>
                            <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)', marginTop: '4px' }}>
                              {new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </React.Fragment>
                      );
                    });
                  })()
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Footer */}
              <form onSubmit={handleSend} style={{
                padding: '16px 20px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'rgba(255, 255, 255, 0.01)',
                display: 'flex',
                gap: '12px'
              }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder={`Type a message to ${activeUser.fullName}…`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  style={{ flex: 1 }}
                  required
                />
                <button type="submit" className="btn btn-primary" disabled={sending || !inputText.trim()} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {sending ? 'Sending…' : 'Send'} 🚀
                </button>
              </form>
            </>
          ) : (
            <div style={{ margin: 'auto', textAlign: 'center', color: 'rgba(255, 255, 255, 0.4)' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
              <h3>Team Messaging</h3>
              <p>Select a team member from the list to start a conversation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
