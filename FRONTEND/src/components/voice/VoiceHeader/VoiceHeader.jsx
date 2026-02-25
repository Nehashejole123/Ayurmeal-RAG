import React from 'react';
import './VoiceHeader.css';

const VoiceHeader = () => {
  return (
    <div className="voice-header-card">
      <div className="voice-loader">
        
        {/* Static Text: White */}
        <p>Voice of Ayurveda</p>
        
        {/* Spinning Text: Gradient */}
        <div className="voice-words">
          <span className="voice-word">Ask</span>
          <span className="voice-word">Listen</span>
          <span className="voice-word whitespace-nowrap">Stay Healthy</span>
          
          {/* Clone first word for seamless loop */}
          <span className="voice-word">Ask</span>
        </div>
      </div>
    </div>
  );
};

export default VoiceHeader;