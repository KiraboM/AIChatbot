import { useEffect, useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import menuIcon from './assets/menuIcon.png'
import exitMenu from './assets/exitMenu.png'
import { AnimatePresence, motion } from 'motion/react'
import './App.css'

function App() {
  const [inChat, setChat] = useState(false)
  const [response, setResponse] = useState(
    {
      "reasoning": "",
      "answer": ""
    }
  )
  const [prompt, setPrompt] = useState('')
  const [lastPrompt, setLastPrompt] = useState('')
  const [waiting, setWaiting] = useState(false)
  const [menuOpen, setMenu] = useState(false)
  const [conversation, setConversation] = useState([])
  const [chatID, setChatID] = useState(-1)
  const [chatListOpen, setChatListOpen] = useState(false)
  const [chatList, setChatList] = useState([
    {
      "name": "",
      "id": -1
    }
  ])

  async function createConversation(id, message){
    const currentResponse = sendPrompt(message)
    await fetch('http://localhost:8000/conversation_db',{
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: id, prompt: message, response: currentResponse}),
    })
  }

  async function createChat(message){
    const newChat = await fetch('http://localhost:8000/chat_db',{
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: message}),
    })
    return newChat.json()
  }

  async function getChat(id){
    const myChat = await fetch(`http://localhost:8000/chat_db/${id}`,{
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
    return myChat.json()
  }

  async function getConversationDB(chat_id){
    const myConversation = await fetch(`http://localhost:8000/conversation_db/${chat_id}`,{
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
    return myConversation.json()
  }

  async function getAllChat(){
    const myChats = await fetch('http://localhost:8000/chat_db',{
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
    return myChats.json()
  }


  async function sendPrompt(message){
    setWaiting(true)
    setChat(true)
    const myResponse = await fetch('http://localhost:8000/chat',{
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: message, id: chatID }),
    })
    setWaiting(false)
    return myResponse.json()
  }

  async function getConversation(){
    const myConversationL = await fetch('http://localhost:8000/conversation',{
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
    return myConversationL.json()
  }

  useEffect(() => {
    getConversationDB(chatID).then((data) => setConversation(data))
  }, [response, chatID, lastPrompt])

  useEffect(() => {
    setLastPrompt(prompt)
  }, [waiting])

  useEffect(() => {
    getAllChat().then((data) => setChatList(data))
  }, [chatListOpen])

  /* useEffect(() => {
    console.log(chatID)
  }, [prompt]) */
  

  return (
    <div className='entire-screen'>
      <div className='menu-container'>
        <AnimatePresence>
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
        </AnimatePresence>
        <AnimatePresence>
          {menuOpen &&
            <motion.div 
              className='menu'
              initial={{x: -100}}
              animate={{x: 100}}
              exit={{x: -100}}
              transition={{ duration: 0.1 }}
            >
              <ul className='menu-list'>
                <li className='menu-li'>
                  <button className='menu-li-btn'>
                    New Chat
                  </button>
                </li>
                <li className='menu-li'>
                  <button
                    className='menu-li-btn'
                    onClick={() => setChatListOpen(!chatListOpen)}
                  >
                    List of Chats
                  </button>
                  { chatListOpen && <AnimatePresence>
                      <motion.div>
                        <ul>
                          {chatList.map((list) =>
                            <li className='chat-li' key={list.id}>{list.name}</li>
                          )}
                        </ul>
                      </motion.div>
                    </AnimatePresence> }
                </li>
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
            </motion.div>
          }
        </AnimatePresence>
      </div>
      <div className='chat'>
        { !inChat ? 
        <div className='main'>
          <h1>Welcome to your AI Chatbot!</h1>
          <div className='prompt-field-container'>
            <div className='prompt-field'>
              <input 
                type="text"
                placeholder='Enter prompt here' 
                className='input-field'
                id='input-field'
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                tabIndex="0"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    createChat(prompt).then((data) => setChatID(data.id))
                    sendPrompt(prompt).then((data) => setResponse(data))
                    createConversation(chatID, prompt)
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
                <p className='user-prompt'>{lastPrompt}</p>
                {waiting ? <p>Waiting for resposne...</p> : <p className='ai-response'>{response.answer}</p>}
              </div>
            ) : (
            <div>
              <ul>
                {conversation.map((list) => (
                  <li>
                    <p className='user-prompt' key={list.prompt}>{list.prompt}</p>
                    <p className='ai-response' key={list.response}>{list.response}</p>
                  </li>
                ))}
              </ul>
              {waiting && (
                <div>
                  <p className='user-prompt'>{lastPrompt}</p>
                  <p>Waiting for resposne...</p>
                </div>
              )}
            </div>
            )}
              <div className='prompt-field-container'>
                <div className='prompt-field'>
                  <input 
                    type="text"
                    placeholder='Enter prompt here' 
                    className='input-field'
                    id='input-field'
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        sendPrompt(prompt).then((data) => setResponse(data))
                        createConversation(chatID, prompt)
    
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
    </div>
  )
}

export default App
