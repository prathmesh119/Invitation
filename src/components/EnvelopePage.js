import React from 'react';

const EnvelopePage = ({ 
  particles, 
  celebrationEmojis, 
  onEnvelopeClick 
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

      <div className="envelope-container">
        <div className="envelope" onClick={onEnvelopeClick}>
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
    </div>
  );
};

export default EnvelopePage;
