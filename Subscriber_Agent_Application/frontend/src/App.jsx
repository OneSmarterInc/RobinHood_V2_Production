import React, { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('agent_token') || null);

  const handleLogin = (newToken) => {
    localStorage.setItem('agent_token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('agent_token');
    setToken(null);
  };

  return (
    <div className="app-container">
      {token ? (
        <Dashboard token={token} onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
