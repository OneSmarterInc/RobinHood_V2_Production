import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, KeyRound, Activity, AlertCircle, CheckCircle2, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    otp: '',
    password: '',
    confirm_password: ''
  });

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/auth/register-init/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formData.username, email: formData.email })
      });
      const data = await res.json();
      
      if (res.ok) {
        setSuccess('OTP sent to your email successfully!');
        setTimeout(() => setStep(2), 1500);
      } else {
        let errorMsg = 'Failed to request OTP';
        if (data.error) {
          errorMsg = data.error;
        } else if (typeof data === 'object') {
          const firstKey = Object.keys(data)[0];
          if (Array.isArray(data[firstKey])) {
            errorMsg = data[firstKey][0];
          } else if (typeof data[firstKey] === 'string') {
            errorMsg = data[firstKey];
          }
        }
        setError(errorMsg);
      }
    } catch (err) {
      setError('Network error. Make sure Publisher backend is running.');
    }
    setLoading(false);
  };

  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/auth/register-complete/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.email, 
          otp: formData.otp, 
          password: formData.password, 
          confirm_password: formData.confirm_password 
        })
      });
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('publisher_token', data.token);
        navigate('/download');
      } else {
        let errorMsg = 'Registration failed';
        if (data.error) {
          errorMsg = data.error;
        } else if (typeof data === 'object') {
          const firstKey = Object.keys(data)[0];
          if (Array.isArray(data[firstKey])) {
            errorMsg = data[firstKey][0];
          } else if (typeof data[firstKey] === 'string') {
            errorMsg = data[firstKey];
          }
        }
        setError(errorMsg);
      }
    } catch (err) {
      setError('Network error.');
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
        <h2>{step === 1 ? 'Create an Account' : 'Verify Email'}</h2>
        <p>{step === 1 ? 'Join the One Smarter platform to download your agent.' : `Enter the OTP sent to ${formData.email}`}</p>
        
        {step === 1 ? (
          <form onSubmit={handleRequestOTP}>
            <div className="form-group">
              <label>Username</label>
              <div className="input-wrapper">
                <User size={20} className="input-icon" />
                <input type="text" name="username" className="form-control" placeholder="Choose a username" required onChange={handleChange} value={formData.username} />
              </div>
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <Mail size={20} className="input-icon" />
                <input type="email" name="email" className="form-control" placeholder="name@company.com" required onChange={handleChange} value={formData.email} />
              </div>
            </div>
            
            <button type="submit" className="btn-primary auth-btn" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Continue'}
            </button>
            
            {error && <div className="error-msg"><AlertCircle size={18} /> {error}</div>}
            {success && <div className="success-msg"><CheckCircle2 size={18} /> {success}</div>}
            
            <div className="auth-footer">
              Already have an account? <Link to="/login">Sign in here</Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleCompleteRegistration}>
            <div className="form-group">
              <label>Verification Code (OTP)</label>
              <div className="input-wrapper">
                <KeyRound size={20} className="input-icon" />
                <input type="text" name="otp" className="form-control" placeholder="6-digit code" required onChange={handleChange} value={formData.otp} />
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
            <div className="form-group">
              <label>Confirm Password</label>
              <div className="input-wrapper">
                <Lock size={20} className="input-icon" />
                <input type={showConfirmPassword ? "text" : "password"} name="confirm_password" className="form-control has-right-icon" placeholder="••••••••" required onChange={handleChange} value={formData.confirm_password} />
                <button type="button" className="input-icon-right" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            <button type="submit" className="btn-primary auth-btn" disabled={loading}>
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
            
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px' }}>
                Incorrect email? Change it here
              </button>
            </div>
            
            {error && <div className="error-msg"><AlertCircle size={18} /> {error}</div>}
          </form>
        )}
      </div>
    </div>
  );
}
