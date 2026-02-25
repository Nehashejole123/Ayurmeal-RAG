import os
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from dotenv import load_dotenv

load_dotenv()

def run_extraction():
    print("🌿 Starting Ayurvedic Data Extraction...")
    
    # 1. Load PDFs
    if not os.path.exists("data_pdfs"):
        print("❌ Error: 'data_pdfs' folder not found!")
        return
        
    loader = PyPDFDirectoryLoader("data_pdfs/")
    raw_documents = loader.load()
    print(f"📄 Loaded {len(raw_documents)} pages from PDFs.")

    # 2. Futuristic Chunking Strategy
    # We use overlapping chunks to ensure Ayurvedic concepts aren't cut in half
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000, 
        chunk_overlap=200,
        length_function=len,
        separators=["\n\n", "\n", " ", ""]
    )
    chunks = text_splitter.split_documents(raw_documents)
    print(f"✂️ Split documents into {len(chunks)} overlapping chunks.")

    # 3. Create Embeddings & FAISS Index
    print("🧠 Generating local embeddings (this may take a minute)...")
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    
    vectorstore = FAISS.from_documents(chunks, embeddings)
    
    # 4. Save to disk
    vectorstore.save_local("faiss_index")
    print("✅ Extraction Complete! 'faiss_index' is ready for use.")

if __name__ == "__main__":
    run_extraction()