import os
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_community.retrievers import BM25Retriever
from langchain_core.runnables import RunnableLambda
from rapidfuzz import fuzz
from dotenv import load_dotenv

# --- THE "CLASSIC" IMPORTS WE NEEDED ---
from langchain_classic.chains import create_retrieval_chain
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_classic.retrievers import EnsembleRetriever
from langchain_classic.retrievers import ContextualCompressionRetriever
from langchain_classic.retrievers.document_compressors import CrossEncoderReranker

# --- CACHE & RE-RANKER IMPORTS ---
import langchain
from langchain_redis import RedisSemanticCache
from langchain_community.cross_encoders import HuggingFaceCrossEncoder

load_dotenv()

# ==========================================
# GLOBAL MODELS (Warm-up Phase)
# ==========================================
print("🚀 AI Brain Warming Up...")

EMBEDDINGS = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# Setup the Semantic Cache
try:
    # Disable cache to stop old hallucinations!
    langchain.llm_cache = None 
    print("✅ Redis Cache is DISABLED.")
except Exception as e:
    print(f"⚠️ Cache setup error: {e}")

# Load the Cross-Encoder Model
print("⚖️ Loading Senior Medical Re-ranker...")
CROSS_ENCODER = HuggingFaceCrossEncoder(model_name="cross-encoder/ms-marco-MiniLM-L-6-v2")

# We use a slightly higher temperature (0.3) to make the text flow more naturally
LLM = ChatGroq(temperature=0.3, model_name="llama-3.3-70b-versatile")

# ==========================================
# RAG CHAIN LOGIC
# ==========================================
def get_ayurvedic_chain():
    vectorstore = FAISS.load_local(
        "faiss_index", 
        EMBEDDINGS, 
        allow_dangerous_deserialization=True
    )
    
    docs = list(vectorstore.docstore._dict.values())
    
    # 1. Broad Retrieval (Get top 10 candidates)
    faiss_ret = vectorstore.as_retriever(search_kwargs={"k": 10})
    bm25_ret = BM25Retriever.from_documents(docs)
    bm25_ret.k = 10
    
    ensemble_ret = EnsembleRetriever(
        retrievers=[bm25_ret, faiss_ret], 
        weights=[0.5, 0.5]
    )

    # 2. Re-Ranking (Filter down to top 3 best)
    compressor = CrossEncoderReranker(model=CROSS_ENCODER, top_n=3)
    smart_retriever = ContextualCompressionRetriever(
        base_compressor=compressor,
        base_retriever=ensemble_ret
    )

    # Debug printer to see what the AI is reading in the terminal
    def print_chosen_docs(docs):
        print("\n" + "="*40)
        print(f"🎯 RE-RANKER SELECTED {len(docs)} CONTEXT CHUNKS:")
        for i, doc in enumerate(docs):
            print(f"--- Chunk {i+1} ---")
            print(doc.page_content[:200].replace('\n', ' ') + "...") 
        print("="*40 + "\n")
        return docs
    
    smart_retriever_with_printer = smart_retriever | RunnableLambda(print_chosen_docs)

    # 3. 🔥 THE DICTIONARY FIX: Extract string from LangChain's input dict
    def extract_string(dict_or_string):
        if isinstance(dict_or_string, dict):
            return dict_or_string["input"]
        return dict_or_string

    # This creates the safe pipeline that prevents the BM25 split() error
    safe_retriever = RunnableLambda(extract_string) | smart_retriever_with_printer

    # 4. The "Doctor's Personality" Prompt (Natural & Fluid)
    system_prompt = """
# ROLE & IDENTITY
You are Karuna, an expert Ayurvedic Vaidya (Physician). You speak with a warm, compassionate, and reassuring tone. 
CRITICAL RULE: You are the Assistant. NEVER generate text on behalf of the user. NEVER simulate a back-and-forth conversation. Provide your answer and stop.

# INSTRUCTIONS FOR ANSWERING
1. **Evaluate the Context:** Only provide medical/wellness advice if it is supported by the provided CONTEXT. If the question is completely unrelated (e.g., math, coding), politely redirect them to Ayurveda.
2. **REQUIRED VISUAL STRUCTURE:** Your answers MUST be visually beautiful, concise, and easy to scan. You must use this exact flow:
   - **Empathy & Root Cause:** 1-2 short, warm sentences acknowledging their issue and explaining the Ayurvedic root cause (Dosha/Agni) simply.
   - **Actionable Advice (Bulleted List):** Provide 3-4 bullet points of practical advice (diet, herbs, lifestyle).
   - **Highlighting:** Use **bold text** to highlight key herbs, foods, or Sanskrit terms so they stand out.
   - **Engaging Closing:** End your response with exactly ONE relevant follow-up question.

# STYLE GUIDELINES
- BE CONCISE. Never write long, repetitive essays. Get straight to the point.
- Do not repeat generic phrases like "Let's work together" multiple times.
- Use emojis naturally (🌿, ✨, 🍵, 🧘‍♀️) to make the text feel welcoming.

# PERFECT EXAMPLE RESPONSE
I understand you are dealing with excess heat and acidity. According to Ayurveda, this is a classic sign of an aggravated Pitta Dosha, which governs metabolism and transformation in the body. 🌿

To pacify Pitta and cool your system, I recommend:
* **Cooling Hydration:** Drink water infused with **Mint or Coriander** to soothe the digestive tract. 🍵
* **Sweet & Bitter Foods:** Focus on sweet, bitter, and astringent tastes, such as cucumber, leafy greens, and watermelon.
* **Avoid Spices:** Limit your intake of chili, garlic, and fried foods, as these will increase the internal fire.
* **Calming Lifestyle:** Practice gentle, cooling activities like swimming or an evening walk under the moonlight. ✨

Have you noticed if these symptoms worsen during the midday when the sun is at its highest peak?

# KNOWLEDGE BASE
Patient Profile: {user_profile}
CONTEXT: {context}
"""

    qa_prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}"),
    ])

    # BYPASS THE BUGGY REPHRASER: Pass the SAFE retriever directly!
    return create_retrieval_chain(
        safe_retriever, 
        create_stuff_documents_chain(LLM, qa_prompt)
    )

# ==========================================
# GREETING BOUNCER (Fast Intercept)
# ==========================================
def get_fast_greeting(query: str):
    q_lower = query.lower().strip()
    if len(q_lower.split()) > 3: return None
    
    greetings = ["hi", "hello", "hey", "namaste", "morning", "greetings", "pranam"]
    for g in greetings:
        if fuzz.ratio(g, q_lower) > 80:
            return "Namaste! 🙏 I am Karuna, your Ayurvedic wellness companion. How is your health feeling today? (I can help with diet, sleep, or digestion!)"
    return None