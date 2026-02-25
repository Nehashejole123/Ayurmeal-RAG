import { useState, useEffect } from 'react';
import { usePorcupine } from '@picovoice/porcupine-react';

export default function TestWakeWord() {
  const [status, setStatus] = useState("Initializing...");
  const [keywordDetected, setKeywordDetected] = useState(false);

  const {
    keywordDetection,
    isLoaded,
    isListening,
    error,
    init,  // We use the manual 'init' function
    start,
  } = usePorcupine();

  useEffect(() => {
    // 1. Define the Keyword (Your custom file)
    const porcupineKeyword = {
      publicPath: "/models/hey_karuna.ppn",
      label: "Hey Karuna" 
    };
    
    // 2. Define the Model (The file you just downloaded)
    const porcupineModel = {
      publicPath: "/models/porcupine_params.pv" 
    };

    async function startEngine() {
      try {
        // 3. Manually Initialize with BOTH files
        await init(
          import.meta.env.VITE_PICOVOICE_ACCESS_KEY,
          porcupineKeyword,
          porcupineModel
        );
        setStatus("✅ Engine Ready. Waiting to Start...");
      } catch (err) {
        setStatus("❌ Failed to Init: " + err.message);
        console.error(err);
      }
    }

    startEngine();
  }, []);

  // 4. Auto-start listening when loaded
  useEffect(() => {
    if (isLoaded && !isListening) {
      start();
      setStatus("👂 Listening... Say 'Hey Karuna'");
    }
  }, [isLoaded, isListening, start]);

  // 5. Handle Detection
  useEffect(() => {
    if (keywordDetection !== null) {
      console.log("✨ Wake Word Detected!");
      setKeywordDetected(true);
      setTimeout(() => setKeywordDetected(false), 1000);
    }
  }, [keywordDetection]);

  if (error) return <div style={{color:'red', padding: 20}}><h2>Error</h2>{error.message}</div>;

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: keywordDetected ? '#00ff00' : '#222', 
      color: 'white',
      flexDirection: 'column'
    }}>
      <h1>Porcupine Final Test</h1>
      <h2>{status}</h2>
      <p style={{marginTop: 20, color: '#888'}}>
        Files required in /public/models/: <br/>
        1. hey_karuna.ppn <br/>
        2. porcupine_params.pv
      </p>
    </div>
  );
}