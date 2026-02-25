import React from 'react';
import './ControlToggle.css';

const ControlToggle = ({ isActive, onToggle }) => {
  return (
    <button 
      className={`control-toggle ${isActive ? 'stop-mode' : ''}`} 
      onClick={onToggle}
    >
      {isActive ? 'STOP CONVERSATION' : 'START CONVERSATION'}
    </button>
  );
};

export default ControlToggle;