import React, { useState, useEffect } from 'react';
import DataCollection from './pages/DataCollection';
import Memorial from './pages/Memorial';
import './App.css';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [userId, setUserId] = useState(localStorage.getItem('userId') || null);
  const [isDeceased, setIsDeceased] = useState(localStorage.getItem('isDeceased') === 'true');

  useEffect(() => {
    if (userId) {
      localStorage.setItem('userId', userId);
    }
  }, [userId]);

  const handleLogout = () => {
    setUserId(null);
    setCurrentPage('home');
    localStorage.removeItem('userId');
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🕯️ Digital Legacy</h1>
        <p>Preserve memories. Connect generations.</p>
        {userId && (
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        )}
      </header>

      {!userId ? (
        <HomePage setUserId={setUserId} setCurrentPage={setCurrentPage} />
      ) : isDeceased ? (
        <Memorial userId={userId} setCurrentPage={setCurrentPage} />
      ) : (
        <DataCollection userId={userId} setCurrentPage={setCurrentPage} setIsDeceased={setIsDeceased} />
      )}
    </div>
  );
}

function HomePage({ setUserId, setCurrentPage }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      setUserId(data.id);
      localStorage.setItem('userId', data.id);
    } catch (err) {
      alert('Error creating profile');
    }
  };

  return (
    <main className="home">
      <section className="intro">
        <h2>Welcome to Your Digital Legacy</h2>
        <p>Capture your life patterns, memories, and personality while you're here.</p>
        <p>Your family will be able to connect with your digital self for generations to come.</p>
      </section>

      <section className="features">
        <div className="feature">
          <h3>📱 Collect</h3>
          <p>Log daily habits, record voice, save memories</p>
        </div>
        <div className="feature">
          <h3>🤖 Personalize</h3>
          <p>AI learns your patterns & personality</p>
        </div>
        <div className="feature">
          <h3>🪦 Remember</h3>
          <p>Family interacts with your digital presence</p>
        </div>
      </section>

      <form onSubmit={handleRegister} className="register-form">
        <h3>Start Your Digital Legacy</h3>
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Begin</button>
      </form>
    </main>
  );
}
