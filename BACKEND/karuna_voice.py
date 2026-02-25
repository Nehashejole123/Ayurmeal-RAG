import speech_recognition as sr
import edge_tts
import asyncio
import pygame
import os
import re
from rag_engine import get_ayurvedic_chain

# ==========================================
# 1. THE TEXT CLEANER (Formatting for Voice)
# ==========================================
def clean_text_for_voice(text):
    """
    Strips Markdown, emojis, and symbols so the TTS doesn't read 
    punctuation marks out loud (like saying "asterisk asterisk").
    """
    # Remove markdown bold/italic asterisks and hash tags
    text = text.replace('*', '').replace('#', '').replace('_', '')
    
    # Replace bullet-point dashes with a comma for a natural speaking pause
    text = text.replace('- ', ', ')
    
    # Remove emojis (encode to ascii and ignore errors, then decode back)
    text = text.encode('ascii', 'ignore').decode('ascii')
    
    # Clean up extra spaces
    text = " ".join(text.split())
    return text

# ==========================================
# 2. THE MOUTH (Text-to-Speech Engine)
# ==========================================
async def speak_async(text):
    print(f"\n🗣️ Karuna: {text}")
    
    # en-IN-NeerjaNeural is a premium, natural Indian female voice
    # We slow the rate down by 5% (-5%) for a calmer, more medical tone
    communicate = edge_tts.Communicate(text, voice="en-IN-NeerjaNeural", rate="-5%")
    
    audio_file = "karuna_temp.mp3"
    await communicate.save(audio_file)
    
    # Play the audio file
    pygame.mixer.init()
    pygame.mixer.music.load(audio_file)
    pygame.mixer.music.play()
    
    # Keep the script paused while the audio is playing
    while pygame.mixer.music.get_busy():
        pygame.time.Clock().tick(10)
        
    # Clean up
    pygame.mixer.quit()
    try:
        os.remove(audio_file)
    except OSError:
        pass

def speak(text):
    """Helper function to run the async TTS in our synchronous loop."""
    asyncio.run(speak_async(text))

# ==========================================
# 3. THE BRAIN (Connecting to RAG Engine)
# ==========================================
def get_karuna_answer(question):
    print("\n🧠 Karuna is consulting the ancient texts...")
    chain = get_ayurvedic_chain()
    
    # We invoke the chain just like in your API endpoint
    response = chain.invoke({
        "input": question,
        "chat_history": [],
        "user_profile": "A patient seeking Ayurvedic guidance."
    })
    return response["answer"]

# ==========================================
# 4. THE EARS & MAIN LOOP (Speech-to-Text)
# ==========================================
def run_voice_assistant():
    recognizer = sr.Recognizer()
    mic = sr.Microphone()

    # Calibrate background noise
    with mic as source:
        print("🎛️ Adjusting to background noise... Please remain quiet for 2 seconds.")
        recognizer.adjust_for_ambient_noise(source, duration=2)
        # Increase threshold slightly so keyboard typing doesn't trigger it
        recognizer.energy_threshold += 150 

    # Initial Greeting
    speak("Namaste. I am Karuna. Just say 'Hey Karuna' whenever you need me.")

    while True:
        try:
            # Step A: Listen for the Wake Word (Increased timeout so you aren't rushed)
            with mic as source:
                print("\n💤 Listening for wake word ('Hey Karuna')...")
                audio = recognizer.listen(source, timeout=5, phrase_time_limit=5)
            
            # Step B: Check what Google heard
            wake_word_check = recognizer.recognize_google(audio).lower()
            
            # THE MIND-READER: This prints exactly what the AI thinks you said!
            print(f"   [Debug] I heard: '{wake_word_check}'") 
            
            # Step C: Widen the net! Catch common Google STT misspellings
            trigger_words = ["karuna", "corona", "karina", "coruna", "hey assistant"]
            
            if any(trigger in wake_word_check for trigger in trigger_words):
                speak("Yes? How can I help you today?")
                
                # Listen for the actual question
                with mic as source:
                    print("🎙️ Karuna is listening to your question...")
                    audio_question = recognizer.listen(source, timeout=8, phrase_time_limit=15)
                
                question_text = recognizer.recognize_google(audio_question)
                print(f"👤 You asked: {question_text}")
                
                # Process through the Brain
                raw_answer = get_karuna_answer(question_text)
                clean_answer = clean_text_for_voice(raw_answer)
                speak(clean_answer)

        except sr.WaitTimeoutError:
            # Nobody spoke loud enough
            continue
        except sr.UnknownValueError:
            # Heard a noise, but couldn't make out any words
            print("   [Debug] I heard a noise, but no clear words.")
            continue
        except KeyboardInterrupt:
            print("\n🛑 Shutting down Karuna Voice Assistant.")
            break
        except Exception as e:
            print(f"⚠️ Microphone error: {e}")
            continue

if __name__ == "__main__":
    run_voice_assistant()