import React from 'react';

const PhotoModal = ({ 
  collectedPhotos, 
  onPhotoFilesSelected, 
  onClearPhotos, 
  onClose 
}) => {
  return (
    <div className="photo-modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Collect Photos</h3>
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
      </div>
    </div>
  );
};

export default PhotoModal;
