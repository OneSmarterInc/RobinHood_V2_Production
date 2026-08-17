import React from 'react';
import { ArrowLeft, ShieldCheck, Key, Zap, Lock } from 'lucide-react';

const Security = ({ onBack }) => {
  return (
    <div className="security-wrapper">
      {/* Background Mesh (Reusing from Landing for consistency) */}
      <div className="mesh-bg">
        <div className="mesh-blob blob-1"></div>
        <div className="mesh-blob blob-2"></div>
        <div className="mesh-blob blob-3"></div>
      </div>

      <button className="btn-back" onClick={onBack}>
        <ArrowLeft size={16} /> Back to Portal
      </button>

      <div className="security-content">
        <div className="security-header">
          <h1 className="hero-headline">
            Military-Grade <span className="gradient-text">Security.</span>
          </h1>
          <p className="hero-subheadline">
            Our architecture is built on a zero-trust model. Every target file is cryptographically verified before it ever reaches the execution engine.
          </p>
        </div>

        <div className="security-grid">
          <div className="security-card glass-card">
            <div className="trust-icon emerald mb-4"><Key size={20} /></div>
            <h3>Ed25519 Cryptography</h3>
            <p>
              We utilize high-speed, high-security Ed25519 elliptic curve signatures. The Publisher Agent signs every target file, and your local Subscriber Agent mathematically verifies the signature. If the signature is invalid, execution is immediately aborted.
            </p>
          </div>

          <div className="security-card glass-card">
            <div className="trust-icon blue mb-4"><Lock size={20} /></div>
            <h3>Replay Attack Prevention</h3>
            <p>
              Every target file includes a strictly increasing sequence number. The Subscriber Agent tracks the last executed sequence. Old or duplicated files are automatically rejected, preventing any replay of past trades.
            </p>
          </div>

          <div className="security-card glass-card">
            <div className="trust-icon purple mb-4"><Zap size={20} /></div>
            <h3>Zero-Latency Validation</h3>
            <p>
              Verification happens locally on your machine in under 2 milliseconds. This ensures that cryptographic security does not compromise the execution speed required for high-frequency algorithmic trading.
            </p>
          </div>

          <div className="security-card glass-card">
            <div className="trust-icon emerald mb-4"><ShieldCheck size={20} /></div>
            <h3>Liveness Assertions</h3>
            <p>
              Target files contain strict timestamp constraints. If a file is delayed in transit or intercepted, the liveness assertion will fail, and the execution engine will gracefully reject the stale data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Security;
