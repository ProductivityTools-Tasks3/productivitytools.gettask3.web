import logo from './logo.svg';
import './App.css';
import * as React from 'react';

import ReactDOM from 'react-dom';

import apiService from './services/apiService'
import { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { StyledEngineProvider } from '@mui/material/styles';
import { AuthProvider } from './Session/AuthContext'



import DateCheck from './Components/DateCheck'
import Home from './Components/Home'

import Console from './Components/Console'

function App() {


  return (
    <AuthProvider>
      <div className="App">
        <header className="App-header">
          <DateCheck />
        </header>
        <Home />
        <Console />
        <ToastContainer />
      </div>
    </AuthProvider>
  );
}

export default App;
