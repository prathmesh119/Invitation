import { useState, useEffect } from 'react';
import './App.css';
import { database, auth, initializeAuth, guestsRef } from './firebase';
import { ref, push, onValue, remove } from 'firebase/database';

// Import components
import WelcomeCard from './components/WelcomeCard';
import EnvelopePage from './components/EnvelopePage';
import ThankYouPage from './components/ThankYouPage';
import AdminPanel from './components/AdminPanel';
import PhotoModal from './components/PhotoModal';

// Colors for particles
const colors = ['#ff6b6b', '#ffd93d', '#ff006e', '#6bcf7f', '#4d96ff', '#ff9f43', '#a29bfe', '#fd79a8'];

const capitalizeWords = (str) => {
  return str
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

function App() {
  // Form and submission state
  const [guestName, setGuestName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Envelope and animations
  const [envelopeOpened, setEnvelopeOpened] = useState(false);
  const [particles, setParticles] = useState([]);
  const [celebrationEmojis, setCelebrationEmojis] = useState([]);

  // Admin state
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordAttempt, setPasswordAttempt] = useState('');
  const [allNames, setAllNames] = useState([]);

  // Photo state
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [collectedPhotos, setCollectedPhotos] = useState(() => {
    try {
      const raw = localStorage.getItem('collectedPhotos');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  // Particle generation
  const createParticles = () => {
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

  // Celebration emojis
  const createCelebrationEmojis = () => {
    const emojis = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      left: i < 4 ? Math.random() * 20 : 80 + Math.random() * 20,
      delay: Math.random() * 0.3,
      duration: 2 + Math.random() * 1,
      emoji: '🎉',
    }));
    setCelebrationEmojis(emojis);
  };

  // Handle name form submission
  const handleSubmit = (name) => {
    if (name.trim()) {
      const capitalizedName = capitalizeWords(name);
      setGuestName(capitalizedName);
      saveNameToStorage(capitalizedName);
      setSubmitted(true);
      createParticles();
    }
  };

  // Handle envelope click
  const handleEnvelopeClick = () => {
    createCelebrationEmojis();
    setEnvelopeOpened(true);
    createParticles();
  };

  // Handle back to welcome page
  const handleReset = () => {
    setSubmitted(false);
    setEnvelopeOpened(false);
    setParticles([]);
    setCelebrationEmojis([]);
  };

  // Admin handlers
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

  // Photo handlers
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

  // Firebase setup
  const saveNameToStorage = (name) => {
    const newEntry = {
      name,
      timestamp: new Date().toLocaleString()
    };
    push(guestsRef, newEntry);
  };

  // Particle cleanup
  useEffect(() => {
    if (submitted && particles.length > 0) {
      const timer = setTimeout(() => {
        setParticles([]);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [submitted, particles]);

  // Initialize Firebase and load data
  useEffect(() => {
    initializeAuth();

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

    const savedPassword = localStorage.getItem('adminPassword');
    if (savedPassword) {
      setAdminPassword(savedPassword);
    } else {
      setAdminPassword('admin123');
      localStorage.setItem('adminPassword', 'admin123');
    }

    return () => listener();
  }, []);

  return (
    <div className="App">
      {/* Admin Panel */}
      {showAdmin && (
        <AdminPanel
          isAuthenticated={isAuthenticated}
          passwordAttempt={passwordAttempt}
          setPasswordAttempt={setPasswordAttempt}
          allNames={allNames}
          onAdminLogin={handleAdminLogin}
          onDownloadNames={downloadNames}
          onClearNames={clearAllNames}
          onClose={handleCloseAdmin}
        />
      )}

      {/* Photo Modal */}
      {showPhotoModal && (
        <PhotoModal
          collectedPhotos={collectedPhotos}
          onPhotoFilesSelected={handlePhotoFiles}
          onClearPhotos={handleClearPhotos}
          onClose={() => setShowPhotoModal(false)}
        />
      )}

      {/* Welcome Card */}
      {!submitted ? (
        <WelcomeCard
          guestName={guestName}
          setGuestName={setGuestName}
          onSubmit={handleSubmit}
          onAdminClick={() => setShowAdmin(true)}
          onPhotoClick={() => setShowPhotoModal(true)}
        />
      ) : !envelopeOpened ? (
        // Envelope Page
        <EnvelopePage
          particles={particles}
          celebrationEmojis={celebrationEmojis}
          onEnvelopeClick={handleEnvelopeClick}
        />
      ) : (
        // Thank You Page
        <ThankYouPage
          guestName={guestName}
          particles={particles}
          onReset={handleReset}
          onPhotoClick={() => setShowPhotoModal(true)}
        />
      )}
    </div>
  );
}

export default App;
