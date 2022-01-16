import logo from './logo.svg';
import './App.css';
import apiService from './services/apiService'
import { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



import DateCheck from './Components/DateCheck'
import Home from './Components/Home'

import Console from './Components/Console'

function App() {


  return (
    <div className="App">
      <header className="App-header">
        <DateCheck />
      </header>
      <Home />
      <Console/>
      <ToastContainer />
    </div>
  );
}

export default App;
