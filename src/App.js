import logo from './logo.svg';
import './App.css';
import apiService from './services/apiService'
import { useEffect, useState } from 'react';

import DateCheck from './Components/DateCheck'
import Home from './Components/Home'
import StructureTree from './Components/StructureTree'

function App() {


  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <DateCheck/>
        <Home/>
        <StructureTree/>
      </header>
    </div>
  );
}

export default App;
