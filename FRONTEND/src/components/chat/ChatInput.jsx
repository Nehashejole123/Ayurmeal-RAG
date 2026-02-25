import { WordRotate } from "../magicui/WordRotate";
import { ShineBorder } from "../magicui/ShineBorder";
import MagicMic from "./MagicMic";
import MagicSend from "./MagicSend";

const ChatInput = ({ value, onChange, onSend, onMicClick }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="relative w-full max-w-3xl">
      <ShineBorder 
        shineColor={["#00f2ff", "#0066ff", "#00f2ff"]}
        borderRadius={20} 
        duration={10}
      >
        {/* MAIN GLASS BOX */}
        <div className="relative flex items-center bg-white/10 backdrop-blur-3xl rounded-[20px] p-2 pl-6 shadow-2xl border border-white/20">
          
          <div className="relative flex-1 h-12 flex items-center">
            
            {/* LAYER 1: WordRotate (Placeholder) */}
            {value.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-start pointer-events-none z-0">
                <WordRotate
                  className="text-lg font-light text-white/40 tracking-tight text-left"
                  words={[
                    "Ask about Doshas, Diet, or Herbs...",
                    "How can I balance my Pitta today?",
                    "Suggest a morning Ayurvedic routine...",
                    "Tell me about the benefits of Ashwagandha..."
                  ]}
                />
              </div>
            )}

            {/* LAYER 2: Input */}
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="relative z-10 w-full bg-transparent border-none outline-none text-lg font-light text-white placeholder-transparent"
            />
          </div>

          {/* ACTION BUTTONS - Updated with Magic Components */}
          <div className="flex items-center gap-3 pr-1 relative z-20">
            {/* Added onClick prop here to trigger Voice Mode */}
            <MagicMic onClick={onMicClick} />
            <MagicSend onClick={onSend} />
          </div>
        </div>
      </ShineBorder>
    </div>
  );
};

export default ChatInput;