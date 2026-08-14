import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw, Power, Server, TrendingUp, DollarSign, Terminal, Layers, FileJson, X, CheckCircle2 } from 'lucide-react';

const Dashboard = ({ token, onLogout }) => {
  const [data, setData] = useState({
    status: 'SYSTEM ACTIVE',
    equity: 50000.00,
    positions: {},
    logs: ['Waiting for automated sync...']
  });

  const [latestTarget, setLatestTarget] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchStatus = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8001/api/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const res = await response.json();
        setData(res);
      }

      // Fetch Latest Target
      const targetRes = await fetch('http://127.0.0.1:8001/api/latest-target', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (targetRes.ok) {
        const targetData = await targetRes.json();
        if (targetData.filename) {
          setLatestTarget(targetData);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [token]);

  const forceSync = async () => {
    setData(prev => ({ ...prev, status: 'SYNCING WITH PUBLISHER...' }));
    try {
      await fetch('http://127.0.0.1:8001/api/sync', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchStatus();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <div className="sidebar glass-panel">
        <div className="sidebar-header">
          <div className="logo-box">
            <Activity className="accent-icon" size={24} />
          </div>
          <h2>OS QUANT</h2>
        </div>
        
        <div className="sidebar-menu">
          <button className="btn-secondary" onClick={forceSync}>
            <RefreshCw size={16} /> Force Sync Now
          </button>
        </div>

        <div className="sidebar-footer">
          <button className="btn-danger" onClick={onLogout}>
            <Power size={16} /> Disconnect
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="header">
          <div className="header-title">
            <h1>Live Portfolio</h1>
            <p className="header-subtitle">Real-time quantitative strategy execution</p>
          </div>
          <div className={`status-badge ${data.status.includes('SYNCING') ? 'syncing' : ''}`}>
            <Server size={14} /> {data.status}
          </div>
        </div>

        <div className="glass-card equity-card">
          <div className="equity-icon-wrapper">
            <DollarSign size={24} className="equity-icon" />
          </div>
          <p className="subtitle">Total Account Equity</p>
          <h1 className="equity-value">
            <span className="currency-symbol">$</span>
            {data.equity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h1>
          <div className="equity-chart-placeholder">
            {/* Soft background glow representing a trend line */}
          </div>
        </div>

        {/* Target Intelligence Section */}
        {latestTarget && (
          <div className="glass-card target-intel-card">
            <div className="target-intel-header">
              <div className="target-intel-title">
                <CheckCircle2 className="success-icon" size={20} />
                <h3>Today's Target Strategy Received</h3>
              </div>
              <button className="btn-primary btn-sm" onClick={() => setShowModal(true)}>
                <FileJson size={16} style={{marginRight: '6px'}}/> View Raw JSON
              </button>
            </div>
            <div className="target-intel-body">
              <p><strong>File:</strong> {latestTarget.filename}</p>
              <p><strong>Session Date:</strong> {latestTarget.document?.effective_session || 'Unknown'}</p>
              <p className="target-desc">The quantitative model has processed these targets and the execution engine is actively aligning the portfolio.</p>
            </div>
          </div>
        )}

        <div className="grid-container">
          <div className="glass-card panel">
            <h3><Layers size={18} className="panel-icon"/> Current Positions</h3>
            <div className="pos-list">
              {Object.keys(data.positions).length === 0 ? (
                <div className="empty-state">
                  <TrendingUp size={32} className="empty-icon" />
                  <p>Fully in Cash</p>
                </div>
              ) : (
                Object.entries(data.positions).map(([sym, qty], idx) => (
                  <div key={sym} className="pos-item" style={{ animationDelay: `${idx * 0.1}s` }}>
                    <div className="pos-info">
                      <div className="pos-avatar">{sym.substring(0, 1)}</div>
                      <span className="pos-sym">{sym}</span>
                    </div>
                    <div className="pos-qty">
                      <span className="qty-val">{qty}</span>
                      <span className="qty-label">shares</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="glass-card panel">
            <h3><Terminal size={18} className="panel-icon"/> Execution Audit Logs</h3>
            <div className="terminal-box">
              {data.logs.map((log, i) => (
                <div key={i} className="log-item">
                  <span className="log-arrow">→</span> {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* JSON Viewer Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FileJson size={18} className="modal-icon"/> {latestTarget?.filename}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <pre className="json-code-block">
                <code>{latestTarget?.raw_json}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
