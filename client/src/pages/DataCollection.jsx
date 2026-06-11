import React, { useState } from 'react';
import '../styles/DataCollection.css';

export default function DataCollection({ userId, setIsDeceased }) {
  const [activeTab, setActiveTab] = useState('patterns');
  const [pattern, setPattern] = useState({ activityType: '', description: '', mood: 'happy' });
  const [memory, setMemory] = useState({ title: '', content: '', category: 'general' });
  const [trait, setTrait] = useState({ trait: '', value: '' });
  const [saved, setSaved] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);
  const [showShare, setShowShare] = useState(false);
  const [shareCode, setShareCode] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [newMember, setNewMember] = useState({ email: '', name: '' });
  const mediaRecorderRef = React.useRef(null);
  const audioChunksRef = React.useRef([]);

  const handleSavePattern = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/patterns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...pattern }),
      });
      setSaved('Daily habit saved!');
      setPattern({ activityType: '', description: '', mood: 'happy' });
      setTimeout(() => setSaved(''), 3000);
    } catch (err) {
      alert('Error saving pattern');
    }
  };

  const handleSaveMemory = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...memory }),
      });
      setSaved('Memory saved! 📖');
      setMemory({ title: '', content: '', category: 'general' });
      setTimeout(() => setSaved(''), 3000);
    } catch (err) {
      alert('Error saving memory');
    }
  };

  const handleSaveTrait = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/traits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...trait }),
      });
      setSaved('Personality trait added! 🎭');
      setTrait({ trait: '', value: '' });
      setTimeout(() => setSaved(''), 3000);
    } catch (err) {
      alert('Error saving trait');
    }
  };

  const handleActivateMemorial = async () => {
    if (window.confirm('This marks the end of data collection. Are you sure?')) {
      try {
        await fetch(`/api/users/${userId}/deceased`, { method: 'PUT' });
        localStorage.setItem('isDeceased', 'true');
        setIsDeceased(true);
      } catch (err) {
        alert('Error activating memorial');
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('file', audioBlob, 'voice-message.webm');
        formData.append('userId', userId);
        formData.append('type', 'voice');
        formData.append('caption', 'Voice message');
        
        try {
          const res = await fetch('/api/media', { method: 'POST', body: formData });
          const data = await res.json();
          setSaved('Voice message saved! 🎤');
          setTimeout(() => setSaved(''), 3000);
        } catch (err) {
          alert('Error saving recording');
        }
        
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    formData.append('type', 'photo');
    formData.append('caption', 'Memory photo');
    
    try {
      const res = await fetch('/api/media', { method: 'POST', body: formData });
      setSaved('Photo saved! 📸');
      setTimeout(() => setSaved(''), 3000);
    } catch (err) {
      alert('Error uploading photo');
    }
  };

  const handleAddFamilyMember = async (e) => {
    e.preventDefault();
    if (!newMember.email || !newMember.name) return;
    
    try {
      const res = await fetch('/api/family', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, memberEmail: newMember.email, memberName: newMember.name }),
      });
      const data = await res.json();
      setShareCode(data.accessCode);
      setNewMember({ email: '', name: '' });
      setSaved(`Access code: ${data.accessCode} - Share this with family! 👨‍👩‍👧`);
      setTimeout(() => setSaved(''), 5000);
    } catch (err) {
      alert('Error adding family member');
    }
  };

  return (
    <main className="data-collection">
      <h2>📝 Build Your Digital Self</h2>
      <p className="subtitle">Collect your patterns, memories, and personality</p>

      {saved && <div className="success-message">{saved}</div>}

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'patterns' ? 'active' : ''}`}
          onClick={() => setActiveTab('patterns')}
        >
          Daily Habits
        </button>
        <button
          className={`tab ${activeTab === 'memories' ? 'active' : ''}`}
          onClick={() => setActiveTab('memories')}
        >
          Memories
        </button>
        <button
          className={`tab ${activeTab === 'traits' ? 'active' : ''}`}
          onClick={() => setActiveTab('traits')}
        >
          Personality
        </button>
        <button
          className={`tab ${activeTab === 'media' ? 'active' : ''}`}
          onClick={() => setActiveTab('media')}
        >
          Media
        </button>
        <button
          className={`tab ${activeTab === 'share' ? 'active' : ''}`}
          onClick={() => setActiveTab('share')}
        >
          Share
        </button>
      </div>

      {activeTab === 'patterns' && (
        <div className="form-section">
          <h3>📅 Log Your Daily Habits</h3>
          <form onSubmit={handleSavePattern}>
            <input
              type="text"
              placeholder="Activity (e.g., morning jog, coffee break)"
              value={pattern.activityType}
              onChange={(e) => setPattern({ ...pattern, activityType: e.target.value })}
              required
            />
            <textarea
              placeholder="Details about this activity..."
              value={pattern.description}
              onChange={(e) => setPattern({ ...pattern, description: e.target.value })}
            />
            <select
              value={pattern.mood}
              onChange={(e) => setPattern({ ...pattern, mood: e.target.value })}
            >
              <option value="happy">😊 Happy</option>
              <option value="calm">😌 Calm</option>
              <option value="stressed">😰 Stressed</option>
              <option value="excited">🤩 Excited</option>
              <option value="thoughtful">🤔 Thoughtful</option>
            </select>
            <button type="submit">Save Habit</button>
          </form>
        </div>
      )}

      {activeTab === 'memories' && (
        <div className="form-section">
          <h3>💭 Save a Memory</h3>
          <form onSubmit={handleSaveMemory}>
            <input
              type="text"
              placeholder="Memory title"
              value={memory.title}
              onChange={(e) => setMemory({ ...memory, title: e.target.value })}
              required
            />
            <textarea
              placeholder="Tell the story... what happened? Who was there? How did it make you feel?"
              rows="6"
              value={memory.content}
              onChange={(e) => setMemory({ ...memory, content: e.target.value })}
              required
            />
            <select
              value={memory.category}
              onChange={(e) => setMemory({ ...memory, category: e.target.value })}
            >
              <option value="general">General</option>
              <option value="family">Family</option>
              <option value="achievement">Achievement</option>
              <option value="lesson">Life Lesson</option>
              <option value="love">Love</option>
            </select>
            <button type="submit">Save Memory</button>
          </form>
        </div>
      )}

      {activeTab === 'traits' && (
        <div className="form-section">
          <h3>🎭 Your Personality</h3>
          <form onSubmit={handleSaveTrait}>
            <input
              type="text"
              placeholder="Trait (e.g., humor style, values, interests)"
              value={trait.trait}
              onChange={(e) => setTrait({ ...trait, trait: e.target.value })}
              required
            />
            <textarea
              placeholder="Describe this trait about yourself..."
              rows="4"
              value={trait.value}
              onChange={(e) => setTrait({ ...trait, value: e.target.value })}
              required
            />
            <button type="submit">Add Trait</button>
          </form>
        </div>
      )}

      {activeTab === 'media' && (
        <div className="form-section">
          <h3>📸 Voice & Photos</h3>
          
          <div className="media-section">
            <h4>🎤 Record Voice Message</h4>
            <div className="recording-controls">
              {!isRecording ? (
                <button className="record-btn" onClick={startRecording}>
                  🎙️ Start Recording
                </button>
              ) : (
                <button className="record-btn recording" onClick={stopRecording}>
                  ⏹️ Stop Recording
                </button>
              )}
              <p className="hint">Save voice messages for your family to remember your voice</p>
            </div>
          </div>
          
          <div className="media-section">
            <h4>📸 Upload Photos</h4>
            <label className="file-input-label">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
              />
              📷 Choose Photo
            </label>
            <p className="hint">Add visual memories to your legacy</p>
          </div>
        </div>
      )}

      {activeTab === 'share' && (
        <div className="form-section">
          <h3>👨‍👩‍👧 Share with Family</h3>
          <form onSubmit={handleAddFamilyMember} className="share-form">
            <input
              type="text"
              placeholder="Family member name"
              value={newMember.name}
              onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Family member email"
              value={newMember.email}
              onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
              required
            />
            <button type="submit">Generate Access Code</button>
          </form>
          
          {shareCode && (
            <div className="share-code-box">
              <p>✅ Access code created!</p>
              <div className="code-display">{shareCode}</div>
              <p className="hint">Share this code with {newMember.name} to grant access to your digital memorial</p>
            </div>
          )}
        </div>
      )}

      <div className="memorial-section">
        <h3>🕯️ When Ready...</h3>
        <p>Once you've collected enough data, you can activate your digital memorial.</p>
        <button className="memorial-btn" onClick={handleActivateMemorial}>
          Activate Digital Memorial
        </button>
      </div>
    </main>
  );
}
