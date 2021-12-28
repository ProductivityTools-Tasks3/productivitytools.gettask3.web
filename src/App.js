import logo from './logo.svg';
import './App.css';
import apiService from './services/apiService'
import { useEffect, useState } from 'react';

import StructureTree from './Components/StructureTree'

function App() {


  const [date, setDate] = useState();

  useEffect(() => {
    const fetchData = async () => {
      const date = await apiService.getDate();
      setDate(date);
    }
    fetchData();
  },[])


  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          {date}
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          To ja
        </a>
        <StructureTree>fd</StructureTree>
      </header>
    </div>
  );
}

export default App;
