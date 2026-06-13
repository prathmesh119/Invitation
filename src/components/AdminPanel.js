import React from 'react';

const AdminPanel = ({ 
  isAuthenticated, 
  passwordAttempt, 
  setPasswordAttempt, 
  allNames, 
  onAdminLogin, 
  onDownloadNames, 
  onClearNames, 
  onClose 
}) => {
  return (
    <div className="admin-panel">
      <div className="admin-content">
        {!isAuthenticated ? (
          <div className="password-login">
            <h2>Admin Access</h2>
            <p className="login-subtitle">Enter password to view guest names</p>
            
            <form onSubmit={onAdminLogin}>
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
            
            <button onClick={onClose} className="close-admin-btn">
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
                  <button onClick={onDownloadNames} className="download-btn">
                    📥 Download as CSV
                  </button>
                  <button onClick={onClearNames} className="clear-btn">
                    🗑️ Clear All
                  </button>
                </div>
              </>
            ) : (
              <p className="no-names">No guest names collected yet</p>
            )}
            
            <button onClick={onClose} className="close-admin-btn">
              ✕ Close
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
