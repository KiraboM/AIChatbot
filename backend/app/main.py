from fastapi import FastAPI, Depends
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from sqlalchemy.orm import Session

from app.database import Base, engine, SessionLocal
from app.models import Chat, Conversation
import os
from dotenv import load_dotenv
load_dotenv()
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="AI ChatBot",
    description="Create your own buddy!",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

def get_chat_db():
    chat_db = SessionLocal()
    try:
        yield chat_db
    finally:
        chat_db.close()

def get_conversation_db():
    conversation_db = SessionLocal()
    try:
        yield conversation_db
    finally:
        conversation_db.close()

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
    id: int

class ConversationCreate(BaseModel):
    id: int
    chat_id: int
    prompt: str
    response: str

class ChatCreate(BaseModel):
    id: int
    name: str
    conversation: ConversationCreate

@app.post("/chat_db")
def create_chat(chat: ChatCreate, chat_db: Session = Depends(get_chat_db)):
    db_chat = Chat(id=chat.id, name=chat.name, conversation=chat.conversation)#User(name=user.name, email=user.email)
    chat_db.add(db_chat)
    chat_db.commit()
    chat_db.refresh(db_chat)
    return db_chat

@app.post("/conversation_db")
def create_conversation(conversation: ConversationCreate, conversation_db: Session = Depends(get_conversation_db)):
    db_conversation = Conversation(
        id=conversation.id, 
        chat_id=conversation.chat_id,
        prompt=conversation.prompt,
        response=conversation.response 
    )
    conversation_db.add(db_conversation)
    conversation_db.commit()
    conversation_db.refresh(db_conversation)
    return db_conversation

@app.get("/chat_db")

def get_chat(id: int, chat_db: Session = Depends(get_chat_db)):
    return chat_db.query(Chat).filter(id=id)

@app.get("/conversation_db")

def get_conversation(chat_id: int, conversation_db: Session = Depends(get_conversation_db)):
    return conversation_db.query(Conversation).filter(chat_id=chat_id)


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

@app.get("/conversation")
async def conversation():
    """ Send the conversation history to the user """
    return conversation_history

