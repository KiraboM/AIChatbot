import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className='main'>
      <h1>Welcome to your AI Chatbot!</h1>
      
      <div className='prompt'>
        <input 
          type="text"
          placeholder='Enter promt here' 
          className='input-field'
        />
      </div>
    </div>
  )
}

export default App
