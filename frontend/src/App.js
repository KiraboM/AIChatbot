// frontend/src/App.js

import React, { useEffect, useState } from 'react';

function App() {

  return (
    <div className="App">
      
      <h1>This is your AI chatbot!</h1>

      <div className='input'>
        <input
          type='text'
          className='input-field'
          name='input-filed'
          placeholder='Enter prompt here'
        />
      </div>
    </div>
  );
}

export default App;