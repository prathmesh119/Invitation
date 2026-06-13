import React from 'react';

const WelcomeCard = ({ 
  guestName, 
  setGuestName, 
  onSubmit, 
  onAdminClick
}) => {
  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit(guestName);
  };

  return (
    <div className="name-input-container">
      <div className="input-card">
        <h1 className="welcome-title">🙏 Welcome 🙏</h1>
        <p className="welcome-subtitle">Please Enter Your Name</p>
        
        <form onSubmit={handleFormSubmit}>
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
          onClick={onAdminClick} 
          className="admin-access-btn"
          title="View collected names"
        >
          👁️
        </button>
      </div>
    </div>
  );
};

export default WelcomeCard;
