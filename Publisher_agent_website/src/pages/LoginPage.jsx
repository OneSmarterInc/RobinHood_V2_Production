import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Activity, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('publisher_token', data.token);
        navigate('/download');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Network error. Make sure backend is running.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <Link to="/" style={{ position: 'absolute', top: '40px', left: '40px', color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.7 }}>
        <ArrowLeft size={20} /> Back to Home
      </Link>
      
      <div className="auth-card">
        <div className="auth-card-logo">
          <Activity size={48} />
        </div>
        <h2>Welcome Back</h2>
        <p>Sign in to download your latest Subscriber Agent.</p>
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Username</label>
            <div className="input-wrapper">
              <User size={20} className="input-icon" />
              <input type="text" name="username" className="form-control" placeholder="Enter username" required onChange={handleChange} value={formData.username} />
            </div>
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock size={20} className="input-icon" />
              <input type={showPassword ? "text" : "password"} name="password" className="form-control has-right-icon" placeholder="••••••••" required onChange={handleChange} value={formData.password} />
              <button type="button" className="input-icon-right" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          
          <button type="submit" className="btn-primary auth-btn" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
          
          {error && <div className="error-msg"><AlertCircle size={18} /> {error}</div>}
          
          <div className="auth-footer">
            Don't have an account? <Link to="/register">Create one here</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
