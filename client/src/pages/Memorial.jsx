import React, { useState, useEffect } from 'react';
import '../styles/Memorial.css';

export default function Memorial({ userId }) {
  const [memories, setMemories] = useState([]);
  const [traits, setTraits] = useState([]);
  const [media, setMedia] = useState([]);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMemorials();
  }, [userId]);

  const loadMemorials = async () => {
    try {
      const [memRes, traitRes, mediaRes] = await Promise.all([
        fetch(`/api/memories/${userId}`),
        fetch(`/api/traits/${userId}`),
        fetch(`/api/media/user/${userId}`),
      ]);
      const mems = await memRes.json();
      const traits = await traitRes.json();
      const mediaFiles = await mediaRes.json();
      setMemories(mems);
      setTraits(traits);
      setMedia(mediaFiles);
      setLoading(false);
    } catch (err) {
      console.error('Error loading memorials', err);
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    setChatHistory([...chatHistory, { type: 'user', text: chatMessage }]);
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, message: chatMessage }),
      });
      const data = await res.json();
      setChatHistory((prev) => [...prev, { type: 'ai', text: data.response }]);
    } catch (err) {
      setChatHistory((prev) => [...prev, { type: 'ai', text: 'I remember you...' }]);
    }
    
    setChatMessage('');
  };

  if (loading) return <div className="loading">Loading digital legacy...</div>;

  return (
    <main className="memorial">
      <section className="memorial-header">
        <h2>🕯️ Digital Memorial</h2>
        <p>Connecting with memories across time</p>
      </section>

      <div className="memorial-grid">
        {/* Chat Section */}
        <section className="chat-section">
          <h3>💬 Speak With Them</h3>
          <div className="chat-box">
            <div className="chat-history">
              {chatHistory.length === 0 && (
                <div className="welcome-message">
                  <p>Say hello... they're listening.</p>
                </div>
              )}
              {chatHistory.map((msg, i) => (
                <div key={i} className={`message ${msg.type}`}>
                  <p>{msg.text}</p>
                </div>
              ))}
            </div>
          </div>
          <form onSubmit={handleSendMessage} className="chat-form">
            <input
              type="text"
              placeholder="Share a memory, ask a question..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
            />
            <button type="submit">Send</button>
          </form>
        </section>

        {/* Memories Section */}
        <section className="memories-section">
          <h3>📖 Their Memories ({memories.length})</h3>
          <div className="memories-list">
            {memories.map((mem) => (
              <div key={mem.id} className="memory-card">
                <h4>{mem.title}</h4>
                <p className="category">{mem.category}</p>
                <p>{mem.content}</p>
                <small>{new Date(mem.timestamp).toLocaleDateString()}</small>
              </div>
            ))}
          </div>
        </section>

        {/* Media Section */}
        {media.length > 0 && (
          <section className="media-section">
            <h3>📸 Voice & Photos</h3>
            <div className="media-gallery">
              {media.map((item) => (
                <div key={item.id} className="media-item">
                  {item.type === 'photo' ? (
                    <img src={item.filepath} alt={item.caption} />
                  ) : (
                    <div className="audio-player">
                      <audio controls>
                        <source src={item.filepath} type="audio/webm" />
                      </audio>
                    </div>
                  )}
                  {item.caption && <p>{item.caption}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Personality Section */}
        <section className="traits-section">
          <h3>🎭 Who They Were</h3>
          <div className="traits-list">
            {traits.length === 0 ? (
              <p className="no-traits">Memories of their personality...</p>
            ) : (
              traits.map((trait, i) => (
                <div key={i} className="trait-card">
                  <h5>{trait.trait}</h5>
                  <p>{trait.value}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="legacy-note">
        <p>
          💝 This digital presence was created by them, preserved for you.
          Each conversation keeps their memory alive.
        </p>
      </section>
    </main>
  );
}
