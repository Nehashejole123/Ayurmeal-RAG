import React, { useState, useEffect, useRef } from 'react';
import './VoiceOverlay.css';
import CloseButton from '../CloseButton/CloseButton';
import PulseSphere from '../../animations/PulseSphere/PulseSphere';
import VoiceHeader from '../VoiceHeader/VoiceHeader';
import ControlToggle from '../ControlToggle/ControlToggle';

const VoiceOverlay = ({ onClose, onConversationUpdate, sessionId }) => {
  const [transcript, setTranscript] = useState(""); 
  const [aiState, setAiState] = useState("initializing..."); 
  const [isConversationActive, setIsConversationActive] = useState(true);
  
  const audioRef = useRef(new Audio());
  const isActiveRef = useRef(true); 
  const recognitionRef = useRef(null);
  
  const isProcessingRef = useRef(false); 
  
  // 🔥 NEW: The Silence Timer!
  const silenceTimerRef = useRef(null); 

  // --- 1. SETUP BROWSER EARS ---
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      
      // 🔥 FIX: Keep listening continuously and show interim results
      recognition.continuous = true; 
      recognition.interimResults = true; 
      recognition.lang = 'en-IN'; 
      
      recognition.onresult = (event) => {
        if (!isActiveRef.current || isProcessingRef.current) return;
        
        // Combine all the words heard so far
        let currentTranscript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
          
        // Show the words on the screen as the user speaks
        setTranscript(currentTranscript);

        // Clear the previous timer every time a new word is spoken
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        // Set a new timer. If the user is silent for 1.5 seconds, process the question!
        silenceTimerRef.current = setTimeout(async () => {
          isProcessingRef.current = true; // Lock the microphone
          recognition.stop(); // Turn off the ears
          await processAudio(currentTranscript); // Send to backend
        }, 1500); // <-- 1500 milliseconds (1.5 seconds) of silence
      };

      recognition.onerror = (event) => {
        if (event.error === 'no-speech' && isActiveRef.current && !isProcessingRef.current) {
          setTimeout(startConversationCycle, 1000); 
        }
      };
      
      recognitionRef.current = recognition;
    }
  }, []);

  // --- 2. THE INSTANT GREETING ---
  useEffect(() => {
    isActiveRef.current = true;
    setIsConversationActive(true);
    isProcessingRef.current = true; 
    
    const playGreeting = async () => {
      setAiState("saying hello...");
      try {
        const response = await fetch("http://127.0.0.1:8000/voice-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            query: "SYSTEM_GREETING: Hey, how can I help you?", 
            chat_history: [], 
            user_profile: "General" 
          }),
        });
        
        const data = await response.json();
        audioRef.current.src = "data:audio/mp3;base64," + data.audio_base64;
        
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            audioRef.current.onended = () => startConversationCycle();
          }).catch((error) => {
            console.warn("Autoplay blocked! Skipping audio greeting.");
            startConversationCycle();
          });
        }
      } catch (e) {
        startConversationCycle();
      }
    };

    playGreeting();

    return () => {
      isActiveRef.current = false;
      audioRef.current.pause();
      if (recognitionRef.current) recognitionRef.current.abort();
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, []);

  // --- 3. THE LISTENING CYCLE ---
  const startConversationCycle = () => {
    if (!isActiveRef.current) return;
    setAiState("listening...");
    setTranscript(""); 
    isProcessingRef.current = false; 
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) { }
    } else {
      setTranscript("Microphone not supported.");
    }
  };

  // --- 4. PROCESS THE REAL QUESTION ---
  const processAudio = async (userText) => {
    if (!isActiveRef.current || !userText.trim()) return;
    
    setTranscript(userText); 
    setAiState("thinking..."); 

    try {
      const chatResponse = await fetch("http://127.0.0.1:8000/voice-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            query: userText, 
            chat_history: [], 
            user_profile: "General" 
        }),
      });
      
      const chatData = await chatResponse.json();
      if (!isActiveRef.current) return;

      setAiState("speaking...");

      if (onConversationUpdate) {
         onConversationUpdate(userText, chatData.text);
      }

      if (chatData.audio_base64) {
        audioRef.current.src = "data:audio/mp3;base64," + chatData.audio_base64;
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(e => console.warn("Audio playback blocked", e));
        }
        
        audioRef.current.onended = () => {
           onClose(); 
        };
      } else {
        onClose();
      }

    } catch (error) {
      setTranscript("Connection Error.");
      setTimeout(onClose, 2000);
    }
  };

  return (
    <div className="voice-overlay-container relative w-full h-full">
      <div className="absolute top-8 left-0 w-full flex justify-center z-50">
        <VoiceHeader />
      </div>
      <CloseButton onClose={onClose} />
      
      <div className="flex flex-col items-center justify-center pb-10 w-full h-full">
        <PulseSphere state={aiState} />
        <h2 className="text-white/40 text-[20px] font-light tracking-[0.3em] animate-pulse mt-[-10px] mb-12 uppercase">
          {aiState === "idle" ? "PAUSED" : aiState}
        </h2>
        <div className="h-16 w-full max-w-3xl flex items-start justify-center px-6">
          <div 
            key={transcript}
            className="text-cyan-400 text-[28px] font-light tracking-wide text-center drop-shadow-[0_0_15px_rgba(34,211,238,0.3)] animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            {transcript}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceOverlay;