import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // In production, this would call our local FastAPI bridge which proxies to Django
      const response = await fetch('http://127.0.0.1:8001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok && data.token) {
        onLogin(data.token);
      } else {
        setError(data.detail || 'Authentication Failed');
      }
    } catch (err) {
      setError('Connection refused. Is the bridge running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="glass-card login-card">
        <h1 className="logo-text">OS<span className="accent">.</span></h1>
        <h2>OneSmarter Quant</h2>
        <p className="subtitle">Welcome back, Agent.</p>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="input-field"
            placeholder="Enter your Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            className="input-field"
            placeholder="Enter your Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'AUTHENTICATING...' : 'INITIALIZE AGENT'}
          </button>
        </form>
        
        <p className="footer-text">Secure AES-256 Encrypted Connection</p>
      </div>
    </div>
  );
};

export default Login;
