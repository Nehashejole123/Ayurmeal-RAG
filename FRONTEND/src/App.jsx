import { useState, useEffect } from 'react';
import BackgroundVideo from './components/layout/BackgroundVideo';
import ChatInput from './components/chat/ChatInput';
import ChatMessages from './components/chat/ChatMessages';
import Header from './components/layout/Header';
import VoiceOverlay from './components/voice/VoiceOverlay/VoiceOverlay';
import { usePorcupine } from '@picovoice/porcupine-react';

function App() {
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false); 
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [sessionId] = useState(() => "session_" + Math.random().toString(36).substring(7));

  const [messages, setMessages] = useState([
    { role: "ai", content: "Namaste, seeker. I am your Vaidya. How can I guide your Ayurvedic journey today?" }
  ]);

  const {
    keywordDetection,
    isLoaded,
    isListening,
    error,
    init,
    start,
    stop,
  } = usePorcupine();

  useEffect(() => {
    const initEngine = async () => {
      try {
        await init(
          import.meta.env.VITE_PICOVOICE_ACCESS_KEY,
          { publicPath: "/models/hey_karuna.ppn", label: "Hey Karuna" },
          { publicPath: "/models/porcupine_params.pv" }
        );
        console.log("✅ Wake Word Engine Loaded Successfully");
      } catch (err) {
        console.error("❌ Failed to load Wake Word:", err);
      }
    };
    initEngine();
  }, []);

  useEffect(() => {
    if (keywordDetection !== null) {
      console.log("✨ Wake Word Detected: Hey Karuna");
      setIsVoiceMode(true); 
    }
  }, [keywordDetection]);

  useEffect(() => {
    if (!isLoaded) return;
    const manageMic = async () => {
      if (isVoiceMode) {
        if (isListening) { await stop(); }
      } else {
        if (!isListening) {
          try { await start(); } catch (e) { console.error("Wake word failed to start:", e); }
        }
      }
    };
    manageMic();
  }, [isVoiceMode, isLoaded, isListening, start, stop]);

  // REWIRED TO YOUR FASTAPI BACKEND
  const handleSend = async () => {
    if (!userInput.trim()) return;
    
    const currentText = userInput; 
    const userMessage = { role: "user", content: currentText };
    
    // Add user message to screen immediately
    setMessages((prev) => [...prev, userMessage]);
    setUserInput("");
    setIsTyping(true);

    try {
      // 1. Send to YOUR backend envelope
      const response = await fetch("http://127.0.0.1:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query: currentText,
          chat_history: messages, // Send history so the AI remembers!
          user_profile: "General Ayurvedic Patient"
        }),
      });

      if (!response.ok) throw new Error("Backend connection failed");

      // 2. Read the Streaming Response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiFullResponse = "";

      // Add a blank AI message to the screen to hold the incoming text
      setMessages((prev) => [...prev, { role: "ai", content: "" }]);
      setIsTyping(false);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        // Decode the text chunk and append it
        const chunk = decoder.decode(value, { stream: true });
        aiFullResponse += chunk;

        // Dynamically update the very last message on the screen
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = aiFullResponse;
          return newMessages;
        });
      }

    } catch (error) {
      console.error("Chat Error:", error);
      setIsTyping(false);
      setMessages((prev) => [...prev, { role: "ai", content: "I apologize, but I cannot reach the backend right now." }]);
    }
  };

  const handleVoiceConversation = (userTranscript, aiDetailedAnswer) => {
    const userMsg = { role: "user", content: userTranscript };
    const aiMsg = { role: "ai", content: aiDetailedAnswer };
    setMessages((prev) => [...prev, userMsg, aiMsg]);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black text-white flex flex-col items-center">
      <BackgroundVideo src="/main-bg.mp4" />
      <Header />

      {isVoiceMode ? (
        <div className="relative z-50 flex-1 w-full pt-24">
              <VoiceOverlay 
                onClose={() => setIsVoiceMode(false)} 
                onConversationUpdate={handleVoiceConversation}
                sessionId={sessionId}
              />
        </div>
      ) : (
        <>
          <div className="relative z-20 flex-1 w-full flex flex-col items-center justify-start pt-24 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
               <div className="w-64 h-64 rounded-full bg-cyan-500/5 blur-3xl animate-pulse" />
            </div>
            <ChatMessages messages={messages} isTyping={isTyping} />
          </div>

          <div className="relative z-30 w-full flex flex-col items-center p-6 md:p-12 pb-10">
            <ChatInput 
              value={userInput} 
              onChange={setUserInput} 
              onSend={handleSend} 
              onMicClick={() => setIsVoiceMode(true)}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default App;