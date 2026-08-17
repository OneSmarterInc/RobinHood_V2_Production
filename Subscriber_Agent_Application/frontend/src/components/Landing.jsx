import React from 'react';
import { Activity, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

const Landing = ({ onEnter, onSecurity }) => {
  return (
    <div className="landing-wrapper">
      {/* Colorful Animated Background Mesh */}
      <div className="mesh-bg">
        <div className="mesh-blob blob-1"></div>
        <div className="mesh-blob blob-2"></div>
        <div className="mesh-blob blob-3"></div>
      </div>

      {/* Navbar area */}
      <nav className="landing-nav">
        <div className="landing-logo">
          <div className="logo-icon-wrapper">
            <Activity size={22} className="landing-logo-icon" />
          </div>
          <span className="landing-logo-text">OS QUANT</span>
        </div>
        <div className="landing-nav-links">
          <button className="nav-btn" onClick={onEnter}>Platform</button>
          <button className="nav-btn" onClick={onSecurity}>Security</button>
        </div>
      </nav>

      {/* Main Hero */}
      <main className="hero-section">
        <div className="hero-content">
          <div className="badge-pill">
            <span className="badge-dot"></span>
            Version 1.0 Active
          </div>
          
          <h1 className="hero-headline">
            Institutional-Grade<br/>
            <span className="gradient-text">Quantitative Execution.</span>
          </h1>
          <p className="hero-subheadline">
            Secure, automated portfolio alignment powered by cryptographic verification. Connect your account to execute strategies with mathematical precision.
          </p>
          
          <div className="hero-actions">
            <button className="btn-hero" onClick={onEnter}>
              Access Client Portal <ArrowRight size={18} className="btn-icon-right" />
            </button>
            <button className="btn-secondary-hero">
              View Documentation
            </button>
          </div>
          
          <div className="hero-trust">
            <div className="trust-item">
              <div className="trust-icon emerald"><ShieldCheck size={16} /></div>
              Ed25519 Verified
            </div>
            <div className="trust-item">
              <div className="trust-icon blue"><Zap size={16} /></div>
              Zero-Latency Sync
            </div>
          </div>
        </div>

        {/* Abstract graphical element to add depth without being cliche */}
        <div className="hero-graphic">
          <div className="glass-panel abstract-card top-card">
            <div className="card-header">Target Acquired</div>
            <div className="card-row"><span>Sequence</span> <span className="mono">0x8F92</span></div>
            <div className="card-row"><span>Signature</span> <span className="mono green">Valid</span></div>
          </div>
          <div className="glass-panel abstract-card bottom-card">
            <div className="card-header">Execution Engine</div>
            <div className="card-row"><span>Status</span> <span className="mono blue">Active</span></div>
            <div className="card-row"><span>Latency</span> <span className="mono">14ms</span></div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;
