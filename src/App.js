import './App.css';
import * as React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './Session/AuthContext';

import DateCheck from './Components/DateCheck';
import Console from './Components/Console';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <header className="App-header">
          <DateCheck />
        </header>
        <Console />
        <ToastContainer />
      </div>
    </AuthProvider>
  );
}

export default App;
