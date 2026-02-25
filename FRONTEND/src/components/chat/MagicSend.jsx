import { Send } from "lucide-react";

const MagicSend = ({ onClick }) => {
  return (
    /* title="Send Message" creates the system tooltip */
    <div className="relative group flex flex-col items-center" title="Send Message">
      
      {/* THE BUTTON */}
      <button className="send-button" onClick={onClick}>
        <div className="relative z-10 text-cyan-400 group-hover:text-cyan-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300">
           <Send size={20} className="fill-cyan-500/20" />
        </div>
      </button>
    </div>
  );
};

export default MagicSend;