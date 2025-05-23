import React from 'react';
import Board from './components/Board';

import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 px-6 py-4">
      <h1 className="text-3xl font-bold text-center mb-6">🚀 Task Board</h1>
      <Board />
    </div>
  );
}

export default App
