import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Triangle, ShieldCheck } from 'lucide-react';

export default function TermsPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div className="landing-container">
      <nav className="navbar">
        <Link to="/" className="logo"><ShieldCheck size={24} fill="#4f46e5" strokeWidth={0} /> One Smarter</Link>
        <div className="nav-menu">
          <Link to="/" className="nav-item">Home</Link>
          <Link to="/security" className="nav-item">Security</Link>
        </div>
        <div className="nav-actions">
          <Link to="/login" className="nav-item">Log In</Link>
          <Link to="/register" className="btn-primary">Get Started</Link>
        </div>
      </nav>
      
      <div style={{maxWidth: '800px', margin: '0 auto', padding: '80px 20px', background: 'white', minHeight: '100vh', borderLeft: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)'}}>
        <h1 style={{fontSize: '36px', fontWeight: '800', marginBottom: '16px'}}>Terms of Service</h1>
        <p style={{color: 'var(--text-muted)', marginBottom: '40px'}}>Last Updated: October 2026</p>
        <div style={{lineHeight: '1.8', color: 'var(--text-main)', fontSize: '16px'}} dangerouslySetInnerHTML={{ __html: `<h3>1. Acceptance of Terms</h3><p>By using One Smarter's Publisher Agent, you agree to these terms.</p><h3>2. Disclaimer of Warranties</h3><p>Automated trading carries significant financial risk. One Smarter is a technology provider, not a financial advisor. You are solely responsible for your trades.</p>` }} />
      </div>
    </div>
  );
}
