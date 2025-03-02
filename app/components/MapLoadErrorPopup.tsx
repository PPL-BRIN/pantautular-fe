import React from "react";

interface MapLoadErrorPopupProps {
  message: string;
  onClose: () => void;
}

const MapLoadErrorPopup: React.FC<MapLoadErrorPopupProps> = ({ message, onClose }) => {
  if (!message) {
    return null;
  }
  
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Terjadi Kesalahan</h2>
        <p>{message}</p>
        <button data-testid="close-button" onClick={onClose}>Tutup</button>
      </div>
    </div>
  );
};

export default MapLoadErrorPopup;