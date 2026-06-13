import { useState, useEffect, useMemo } from 'react';
import './App.css';
import { database, auth, initializeAuth, guestsRef } from './firebase';
import { ref, push, onValue, remove } from 'firebase/database';

// Move colors outside component to avoid recreation on every render
const colors = ['#ff6b6b', '#ffd93d', '#ff006e', '#6bcf7f', '#4d96ff', '#ff9f43', '#a29bfe', '#fd79a8'];

function App() {
  const [guestName, setGuestName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [particles, setParticles] = useState([]);
  const [allNames, setAllNames] = useState([]);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordAttempt, setPasswordAttempt] = useState('');
  const [envelopeOpened, setEnvelopeOpened] = useState(false);
  const [celebrationEmojis, setCelebrationEmojis] = useState([]);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [collectedPhotos, setCollectedPhotos] = useState(() => {
    try {
      const raw = localStorage.getItem('collectedPhotos');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  const handleEnvelopeClick = () => {
    // Open envelope immediately (no animation)
    createCelebrationEmojis();
    setEnvelopeOpened(true);
    createParticles();
  };

  const createCelebrationEmojis = () => {
    // Reduced from 12 to 8 emojis for better performance
    const emojis = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      left: i < 4 ? Math.random() * 20 : 80 + Math.random() * 20,
      delay: Math.random() * 0.3,
      duration: 2 + Math.random() * 1,
      emoji: '🎉',
    }));
    setCelebrationEmojis(emojis);
  };

  const colors = ['#ff6b6b', '#ffd93d', '#ff006e', '#6bcf7f', '#4d96ff', '#ff9f43', '#a29bfe', '#fd79a8'];

  const capitalizeWords = (str) => {
    return str
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (guestName.trim()) {
      const capitalizedName = capitalizeWords(guestName);
      setGuestName(capitalizedName);
      saveNameToStorage(capitalizedName);
      setSubmitted(true);
      createParticles();
    }
  };

  const handleOpenPhotoModal = () => setShowPhotoModal(true);

  const handlePhotoFiles = (files) => {
    const readers = Array.from(files).map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({ name: file.name, data: reader.result, size: file.size });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((imgs) => {
      const merged = [...imgs, ...collectedPhotos];
      setCollectedPhotos(merged);
      try { localStorage.setItem('collectedPhotos', JSON.stringify(merged)); } catch (e) {}
    });
  };

  const handleClearPhotos = () => {
    if (window.confirm('Clear all collected photos?')) {
      setCollectedPhotos([]);
      localStorage.removeItem('collectedPhotos');
    }
  };

  const createParticles = () => {
    // Reduced from 100 to 40 particles for better performance
    const newParticles = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 1.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 8 + Math.random() * 12,
    }));
    setParticles(newParticles);
  };

  useEffect(() => {
    if (submitted && particles.length > 0) {
      const timer = setTimeout(() => {
        setParticles([]);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [submitted, particles]);

  useEffect(() => {
    // Initialize Firebase Auth
    initializeAuth();

    // Load names from Firebase Realtime Database
    const listener = onValue(guestsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const namesList = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        }));
        setAllNames(namesList);
      } else {
        setAllNames([]);
      }
    });

    // Load admin password from localStorage
    const savedPassword = localStorage.getItem('adminPassword');
    if (savedPassword) {
      setAdminPassword(savedPassword);
    } else {
      // Set default password if not exists
      setAdminPassword('admin123');
      localStorage.setItem('adminPassword', 'admin123');
    }

    return () => listener();
  }, []);

  const saveNameToStorage = (name) => {
    const newEntry = {
      name,
      timestamp: new Date().toLocaleString()
    };
    push(guestsRef, newEntry);
  };

  const downloadNames = () => {
    const csvContent = [
      ['Name', 'Date & Time'],
      ...allNames.map(entry => [entry.name, entry.timestamp])
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guest-names-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearAllNames = () => {
    if (window.confirm('Are you sure you want to clear all guest names?')) {
      allNames.forEach(entry => {
        remove(ref(database, `guests/${entry.id}`));
      });
      setAllNames([]);
    }
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (passwordAttempt === adminPassword) {
      setIsAuthenticated(true);
      setPasswordAttempt('');
    } else {
      alert('Incorrect password!');
      setPasswordAttempt('');
    }
  };

  const handleCloseAdmin = () => {
    setShowAdmin(false);
    setIsAuthenticated(false);
    setPasswordAttempt('');
  };

  return (
    <div className="App">
      {showAdmin && (
        <div className="admin-panel">
          <div className="admin-content">
            {!isAuthenticated ? (
              <div className="password-login">
                <h2>Admin Access</h2>
                <p className="login-subtitle">Enter password to view guest names</p>
                
                <form onSubmit={handleAdminLogin}>
                  <input
                    type="password"
                    value={passwordAttempt}
                    onChange={(e) => setPasswordAttempt(e.target.value)}
                    placeholder="Enter password..."
                    className="password-input"
                    autoFocus
                  />
                  <button type="submit" className="login-btn">
                    🔓 Unlock
                  </button>
                </form>
                
                <button onClick={handleCloseAdmin} className="close-admin-btn">
                  ✕ Close
                </button>
              </div>
            ) : (
              <>
                <h2>Guest Names Collected</h2>
                <p className="admin-count">Total: {allNames.length} guests</p>
                
                {allNames.length > 0 ? (
                  <>
                    <div className="names-list">
                      {allNames.map((entry, index) => (
                        <div key={index} className="name-entry">
                          <span className="entry-number">{index + 1}.</span>
                          <span className="entry-name">{entry.name}</span>
                          <span className="entry-time">{entry.timestamp}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="admin-buttons">
                      <button onClick={downloadNames} className="download-btn">
                        📥 Download as CSV
                      </button>
                      <button onClick={clearAllNames} className="clear-btn">
                        🗑️ Clear All
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="no-names">No guest names collected yet</p>
                )}
                
                <button onClick={handleCloseAdmin} className="close-admin-btn">
                  ✕ Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
      
      {!submitted ? (
        <div className="name-input-container">
          <div className="input-card">
            <h1 className="welcome-title">🙏 Welcome 🙏</h1>
            <p className="welcome-subtitle">Please Enter Your Name</p>
            
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Enter your name..."
                className="name-input"
                autoFocus
              />
              <button type="submit" className="submit-btn">
                View Invitation
              </button>
            </form>

            <button 
              onClick={() => setShowAdmin(true)} 
              className="admin-access-btn"
              title="View collected names"
            >
              👁️
            </button>
              <button
                className="collect-photos-btn"
                onClick={handleOpenPhotoModal}
              >
                📸 Collect Photos
              </button>
          </div>
        </div>
      ) : (
        <div className="invitation-container">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="particle"
              style={{
                left: `${particle.left}%`,
                backgroundColor: particle.color,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                animation: `fall ${particle.duration}s linear ${particle.delay}s forwards`,
              }}
            />
          ))}

          {!envelopeOpened ? (
            <>
              <div className="envelope-container">
                <div className="envelope" onClick={handleEnvelopeClick}>
                  <div className="envelope-flap-top"></div>
                  <div className="envelope-flap-bottom"></div>
                  <div className="envelope-body">
                    <div className="envelope-front">
                      <h2 className="envelope-text">You are Invited</h2>
                      <p className="envelope-subtext">Click to open</p>
                    </div>
                  </div>
                </div>
              </div>

              {celebrationEmojis.map((emoji) => (
                <div
                  key={emoji.id}
                  className="celebration-emoji"
                  style={{
                    left: `${emoji.left}%`,
                    animation: `celebrationRise ${emoji.duration}s ease-out ${emoji.delay}s forwards`,
                  }}
                >
                  {emoji.emoji}
                </div>
              ))}
            </>
          ) : (
            <>
              <div className="thankyou-wrapper">
                <div className="thankyou-card">
                  <h1 className="thank-title">🙏 Thank You 🙏</h1>
                  <p className="thank-guest">Dear {guestName || 'Friend'},</p>
                  <p className="thank-message">
                    Thank you for opening this invitation. Your presence and warm wishes mean the world to us.
                    We're excited to share this special moment with you.
                  </p>
                  <div className="thank-actions">
                    <button
                      className="back-btn"
                      onClick={() => {
                        setSubmitted(false);
                        setEnvelopeOpened(false);
                        setParticles([]);
                        setCelebrationEmojis([]);
                      }}
                    >
                      Back
                    </button>
                    <button
                      className="print-btn"
                      onClick={() => window.print()}
                    >
                      🖨️ Print Note
                    </button>
                    <button className="collect-photos-btn" onClick={handleOpenPhotoModal}>📸 Collect Photos</button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {showPhotoModal && (
        <div className="photo-modal" onClick={() => setShowPhotoModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Collect Photos</h3>
            <p>Select images to add to the collection. They are stored locally in your browser.</p>
            <input type="file" accept="image/*" multiple onChange={(e) => handlePhotoFiles(e.target.files)} />

            <div className="photo-grid">
              {collectedPhotos.map((p, idx) => (
                <img key={idx} src={p.data} alt={p.name} title={p.name} />
              ))}
            </div>

            <div className="modal-actions">
              <button onClick={() => setShowPhotoModal(false)} className="back-btn">Close</button>
              <button onClick={handleClearPhotos} className="back-btn">Clear All</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
