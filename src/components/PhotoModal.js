import React from 'react';

const PhotoModal = ({ 
  collectedPhotos, 
  onPhotoFilesSelected, 
  onClearPhotos, 
  onClose,
  isPhotoAuthenticated,
  photoPasswordAttempt,
  setPhotoPasswordAttempt,
  onPhotoLogin,
  adminPassword
}) => {
  const handlePhotoLogin = (e) => {
    e.preventDefault();
    onPhotoLogin(photoPasswordAttempt, adminPassword);
  };

  return (
    <div className="photo-modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Collect Photos</h3>
        
        {!isPhotoAuthenticated ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p>Password required to upload photos</p>
            <form onSubmit={handlePhotoLogin} style={{ marginTop: '16px' }}>
              <input 
                type="password" 
                value={photoPasswordAttempt}
                onChange={(e) => setPhotoPasswordAttempt(e.target.value)}
                placeholder="Enter password..."
                className="password-input"
                autoFocus
              />
              <button type="submit" className="login-btn" style={{ marginTop: '12px' }}>
                🔓 Unlock
              </button>
            </form>
            <button onClick={onClose} className="back-btn" style={{ marginTop: '12px' }}>
              Close
            </button>
          </div>
        ) : (
          <>
            <p>Select images to add to the collection. They are stored locally in your browser.</p>
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              onChange={(e) => onPhotoFilesSelected(e.target.files)} 
            />

            <div className="photo-grid">
              {collectedPhotos.map((p, idx) => (
                <img key={idx} src={p.data} alt={p.name} title={p.name} />
              ))}
            </div>

            <div className="modal-actions">
              <button onClick={onClose} className="back-btn">Close</button>
              <button onClick={onClearPhotos} className="back-btn">Clear All</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PhotoModal;
