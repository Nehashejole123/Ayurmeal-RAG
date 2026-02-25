import streamlit as st
import requests
from st_copy_to_clipboard import st_copy_to_clipboard # --- NEW IMPORT ---

BACKEND_URL = "http://127.0.0.1:8000/ask"

st.set_page_config(page_title="AyurMeal Assistant", page_icon="🌿")

# --- CUSTOM CSS ---
st.markdown("""
<style>
    /* Keep the action bar tight */
    [data-testid="column"] {
        min-width: 45px !important;
        width: 45px !important;
        flex: none !important;
    }
    .stButton button {
        color: #808080 !important;
    }
    .stButton button:hover {
        color: #ffffff !important;
    }
</style>
""", unsafe_allow_html=True)

st.title("🌿 AyurMeal: Ayurvedic Diet Assistant")

if "messages" not in st.session_state:
    st.session_state.messages = []

# --- 1. DRAW EXISTING CHAT HISTORY ---
for i, message in enumerate(st.session_state.messages):
    with st.chat_message(message["role"]):
        st.markdown(message["content"])
        
        # Action Bar
        if message["role"] == "assistant":
            # Slightly widened the 3rd column to fit the new plugin comfortably
            col1, col2, col3, _ = st.columns([1, 1, 1.5, 9.5])
            
            with col1:
                if st.button("👍", key=f"up_{i}", type="tertiary", help="Good response"):
                    st.toast("Thank you for the feedback!")
            with col2:
                if st.button("👎", key=f"down_{i}", type="tertiary", help="Bad response"):
                    st.toast("We will improve this!")
            with col3:
                # --- NEW: TRUE COPY BUTTON ---
                # This uses the plugin to securely write to the user's clipboard
                st_copy_to_clipboard(
                    message["content"], 
                    before_copy_label="📋", 
                    after_copy_label="✅"
                )

# --- 2. CAPTURE USER INPUT ---
if prompt := st.chat_input("Ask about Ayurvedic diet plans..."):
    st.session_state.messages.append({"role": "user", "content": prompt})
    st.rerun()

# --- 3. GENERATE NEW AI RESPONSE ---
if st.session_state.messages and st.session_state.messages[-1]["role"] == "user":
    with st.chat_message("assistant"):
        message_placeholder = st.empty()
        full_response = ""
        
        try:
            clean_history = [{"role": m["role"], "content": m["content"]} for m in st.session_state.messages[:-1]]
            
            with requests.post(BACKEND_URL, json={
                "query": st.session_state.messages[-1]["content"],
                "chat_history": clean_history,
                "user_profile": "General Ayurvedic Balance" 
            }, stream=True) as r:
                r.raise_for_status()
                
                for chunk in r.iter_content(chunk_size=1, decode_unicode=True):
                    if chunk:
                        full_response += chunk
                        message_placeholder.markdown(full_response + "▌")
                
                message_placeholder.markdown(full_response)

            st.session_state.messages.append({"role": "assistant", "content": full_response})
            st.rerun()
            
        except Exception as e:
            st.error(f"Error: {e}")