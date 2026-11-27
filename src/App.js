import './App.css';
import * as React from 'react';
import { AuthProvider } from './Session/AuthContext';

import Console from './Components/Console';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Console />
      </div>
    </AuthProvider>
  );
}

export default App;
