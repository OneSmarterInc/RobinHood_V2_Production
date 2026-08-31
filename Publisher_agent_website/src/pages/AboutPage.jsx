import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight,  } from 'lucide-react';

export default function AboutPage() {
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
        <div className="hero-badge">🏢 Company</div>
        <h1>About One Smarter</h1>
        <p>We are building the infrastructure for autonomous, zero-trust quantitative trading.</p>
      </section>

      <section style={{padding: '40px 20px', background: 'white', minHeight: '50vh', borderTop: '1px solid var(--border-color)'}}>
        <div style={{maxWidth: '1000px', margin: '0 auto'}} dangerouslySetInnerHTML={{ __html: `<div style='text-align: center; max-width: 700px; margin: 0 auto;'>
      <p style='font-size: 18px; line-height: 1.8; color: var(--text-main);'>Founded in 2026, One Smarter is dedicated to democratizing access to algorithmic trading signals without compromising on security. We believe that retail traders should never have to hand over their brokerage keys to a third party.</p>
    </div>` }} />
      </section>
    </div>
  );
}
