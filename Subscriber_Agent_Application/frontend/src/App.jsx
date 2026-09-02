import React, { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Landing from './components/Landing';
import Security from './components/Security';
import './App.css';

function App() {
  const [view, setView] = useState('landing');
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState(null);

  const handleLogin = (authToken, user) => {
    setToken(authToken);
    setUsername(user);
    setView('dashboard');
  };

  const handleLogout = () => {
    setToken(null);
    setUsername(null);
    setView('landing');
  };

  return (
    <div className="app-container">
      {view === 'landing' && <Landing onEnter={() => setView('login')} onSecurity={() => setView('security')} />}
      {view === 'security' && <Security onBack={() => setView('landing')} />}
      {view === 'login' && <Login onLogin={handleLogin} onBack={() => setView('landing')} />}
      {view === 'dashboard' && <Dashboard token={token} username={username} onLogout={handleLogout} />}
    </div>
  );
}

export default App;
