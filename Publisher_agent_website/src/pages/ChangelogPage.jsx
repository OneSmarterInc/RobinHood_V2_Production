import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight,  } from 'lucide-react';

export default function ChangelogPage() {
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
        <div className="hero-badge">🚀 Updates</div>
        <h1>Changelog</h1>
        <p>See what's new in the Publisher and Subscriber Agents.</p>
      </section>

      <section style={{padding: '40px 20px', background: 'white', minHeight: '50vh', borderTop: '1px solid var(--border-color)'}}>
        <div style={{maxWidth: '1000px', margin: '0 auto'}} dangerouslySetInnerHTML={{ __html: `<div style='max-width: 600px; margin: 0 auto;'>
      <div style='margin-bottom: 40px; padding-left: 24px; border-left: 4px solid var(--primary);'>
        <span style='background: #e0e7ff; color: #4338ca; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700;'>v1.0.5</span>
        <h3 style='font-size: 20px; font-weight: 700; margin: 12px 0;'>Added Admin Support Ticketing</h3>
        <p style='color: var(--text-muted);'>Subscribers can now send support queries directly to the Super Admin via the Download dashboard.</p>
      </div>
      <div style='margin-bottom: 40px; padding-left: 24px; border-left: 4px solid #e2e8f0;'>
        <span style='background: #f1f5f9; color: #475569; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700;'>v1.0.4</span>
        <h3 style='font-size: 20px; font-weight: 700; margin: 12px 0;'>Zero-Trust Ed25519</h3>
        <p style='color: var(--text-muted);'>Introduced cryptographic verification for all trade payloads.</p>
      </div>
    </div>` }} />
      </section>
    </div>
  );
}
