import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, BookOpen, AlertTriangle, CheckCircle2, Clock, Bot, User as UserIcon } from 'lucide-react';

export default function AiAssistant({ onSendMessage, isProcessing }) {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Hello! I am your AI Banking Assistant powered by LangGraph & RAG. Ask me anything about your account balances, recent transactions, spending patterns, or bank policies.",
      intent: 'general',
      sources: []
    }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  const handleSend = async (textToSend) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || isProcessing) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query
    };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');

    try {
      const aiResponse = await onSendMessage(query);
      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: aiResponse.response || 'I processed your inquiry.',
        intent: aiResponse.intent || 'general',
        toolUsed: aiResponse.tool_used,
        toolResult: aiResponse.tool_result,
        sources: aiResponse.sources || [],
        anomalies: aiResponse.anomalies || [],
        latencyMs: aiResponse.latency_ms
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: `⚠️ Error reaching AI Service: ${err.message || 'Please ensure AI service is running.'}`,
          intent: 'error',
          sources: []
        }
      ]);
    }
  };

  const samplePrompts = [
    "How much did I spend this month?",
    "Why can a bank transfer fail?",
    "Show my recent transactions",
    "How much money is in my account?",
    "What are the terms for account freezing?"
  ];

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '700px', overflow: 'hidden' }}>
      {/* Chat Header */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid var(--border-color)',
        background: 'rgba(14, 18, 26, 0.8)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(6, 182, 212, 0.3))',
            border: '1px solid rgba(139, 92, 246, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={18} color="#c084fc" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 className="font-display" style={{ fontSize: '16px', fontWeight: 700 }}>AI Banking Assistant</h3>
              <span className="badge-ai">LangGraph Orchestrated</span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Real-time read-only tools & grounded RAG</p>
          </div>
        </div>
      </div>

      {/* Suggested Quick Questions */}
      <div style={{
        padding: '12px 24px',
        borderBottom: '1px solid var(--border-color)',
        background: 'rgba(7, 9, 14, 0.4)',
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        whiteSpace: 'nowrap'
      }}>
        {samplePrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            disabled={isProcessing}
            style={{
              padding: '6px 12px',
              borderRadius: '999px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              flexShrink: 0
            }}
            onMouseOver={e => e.currentTarget.style.borderColor = 'var(--emerald-500)'}
            onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              gap: '12px',
              maxWidth: '85%',
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row'
            }}
          >
            {/* Avatar */}
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: msg.sender === 'user' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(139, 92, 246, 0.2)',
              border: `1px solid ${msg.sender === 'user' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(139, 92, 246, 0.4)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {msg.sender === 'user' ? <UserIcon size={16} color="var(--emerald-400)" /> : <Bot size={16} color="#c084fc" />}
            </div>

            {/* Bubble */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{
                padding: '14px 18px',
                borderRadius: '16px',
                background: msg.sender === 'user'
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.25))'
                  : 'rgba(18, 24, 38, 0.9)',
                border: `1px solid ${msg.sender === 'user' ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-color)'}`,
                color: 'var(--text-primary)',
                fontSize: '14px',
                lineHeight: '1.6',
                whiteSpace: 'pre-line'
              }}>
                {msg.text}
              </div>

              {/* RAG Sources Card */}
              {msg.sources && msg.sources.length > 0 && (
                <div style={{
                  background: 'rgba(6, 182, 212, 0.08)',
                  border: '1px solid rgba(6, 182, 212, 0.25)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  marginTop: '4px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--cyan-400)', fontWeight: 600, marginBottom: '6px' }}>
                    <BookOpen size={13} /> Verified RAG Knowledge Sources:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {msg.sources.map((src, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '11px',
                          background: 'rgba(255, 255, 255, 0.06)',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          color: '#e2e8f0',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                      >
                        📄 {src.title || src.document} ({src.category})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Execution Metadata Pill */}
              {msg.sender === 'ai' && (msg.toolUsed || msg.intent || msg.latencyMs) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-muted)', paddingLeft: '4px' }}>
                  {msg.intent && (
                    <span style={{ textTransform: 'capitalize' }}>
                      Intent: <strong>{msg.intent.replace('_', ' ')}</strong>
                    </span>
                  )}
                  {msg.toolUsed && (
                    <span>
                      • Tool: <code style={{ color: 'var(--cyan-400)' }}>{msg.toolUsed}</code>
                    </span>
                  )}
                  {msg.latencyMs && (
                    <span>• {msg.latencyMs}ms</span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {isProcessing && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(139, 92, 246, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bot size={16} color="#c084fc" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Thinking & executing LangGraph workflow...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div style={{
        padding: '16px 24px',
        borderTop: '1px solid var(--border-color)',
        background: 'rgba(14, 18, 26, 0.95)',
        display: 'flex',
        gap: '12px'
      }}>
        <input
          type="text"
          className="input-field"
          placeholder="Ask me anything (e.g., 'How much did I spend this month?' or 'Why can a transfer fail?')..."
          value={inputMessage}
          onChange={e => setInputMessage(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          disabled={isProcessing}
        />
        <button
          onClick={() => handleSend()}
          disabled={isProcessing || !inputMessage.trim()}
          className="btn-primary"
          style={{ padding: '0 20px', flexShrink: 0 }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
