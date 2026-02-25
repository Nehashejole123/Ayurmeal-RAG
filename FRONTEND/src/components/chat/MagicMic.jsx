import { Mic } from "lucide-react";

const MagicMic = ({ onClick }) => {
  return (
    /* title="Voice Mode" creates the system tooltip that cannot be cut off */
    /* Added onClick here so the whole area is clickable */
    <div 
      className="relative group flex flex-col items-center" 
      title="Voice Mode" 
      onClick={onClick}
    >
      
      {/* THE BUTTON */}
      <button className="mic-button">
        <div className="inner-overlay" />
        <div className="relative z-10 text-white/70 group-hover:text-cyan-400 transition-colors duration-300">
          <Mic size={20} />
        </div>
      </button>
    </div>
  );
};

export default MagicMic;