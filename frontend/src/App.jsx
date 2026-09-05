import { useEffect, useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'

function App() {
  const [inChat, setChat] = useState(false)
  //const [response, setResponse] = useState('')
  const [prompt, setPrompt] = useState('')
  const [waiting, setWaiting] = useState(false)
  const [conversation, setConversation] = useState([])

  async function sendPrompt(message){
    setWaiting(true)
    setChat(true)
    const conversation = await fetch('http://localhost:8000/chat',{
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: message }),
    })
    setWaiting(false)
    return conversation.json()
  }

 /*  useEffect(() => {

  }, [prompt]) */

  return (
    <div className='entire-screen'>
      { !inChat ? 
      <div className='main'>
        <h1>Welcome to your AI Chatbot!</h1>
        
        <div className='prompt-field'>
          <input 
            type="text"
            placeholder='Enter promt here' 
            className='input-field'
            id='input-field'
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button 
            className='prompt-btn-chat'
            onClick={() => sendPrompt(prompt).then((data) => setConversation(data))}
          >
            {/* <i className='fa fa-arrow-up w3-large'></i> */}
            Submit Prompt
          </button>
        </div>
      </div>
      : 
        <div className='main'>
          {conversation.map((list) => (/* This function causes frontend to crash. Fix it! */
            <div>
              <p className='user-prompt' key={list.prompt}>{list.prompt}</p>
              {waiting ? <p key={list.content}>Waiting for response</p> : <p className='ai-response' key={list.content}>{list.content}</p>}
            </div>
          ))}
            <div className='prompt-field'>
              <input 
                type="text"
                placeholder='Enter promt here' 
                className='input-field'
                id='input-field'
                onChange={(e) => setPrompt(e.target.value)}
              />
              <button 
                className='prompt-btn-chat'
                onClick={() => sendPrompt(prompt).then((data) => setConversation(data))}
              >
                {/* <i className='fa fa-arrow-up w3-large'></i> */}
                Submit Prompt
              </button>
            </div>
          </div>
      
      }
    </div>
  )
}

export default App
