import React from 'react';

const ThankYouPage = ({ 
  guestName, 
  particles,
  onReset, 
  onPhotoClick 
}) => {
  return (
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
              onClick={onReset}
            >
              Back
            </button>
            <button
              className="print-btn"
              onClick={() => window.print()}
            >
              🖨️ Print Note
            </button>
            <button className="collect-photos-btn" onClick={onPhotoClick}>
              📸 Collect Photos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;
