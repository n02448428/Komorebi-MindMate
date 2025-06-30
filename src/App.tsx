import React, { useState } from 'react';

function App() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([
    { role: 'assistant', content: 'Hello! How can I help you today?' }
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim() || loading) return;
    
    const userMessage = { role: 'user', content: message };
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setLoading(true);

    try {
      // Simple fallback response for now
      setTimeout(() => {
        const responses = [
          "That's interesting. Tell me more about that.",
          "I understand. How do you feel about that?",
          "Thank you for sharing. What would you like to explore next?"
        ];
        const aiResponse = { 
          role: 'assistant', 
          content: responses[Math.floor(Math.random() * responses.length)] 
        };
        setMessages(prev => [...prev, aiResponse]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(to bottom right, #e0f2fe, #f3e5f5)',
      padding: '20px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '30px' }}>
          Komorebi MindMate
        </h1>
        
        <div style={{ 
          backgroundColor: 'rgba(255,255,255,0.8)', 
          borderRadius: '20px', 
          padding: '20px',
          minHeight: '400px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ flex: 1, marginBottom: '20px' }}>
            {messages.map((msg, index) => (
              <div key={index} style={{ 
                marginBottom: '15px',
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  maxWidth: '70%',
                  padding: '12px 16px',
                  borderRadius: '18px',
                  backgroundColor: msg.role === 'user' ? '#007bff' : '#f1f3f4',
                  color: msg.role === 'user' ? 'white' : '#333'
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '18px',
                  backgroundColor: '#f1f3f4',
                  color: '#666'
                }}>
                  Thinking...
                </div>
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '25px',
                border: '1px solid #ddd',
                outline: 'none',
                fontSize: '16px'
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !message.trim()}
              style={{
                padding: '12px 24px',
                borderRadius: '25px',
                border: 'none',
                backgroundColor: '#007bff',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;