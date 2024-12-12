import React from 'react';
import Calendar from './component/Calendar'; // Ensure the path to your Calendar component is correct
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Event Calendar</h1>
      </header>
      <main>
        <Calendar />
      </main>
    </div>
  );
}

export default App;
