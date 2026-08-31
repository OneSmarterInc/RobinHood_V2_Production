import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight,  } from 'lucide-react';

export default function PricingPage() {
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
      
      <section className="hero" style={{paddingBottom: '60px'}}>
        <div className="hero-badge">💳 Plans</div>
        <h1>Simple, Transparent Pricing</h1>
        <p>No hidden fees. Just pay for the automation engine.</p>
      </section>

      <section style={{padding: '40px 20px', background: 'white', minHeight: '50vh', borderTop: '1px solid var(--border-color)'}}>
        <div style={{maxWidth: '1000px', margin: '0 auto'}} dangerouslySetInnerHTML={{ __html: `<div style='display: flex; gap: 30px; justify-content: center;'>
      <div style='border: 1px solid var(--border-color); border-radius: 24px; padding: 40px; width: 350px;'>
        <h3 style='font-size: 24px; font-weight: 800; margin-bottom: 12px;'>Pro Trader</h3>
        <p style='font-size: 40px; font-weight: 800; margin-bottom: 24px; color: var(--text-main);'>$49<span style='font-size: 16px; color: var(--text-muted); font-weight: 500;'>/mo</span></p>
        <ul style='list-style: none; padding: 0; display: flex; flexDirection: column; gap: 12px; margin-bottom: 32px;'>
          <li style='color: var(--text-main); font-weight: 500;'>✔ Unlimited WebSockets</li>
          <li style='color: var(--text-main); font-weight: 500;'>✔ Cryptographic Verification</li>
          <li style='color: var(--text-main); font-weight: 500;'>✔ All Broker Integrations</li>
        </ul>
        <a href='/register' style='display: block; text-align: center; background: var(--primary); color: white; padding: 14px; border-radius: 12px; font-weight: 700; text-decoration: none;'>Get Started</a>
      </div>
    </div>` }} />
      </section>
    </div>
  );
}
