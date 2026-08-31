import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight,  } from 'lucide-react';

export default function DocsPage() {
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
        <div className="hero-badge">💻 API & Docs</div>
        <h1>Developer Documentation</h1>
        <p>Build your own custom agent or consume our APIs directly.</p>
      </section>

      <section style={{padding: '40px 20px', background: 'white', minHeight: '50vh', borderTop: '1px solid var(--border-color)'}}>
        <div style={{maxWidth: '1000px', margin: '0 auto'}} dangerouslySetInnerHTML={{ __html: `<div style='text-align: center;'>
      <h3 style='font-size: 24px; font-weight: 800; margin-bottom: 16px;'>API Reference</h3>
      <p style='color: var(--text-muted); margin-bottom: 24px;'>Our REST API is available for programmatic access. Authentication is via Token.</p>
      <div style='background: #0f172a; color: #34d399; padding: 24px; border-radius: 12px; font-family: monospace; text-align: left; max-width: 600px; margin: 0 auto;'>
        GET /api/v1/targets/latest/<br/>
        Authorization: Token YOUR_TOKEN<br/><br/>
        // Response<br/>
        {{<br/>
        &nbsp;&nbsp;"ticker": "AAPL",<br/>
        &nbsp;&nbsp;"action": "BUY",<br/>
        &nbsp;&nbsp;"signature": "0x..."<br/>
        }}
      </div>
    </div>` }} />
      </section>
    </div>
  );
}
