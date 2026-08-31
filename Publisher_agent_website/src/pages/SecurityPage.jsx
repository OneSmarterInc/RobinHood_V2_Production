import React, { useEffect } from 'react';
import { Shield, Lock, ShieldCheck, CheckCircle2, ChevronRight, UserCheck, KeySquare, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SecurityPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="landing-container">
      {/* NAVBAR */}
            <nav className="navbar">
        <Link to="/" className="logo"><ShieldCheck size={24} fill="#4f46e5" strokeWidth={0} /> One Smarter</Link>
        <div className="nav-menu">
          <Link to="/" className="nav-item">Home</Link>
          <a href="/#features" className="nav-item">Platform</a>
          <a href="/#architecture" className="nav-item">Developers</a>
          <Link to="/security" className="nav-item" style={{color: 'var(--primary)', fontWeight: '700'}}>Security</Link>
        </div>
        <div className="nav-actions">
          <Link to="/login" className="nav-item">Log In</Link>
          <Link to="/register" className="btn-primary">Get Started</Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero" style={{paddingBottom: '60px'}}>
        <div className="hero-badge">Enterprise-Grade Security</div>
        <h1>Zero-Trust Execution. <br/><span className="text-gradient">Maximum Protection.</span></h1>
        <p>
          At One Smarter, we process automated trade signals without ever compromising your brokerage credentials or exposing proprietary trading strategies.
        </p>
      </section>

      {/* SECURITY FEATURES GRID */}
      <section className="features-section" style={{paddingTop: '0', background: 'transparent'}}>
        <div className="features-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{background: '#fef2f2', color: '#ef4444'}}>
              <Lock size={24} />
            </div>
            <h3>End-to-End Encryption</h3>
            <p>All communication between the Publisher Engine and your local Subscriber Agent is secured using industry-standard TLS 1.3 encryption. No intermediaries can intercept or read the signal payloads.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{background: '#f0fdf4', color: '#16a34a'}}>
              <KeySquare size={24} />
            </div>
            <h3>Ed25519 Cryptographic Signatures</h3>
            <p>Every trade signal broadcasted by the Publisher Engine is cryptographically signed. Your local agent verifies this signature before execution, ensuring the signal is authentic and unaltered.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{background: '#fdf4ff', color: '#d946ef'}}>
              <UserCheck size={24} />
            </div>
            <h3>Human-in-the-Loop (HITL)</h3>
            <p>Maintain absolute control over your capital. The Subscriber Agent allows you to review, approve, or reject incoming signals manually before they hit your brokerage.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{background: '#fffbeb', color: '#d97706'}}>
              <Cpu size={24} />
            </div>
            <h3>Zero-Trust Architecture</h3>
            <p>We do not store your brokerage API keys. Your keys remain strictly on your local machine within the Subscriber Agent, communicating directly with your broker.</p>
          </div>
        </div>
      </section>

      {/* DEEP DIVE SECTION */}
      <section style={{padding: '80px 20px', background: 'white', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)'}}>
        <div className="deep-dive-container" style={{maxWidth: '1000px', margin: '0 auto', display: 'flex', gap: '60px', alignItems: 'center'}}>
          <div style={{flex: 1}}>
            <h2 style={{fontSize: '36px', fontWeight: '800', marginBottom: '24px', letterSpacing: '-1px'}}>How We Protect Your Capital</h2>
            <ul style={{listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '20px'}}>
              <li style={{display: 'flex', gap: '16px'}}>
                <CheckCircle2 size={24} color="var(--success)" style={{flexShrink: 0}} />
                <div>
                  <h4 style={{fontSize: '18px', fontWeight: '700', marginBottom: '4px'}}>Stateless Signal Processing</h4>
                  <p style={{color: 'var(--text-muted)', lineHeight: '1.6'}}>Signals are broadcasted immutably. The central server does not have access to individual portfolio balances or active positions.</p>
                </div>
              </li>
              <li style={{display: 'flex', gap: '16px'}}>
                <CheckCircle2 size={24} color="var(--success)" style={{flexShrink: 0}} />
                <div>
                  <h4 style={{fontSize: '18px', fontWeight: '700', marginBottom: '4px'}}>Local API Execution</h4>
                  <p style={{color: 'var(--text-muted)', lineHeight: '1.6'}}>When a verified signal is approved, the API call to your broker (e.g., Robinhood, Alpaca) happens entirely locally from your machine's IP address.</p>
                </div>
              </li>
              <li style={{display: 'flex', gap: '16px'}}>
                <CheckCircle2 size={24} color="var(--success)" style={{flexShrink: 0}} />
                <div>
                  <h4 style={{fontSize: '18px', fontWeight: '700', marginBottom: '4px'}}>Strict Access Revocation</h4>
                  <p style={{color: 'var(--text-muted)', lineHeight: '1.6'}}>If a subscription ends, the agent's WebSocket connection is immediately terminated by the server, cutting off signal flow instantly.</p>
                </div>
              </li>
            </ul>
          </div>
          <div style={{flex: 1, background: '#0f172a', padding: '40px', borderRadius: '24px', position: 'relative', overflow: 'hidden'}}>
            <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)'}}></div>
            <div style={{color: '#34d399', fontFamily: 'monospace', fontSize: '14px', lineHeight: '1.8', opacity: 0.9}}>
              &gt; VERIFYING SIGNAL...<br/>
              &gt; Payload: AAPL BUY 50 SHARES<br/>
              &gt; Signature: 0x8f2a...91b4<br/>
              &gt; Public Key: MATCHED<br/>
              <span style={{color: '#a78bfa'}}>✔ Cryptographic Verification Passed</span><br/>
              &gt; Awaiting User Approval...<br/>
              <span style={{color: '#facc15'}}>&gt; Status: PENDING_HITL</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="cta-section">
        <h2 className="cta-title">Trade with Absolute Confidence</h2>
        <p className="cta-subtitle">Join the secure network of automated traders today.</p>
        <div style={{display: 'flex', gap: '16px', justifyContent: 'center'}}>
          <Link to="/register" className="btn-primary" style={{padding: '16px 32px', fontSize: '16px'}}>Create Secure Account <ChevronRight size={20}/></Link>
        </div>
      </section>
    </div>
  );
}
