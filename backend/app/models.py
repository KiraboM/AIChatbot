from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base


class Conversation(Base):
    __tablename__ = "conversation"
    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(Integer, ForeignKey('chat.id', ondelete='CASCADE'), nullable=False, index=True)
    prompt = Column(String, index=True)
    response = Column(String, index=True)

    chat = relationship("Chat", back_populates="conversations")

class Chat(Base):
    __tablename__ = "chat"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)

    conversations = relationship(
        "Conversation",
        back_populates="chat",
        cascade="all, delete-orphan",
    )