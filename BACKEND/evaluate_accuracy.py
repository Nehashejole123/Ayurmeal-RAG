import os
from rag_engine import get_ayurvedic_chain
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from dotenv import load_dotenv

load_dotenv()

# 1. The Questions we want to test
TEST_QUESTIONS = [
    "What are the primary functions of Pitta dosha?",
    "How does Ashwagandha help with stress?",
    "Describe the process of Virechana."
]

def run_evaluation():
    print("🌿 Starting AyurMeal Accuracy Evaluation...\n")
    
    # Load your actual RAG pipeline
    rag_chain = get_ayurvedic_chain()
    
    # Create the strict "Judge" AI
    judge_llm = ChatGroq(temperature=0.0, model_name="llama-3.3-70b-versatile")
    
    # The Rubric the Judge will use
    eval_prompt = PromptTemplate.from_template(
        """You are a strict grading evaluator. 
        Look at the CONTEXT (from a PDF) and the AI's ANSWER.
        Is the ANSWER strictly based on the CONTEXT without making up outside facts?
        
        CONTEXT: {context}
        
        ANSWER: {answer}
        
        Score the faithfulness from 0 to 100. 
        Return ONLY the number (e.g., 100, 50, 0). Do not write any other words."""
    )
    
    judge_chain = eval_prompt | judge_llm
    
    total_score = 0
    
    for i, question in enumerate(TEST_QUESTIONS):
        print(f"Testing Q{i+1}: {question}")
        
        # 1. Ask your RAG system the question
        response = rag_chain.invoke({"input": question})
        answer = response.get("answer")
        
        # 2. Extract the raw text it read from the PDFs
        raw_context = "\n".join([doc.page_content for doc in response.get("context", [])])
        
        # 3. Ask the Judge LLM to grade it
        score_response = judge_chain.invoke({
            "context": raw_context, 
            "answer": answer
        })
        
        # 4. Clean up the score
        try:
            score = int(score_response.content.strip())
        except:
            score = 0 # Failsafe if the judge formats it wrong
            
        total_score += score
        print(f"✅ Faithfulness Score: {score}/100\n")

    # Calculate final grade
    average = total_score / len(TEST_QUESTIONS)
    print("========================================")
    print(f"🏆 FINAL AYURMEAL ACCURACY RATE: {average:.1f}%")
    print("========================================")

if __name__ == "__main__":
    run_evaluation()