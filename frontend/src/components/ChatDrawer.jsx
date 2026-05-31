import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Bell, Inbox, AlertTriangle, ArrowRight } from 'lucide-react';

export default function ChatDrawer({ chatHistory, alertsHistory, onSendChatMessage }) {
  const [activePane, setActivePane] = useState('chat'); // 'chat' or 'alerts'
  const [inputMsg, setInputMsg] = useState('');
  const chatEndRef = useRef(null);
  const prevLengthRef = useRef(chatHistory.length);
  const prevPaneRef = useRef(activePane);

  useEffect(() => {
    const chatAppended = chatHistory.length > prevLengthRef.current;
    const tabSwappedToChat = activePane === 'chat' && prevPaneRef.current !== 'chat';

    if (chatAppended || tabSwappedToChat) {
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
    prevLengthRef.current = chatHistory.length;
    prevPaneRef.current = activePane;
  }, [chatHistory.length, activePane]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    
    const msg = inputMsg;
    setInputMsg('');
    await onSendChatMessage(msg);
  };

  const getAlertIcon = (type) => {
    if (type === 'Telegram') return { icon: MessageSquare, bg: '#EFF6FF', color: '#3B82F6' };
    if (type === 'Email') return { icon: Inbox, bg: '#FDF2F8', color: '#DB2777' };
    return { icon: AlertTriangle, bg: '#FEF3C7', color: '#D97706' };
  };

  return (
    <div style={styles.card}>
      {/* Pane Switches */}
      <div style={styles.tabRow}>
        <button
          onClick={() => setActivePane('chat')}
          style={{
            ...styles.paneBtn,
            ...(activePane === 'chat' ? styles.paneBtnActive : {})
          }}
        >
          <MessageSquare size={14} />
          <span>Telegram Chatbot</span>
        </button>
        <button
          onClick={() => setActivePane('alerts')}
          style={{
            ...styles.paneBtn,
            ...(activePane === 'alerts' ? styles.paneBtnActive : {})
          }}
        >
          <Bell size={14} />
          <span>Alerts Logs ({alertsHistory.length})</span>
        </button>
      </div>

      {activePane === 'chat' ? (
        /* Chatbot Panel */
        <div style={styles.chatWrapper}>
          <div style={styles.chatLogs}>
            {chatHistory.map((chat, idx) => {
              const isBot = chat.sender === 'Bot';
              const isSys = chat.sender === 'System';
              
              let bubbleStyle = styles.userBubble;
              let alignStyle = styles.userAlign;
              let textStyle = styles.userText;
              
              if (isBot) {
                bubbleStyle = styles.botBubble;
                alignStyle = styles.botAlign;
                textStyle = styles.botText;
              } else if (isSys) {
                bubbleStyle = styles.sysBubble;
                alignStyle = styles.sysAlign;
                textStyle = styles.sysText;
              }

              return (
                <div key={idx} style={{ ...styles.msgRow, ...alignStyle }}>
                  <span style={styles.senderLabel}>
                    {isBot ? '🤖 Plant Guardian Bot' : isSys ? '📢 System Alert' : '👤 You'}
                  </span>
                  <div style={bubbleStyle}>
                    <p style={{ ...styles.msgText, ...textStyle }}>{chat.message}</p>
                  </div>
                  <span style={styles.timestamp}>{chat.timestamp}</span>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Quick command suggestions */}
          <div style={styles.suggestions}>
            <button onClick={() => setInputMsg('/status')} style={styles.sugBtn}>/status</button>
            <button onClick={() => setInputMsg('/tasks')} style={styles.sugBtn}>/tasks</button>
            <button onClick={() => setInputMsg('/pump_on')} style={styles.sugBtn}>/pump_on</button>
            <button onClick={() => setInputMsg('/fan_on')} style={styles.sugBtn}>/fan_on</button>
          </div>

          {/* Input box */}
          <form onSubmit={handleSend} style={styles.inputForm}>
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Text greenhouse chatbot (/status, /tasks)..."
              style={styles.chatInput}
            />
            <button type="submit" style={styles.sendBtn}>
              <Send size={14} color="#FFFFFF" />
            </button>
          </form>
        </div>
      ) : (
        /* Alerts Notification History Logs */
        <div style={styles.alertsWrapper}>
          <div style={styles.alertsList}>
            {alertsHistory.map((alert, idx) => {
              const config = getAlertIcon(alert.type);
              const Icon = config.icon;
              return (
                <div key={idx} style={styles.alertCard}>
                  <div style={{ ...styles.alertIconCircle, backgroundColor: config.bg }}>
                    <Icon size={14} color={config.color} />
                  </div>
                  <div style={styles.alertDetails}>
                    <div style={styles.alertTitleRow}>
                      <span style={styles.alertSubject}>{alert.subject}</span>
                      <span style={styles.alertTime}>{alert.timestamp}</span>
                    </div>
                    <p style={styles.alertBody}>{alert.body}</p>
                    <span style={{ ...styles.alertTypeTag, color: config.color }}>
                      via {alert.type} Service
                    </span>
                  </div>
                </div>
              );
            })}

            {alertsHistory.length === 0 && (
              <div style={styles.emptyAlerts}>
                <Inbox size={32} color="#94A3B8" />
                <h4 style={styles.emptyAlertsTitle}>No Alerts Fired</h4>
                <p style={styles.emptyAlertsDesc}>
                  Environmental thresholds are operating within stable limits. You will see warning logs here if readings cross thresholds.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: 'var(--color-bg-card)',
    border: '1px solid var(--color-border)',
    borderRadius: '20px',
    padding: '20px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.01)',
    display: 'flex',
    flexDirection: 'column',
    height: '420px',
    transition: 'background-color 0.2s, border 0.2s'
  },
  tabRow: {
    display: 'flex',
    gap: '8px',
    borderBottom: '1px solid var(--color-border)',
    padding: 'bottom 12px',
    marginBottom: '12px',
    transition: 'border 0.2s'
  },
  paneBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 14px',
    border: 'none',
    borderRadius: '10px',
    backgroundColor: 'transparent',
    color: 'var(--color-text-muted)',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  paneBtnActive: {
    backgroundColor: 'var(--color-primary-light)',
    color: 'var(--color-primary)'
  },
  chatWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden'
  },
  chatLogs: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    flex: 1,
    overflowY: 'auto',
    paddingRight: '6px',
    marginBottom: '8px'
  },
  msgRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    maxWidth: '85%'
  },
  userAlign: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end'
  },
  botAlign: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start'
  },
  sysAlign: {
    alignSelf: 'center',
    alignItems: 'center',
    maxWidth: '95%'
  },
  senderLabel: {
    fontSize: '9px',
    fontWeight: '700',
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase',
    transition: 'color 0.2s'
  },
  userBubble: {
    backgroundColor: 'var(--color-primary)',
    borderRadius: '14px 14px 2px 14px',
    padding: '10px 14px'
  },
  botBubble: {
    backgroundColor: 'var(--color-bg-base)',
    borderRadius: '14px 14px 14px 2px',
    padding: '10px 14px',
    transition: 'background-color 0.2s'
  },
  sysBubble: {
    backgroundColor: 'var(--color-warning-light)',
    border: '1px solid var(--color-warning)',
    borderRadius: '10px',
    padding: '6px 12px',
    transition: 'all 0.2s'
  },
  msgText: {
    fontSize: '12.5px',
    lineHeight: '1.4',
    whiteSpace: 'pre-line'
  },
  userText: {
    color: '#FFFFFF'
  },
  botText: {
    color: 'var(--color-text-body)',
    transition: 'color 0.2s'
  },
  sysText: {
    color: 'var(--color-warning)',
    fontSize: '11px',
    fontWeight: '600',
    transition: 'color 0.2s'
  },
  timestamp: {
    fontSize: '9px',
    color: 'var(--color-text-muted)',
    transition: 'color 0.2s'
  },
  suggestions: {
    display: 'flex',
    gap: '4px',
    padding: '4px 0',
    overflowX: 'auto',
    marginBottom: '8px'
  },
  sugBtn: {
    padding: '4px 10px',
    backgroundColor: 'var(--color-bg-base)',
    border: '1px solid var(--color-border)',
    borderRadius: '6px',
    color: 'var(--color-text-muted)',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'all 0.2s'
  },
  inputForm: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  },
  chatInput: {
    flex: 1,
    height: '38px',
    backgroundColor: 'var(--color-bg-base)',
    border: '1px solid var(--color-border)',
    borderRadius: '10px',
    padding: '0 12px',
    fontSize: '12px',
    fontWeight: '500',
    outline: 'none',
    color: 'var(--color-text-body)',
    transition: 'all 0.2s'
  },
  sendBtn: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    backgroundColor: 'var(--color-primary)',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(124,58,237,0.2)',
    transition: 'all 0.2s'
  },
  alertsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflowY: 'auto'
  },
  alertsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  alertCard: {
    display: 'flex',
    gap: '12px',
    padding: '12px',
    border: '1px solid var(--color-border)',
    borderRadius: '14px',
    backgroundColor: 'var(--color-bg-base)',
    transition: 'all 0.2s'
  },
  alertIconCircle: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  alertDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1
  },
  alertTitleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  alertSubject: {
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--color-text-title)',
    transition: 'color 0.2s'
  },
  alertTime: {
    fontSize: '9px',
    color: 'var(--color-text-muted)',
    transition: 'color 0.2s'
  },
  alertBody: {
    fontSize: '11px',
    color: 'var(--color-text-body)',
    lineHeight: '1.4',
    transition: 'color 0.2s'
  },
  alertTypeTag: {
    fontSize: '9px',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: '2px'
  },
  emptyAlerts: {
    margin: 'auto',
    textAlign: 'center',
    padding: '40px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    maxWidth: '280px'
  },
  emptyAlertsTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--color-text-body)',
    fontFamily: "'Outfit', sans-serif",
    transition: 'color 0.2s'
  },
  emptyAlertsDesc: {
    fontSize: '10.5px',
    color: 'var(--color-text-muted)',
    lineHeight: '1.4',
    transition: 'color 0.2s'
  }
};
