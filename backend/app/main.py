from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
import os
from dotenv import load_dotenv
load_dotenv()

app = FastAPI(
    title="AI ChatBot",
    description="Create your own buddy!",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://172.19.0.3:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(
    base_url=os.getenv("OPENAI_BASE_URL", "http://localhost:11434/v1/"),
    api_key=os.getenv("OPENAI_API_KEY", "ollama"),  # required but ignored
)

conversation_history = []

class ChatRequest(BaseModel):
    prompt: str

@app.post("/chat")
async def chat(request: ChatRequest):
    """Send a prompt and receive reasoning + answer from the model."""
    messages = [{"role": "user", "content": request.prompt}]
    
    try:
        completion = client.chat.completions.create(
            model="qwen3:8b",
            messages=messages,
            # Ollama expects standard hyperparameters inside extra_body or options
            extra_body={
                "options": {
                    "top_k": 20,
                    "temperature": 1.0,
                    "top_p": 0.95,
                }
            },
            stream=False
        )
        
        # Extract the assistant message safely
        message = completion.choices[0].message
        answer_content = message.content or ""
        
        # Ollama passes the reasoning thoughts into the "reasoning_content" property 
        # or embeds it directly in the text inside <think></think> tags.
        reasoning_content = getattr(message, "reasoning_content", "") or ""
        
        conversation_history.append({
            "role": "assistant",
            "prompt": request.prompt,
            "content": answer_content,
            "reasoning_content": reasoning_content,
        })
        
        return {
            "reasoning": reasoning_content,
            "answer": answer_content,
        }
        
    except Exception as e:
        # If something else fails, this prints the ACTUAL issue to your terminal
        print(f"CRITICAL BACKEND ERROR: {str(e)}")
        return {"error": "Internal Server Crash", "details": str(e)}

@app.post("/conversation")
async def conversation():
    """ Send the conversation history to the user """
    return conversation_history


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok"}


