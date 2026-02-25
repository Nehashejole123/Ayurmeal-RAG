import React from 'react';
import './PulseSphere.css';

const PulseSphere = () => {
  return (
    <div className="sphere-container">
      {/* Ensure you have a 'sphere.gif' in your public folder! */}
      <img 
        src="/sphere.gif" 
        alt="AI Core" 
        className="sphere-gif"
      />
    </div>
  );
};

export default PulseSphere;