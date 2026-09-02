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
    allow_origins=["*"],
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
    
    completion = client.chat.completions.create(
        model="qwen3:8b",
        messages=messages,
        extra_body={
            "chat_template_kwargs": {
                "enable_thinking": True,
                "preserve_thinking": True,
            },
            "top_k": 20,
        },
        reasoning_effort="xhigh",
        temperature=1.0,
        top_p=0.95,
        stream=True,
        stream_options={"include_usage": True},
    )
    
    reasoning_content = ""
    answer_content = ""
    
    for chunk in completion:
        if not chunk.choices:
            continue
        
        delta = chunk.choices[0].delta
        
        if hasattr(delta, "reasoning_content") and delta.reasoning_content:
            reasoning_content += delta.reasoning_content
        
        if hasattr(delta, "content") and delta.content:
            answer_content += delta.content
    
    conversation_history.append({
        "role": "assistant",
        "content": answer_content,
        "reasoning_content": reasoning_content,
    })
    
    return {
        "reasoning": reasoning_content,
        "answer": answer_content,
    }

@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok"}


