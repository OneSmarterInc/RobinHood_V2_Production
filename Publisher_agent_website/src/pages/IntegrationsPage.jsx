import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight,  } from 'lucide-react';

export default function IntegrationsPage() {
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
        <div className="hero-badge">🔌 Supported Platforms</div>
        <h1>Direct Broker Integrations</h1>
        <p>Connect your local Subscriber Agent directly to your favorite brokerage with zero middlemen.</p>
      </section>

      <section style={{padding: '40px 20px', background: 'white', minHeight: '50vh', borderTop: '1px solid var(--border-color)'}}>
        <div style={{maxWidth: '1000px', margin: '0 auto'}} dangerouslySetInnerHTML={{ __html: `<div style='display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;'>
      <div style='padding: 24px; border: 1px solid var(--border-color); border-radius: 16px;'><h3 style='font-size: 20px; font-weight: 700; margin-bottom: 8px;'>Alpaca</h3><p style='color: var(--text-muted); font-size: 14px;'>Full support for fractional shares and crypto via Alpaca v2 Trading API.</p></div>
      <div style='padding: 24px; border: 1px solid var(--border-color); border-radius: 16px;'><h3 style='font-size: 20px; font-weight: 700; margin-bottom: 8px;'>Tradier</h3><p style='color: var(--text-muted); font-size: 14px;'>Options and equity trading through Tradier Brokerage.</p></div>
      <div style='padding: 24px; border: 1px solid var(--border-color); border-radius: 16px;'><h3 style='font-size: 20px; font-weight: 700; margin-bottom: 8px;'>Robinhood</h3><p style='color: var(--text-muted); font-size: 14px;'>Retail automation via private API wrappers. Use at your own risk.</p></div>
      <div style='padding: 24px; border: 1px solid var(--border-color); border-radius: 16px;'><h3 style='font-size: 20px; font-weight: 700; margin-bottom: 8px;'>Interactive Brokers</h3><p style='color: var(--text-muted); font-size: 14px;'>Connect via IB Gateway or TWS on your local machine.</p></div>
    </div>` }} />
      </section>
    </div>
  );
}
