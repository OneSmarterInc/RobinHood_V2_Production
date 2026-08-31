import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Triangle, ShieldCheck } from 'lucide-react';

export default function PrivacyPage() {
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
        <h1 style={{fontSize: '36px', fontWeight: '800', marginBottom: '16px'}}>Privacy Policy</h1>
        <p style={{color: 'var(--text-muted)', marginBottom: '40px'}}>Last Updated: October 2026</p>
        <div style={{lineHeight: '1.8', color: 'var(--text-main)', fontSize: '16px'}} dangerouslySetInnerHTML={{ __html: `<h3>1. Information Collection</h3><p>We do not collect or store your brokerage API keys. All keys remain on your local machine.</p><h3>2. Use of Information</h3><p>Your email and username are used strictly for account management and ticketing purposes.</p>` }} />
      </div>
    </div>
  );
}
