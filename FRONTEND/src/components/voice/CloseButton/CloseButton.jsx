import React from 'react';
import { X } from 'lucide-react'; // Using Lucide icon for consistency
import './CloseButton.css';

const CloseButton = ({ onClose }) => {
  return (
    <button 
      className="voice-close-btn group" 
      onClick={onClose}
      title="Exit Voice Mode"
    >
      <X size={20} />
    </button>
  );
};

export default CloseButton;