import React, { useState } from 'react';
import axios from 'axios';
import { ShieldCheck, User, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/v1/auth/admin/login/', formData);
      localStorage.setItem('adminToken', res.data.token);
      localStorage.setItem('adminRole', res.data.role);
      window.location.href = '/';
    } catch (err) {
      setError(err.response?.data?.error || "Authentication failed. Please check credentials.");
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '24px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <ShieldCheck size={48} color="var(--primary)" style={{ marginBottom: '16px' }} />
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>One Smarter Admin</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500' }}>
            Sign in to access the control panel
          </p>
        </div>

        {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <User size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '14px' }} />
            <input type="text" placeholder="Admin Username" required style={{ width: '100%', padding: '12px 12px 12px 40px', border: '2px solid var(--border-color)', borderRadius: '12px', fontSize: '14px', outline: 'none', fontWeight: '500' }}
              value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '14px' }} />
            <input type="password" placeholder="Master Password" required style={{ width: '100%', padding: '12px 12px 12px 40px', border: '2px solid var(--border-color)', borderRadius: '12px', fontSize: '14px', outline: 'none', fontWeight: '500' }}
              value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '14px', justifyContent: 'center', fontSize: '15px', marginTop: '8px' }}>
            Secure Login <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
