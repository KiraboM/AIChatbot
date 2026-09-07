import { useEffect, useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import menuIcon from './assets/menuIcon.png'
import exitMenu from './assets/exitMenu.png'
import './App.css'

function App() {
  const [inChat, setChat] = useState(false)
  const [response, setResponse] = useState('')
  const [prompt, setPrompt] = useState('')
  const [waiting, setWaiting] = useState(false)
  const [menuOpen, setMenu] = useState(false)
  const [conversation, setConversation] = useState([])

  async function sendPrompt(message){
    setWaiting(true)
    setChat(true)
    const response = await fetch('http://localhost:8000/chat',{
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: message }),
    })
    setWaiting(false)
    return response.json()
  }

  async function getConversation(){
    const conversation = await fetch('http://localhost:8000/conversation',{
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
    return conversation.json()
  }

  useEffect(() => {
    getConversation().then((data) => setConversation(data))
  }, [response])

  return (
    <div className='entire-screen'>
      { !menuOpen && <div className='menu-btn-container'>
        <button
          className='menu-btn'
          onClick={() => setMenu(true)}
        >
          <img 
            src={menuIcon} 
            alt="menuIcon" 
            width="30"
            height="30"
          />
        </button>
      </div>
      }
      {menuOpen &&
        <div className='menu'>
          <ul className='menu-list'>
            <li className='menu-li'>New Chat</li>
            <li className='menu-li'>List of Chats</li>
          </ul>
          <button 
            className='exit-menu-btn'
            onClick={() => setMenu(false)}
          >
            <img 
              src={exitMenu} 
              alt="exitMenu" 
              width="30"
              height="30"
            />
          </button>
        </div>
      }
      { !inChat ? 
      <div className='main'>
        <h1>Welcome to your AI Chatbot!</h1>
        <div className='prompt-field-container'>
          <div className='prompt-field'>
            <input 
              type="text"
              placeholder='Enter promt here' 
              className='input-field'
              id='input-field'
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              tabIndex="0"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendPrompt(prompt).then((data) => setResponse(data))
                }
              }}
            />
            <div className='prompt-btn-chat-container'>
              <button 
                className='prompt-btn-chat'
                title='Send prompt'
                onClick={() => sendPrompt(prompt).then((data) => setResponse(data))}
              >
                <i className='fa fa-arrow-up w3-large'></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      : 
        <div className='main'>
          {conversation.length === 0 ? (
            <div>
              <p className='user-prompt'>{prompt}</p>
              {waiting ? <p>Waiting for resposne...</p> : <p className='ai-response'>{response.answer}</p>}
            </div>
          ) : (
          <div>
            <ul>
              {conversation.map((list) => (
                <li>
                  <p className='user-prompt' key={list.prompt}>{list.prompt}</p>
                  <p className='ai-response' key={list.content}>{list.content}</p>
                </li>
              ))}
            </ul>
            {waiting && (
              <div>
                <p className='user-prompt'>{prompt}</p>
                <p>Waiting for resposne...</p>
              </div>
            )}
          </div>
          )}
            <div className='prompt-field-container'>
              <div className='prompt-field'>
                <input 
                  type="text"
                  placeholder='Enter promt here' 
                  className='input-field'
                  id='input-field'
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      sendPrompt(prompt).then((data) => setResponse(data))
                    }
                  }}
                />
                <button 
                  className='prompt-btn-chat'
                  onClick={() => sendPrompt(prompt).then((data) => setResponse(data))}
                >
                  <i className='fa fa-arrow-up w3-large'></i>
                </button>
              </div>
            </div>
          </div>
      
      }
    </div>
  )
}

export default App
