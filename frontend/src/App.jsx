import { useEffect, useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'

function App() {
  const [inChat, setChat] = useState(false)
  const [response, setResponse] = useState('')
  const [prompt, setPrompt] = useState('')
  const [waiting, setWaiting] = useState(false)

  async function sendPrompt(message){
    setWaiting(true)
    const response = await fetch('http://localhost:8000/chat',{
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: message }),
    })
    setWaiting(false)
    return response.json()
  }

 /*  useEffect(() => {

  }, [prompt]) */

  return (
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
          className='prompt-btn'
          onClick={() => sendPrompt(prompt).then((data) => setResponse(data.answer))}
        >
            Submit Prompt
        </button>
        {waiting ? <p>Waiting for response</p> : <p>{response}</p>}
      </div>
    </div>
  )
}

export default App
