import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw, Power, Server, FileJson, X, CheckCircle2 } from 'lucide-react';

const Dashboard = ({ token, onLogout }) => {
  const [data, setData] = useState({
    status: 'SYSTEM ACTIVE',
    logs: ['Waiting for automated sync...'],
    latest_document: null
  });

  const [latestTargetFile, setLatestTargetFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [markedDone, setMarkedDone] = useState(false);

  const fetchStatus = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8001/api/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const res = await response.json();
        setData(res);
      }

      // Fetch Latest Target Raw JSON info
      const targetRes = await fetch('http://127.0.0.1:8001/api/latest-target', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (targetRes.ok) {
        const targetData = await targetRes.json();
        if (targetData.filename) {
          setLatestTargetFile(targetData);
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
    setData(prev => ({ ...prev, status: 'CHECKING FOR SIGNALS...' }));
    setMarkedDone(false); // Reset ack status
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

  const document = data.latest_document || latestTargetFile?.document;
  const targets = document?.targets?.positions || {};
  const cashPct = document?.targets?.cash_pct || 0;
  const rationale = document?.rationale || 'No rationale provided.';

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
            <RefreshCw size={16} /> Sync Signals
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
            <h1>Signal Advisory Terminal</h1>
            <p className="header-subtitle">Secure, execution-less quantitative insights.</p>
          </div>
          <div className={`status-badge ${data.status.includes('CHECKING') ? 'syncing' : ''}`}>
            <Server size={14} /> {data.status}
          </div>
        </div>

        {!document ? (
          <div className="glass-card empty-state">
             <Activity size={48} className="empty-icon" style={{ opacity: 0.5, marginBottom: '20px' }} />
             <h2>Waiting for Publisher Signals</h2>
             <p>The background poller is actively checking for new, cryptographically verified targets.</p>
          </div>
        ) : (
          <div className="glass-card advisory-card" style={{ borderColor: markedDone ? 'var(--success)' : 'var(--brand-primary)', transition: 'border-color 0.5s ease', background: 'var(--bg-panel)', boxShadow: 'var(--shadow-xl)' }}>
            <div className="advisory-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={28} style={{ color: 'var(--success)' }} />
                <div>
                  <h2 style={{ margin: 0, color: 'var(--text-primary)', fontWeight: '700' }}>Today's Verified Targets</h2>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Session: {document.effective_session}</span>
                </div>
              </div>
              <button className="btn-secondary btn-sm" onClick={() => setShowModal(true)}>
                <FileJson size={16} style={{marginRight: '6px'}}/> View Signed JSON
              </button>
            </div>

            <div className="rationale-box" style={{ background: 'var(--brand-light)', border: '1px solid rgba(79, 70, 229, 0.2)', padding: '16px', borderRadius: '10px', marginBottom: '25px' }}>
              <h4 style={{ margin: '0 0 8px 0', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '600' }}>
                <Activity size={16} /> Market Rationale
              </h4>
              <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.6', color: 'var(--text-primary)' }}>{rationale}</p>
            </div>

            <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)', fontSize: '16px', fontWeight: '600' }}>Target Allocations</h3>
            <div className="pos-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '30px' }}>
              {Object.entries(targets).map(([sym, pct], idx) => (
                <div key={sym} className="pos-item" style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-sm)' }}>
                  <div className="pos-info" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="pos-avatar" style={{ background: 'var(--brand-primary)', color: 'white', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '18px' }}>
                      {sym.substring(0, 1)}
                    </div>
                    <span className="pos-sym" style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>{sym}</span>
                  </div>
                  <div className="pos-qty" style={{ textAlign: 'right' }}>
                    <span className="qty-val" style={{ fontSize: '22px', fontWeight: '800', color: 'var(--brand-primary)' }}>{pct}%</span>
                  </div>
                </div>
              ))}
              {cashPct > 0 && (
                <div className="pos-item" style={{ background: 'var(--success-bg)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(5, 150, 105, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-sm)' }}>
                  <div className="pos-info" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="pos-avatar" style={{ background: 'var(--success)', color: 'white', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '18px' }}>
                      $
                    </div>
                    <span className="pos-sym" style={{ fontSize: '18px', fontWeight: '700', color: 'var(--success)' }}>CASH</span>
                  </div>
                  <div className="pos-qty" style={{ textAlign: 'right' }}>
                    <span className="qty-val" style={{ fontSize: '22px', fontWeight: '800', color: 'var(--success)' }}>{cashPct}%</span>
                  </div>
                </div>
              )}
            </div>

            <div className="portfolio-section" style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
              <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)', fontSize: '16px', fontWeight: '600' }}>Live Broker Portfolio</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                <div className="equity-card" style={{ background: 'var(--brand-primary)', color: 'white', padding: '20px', borderRadius: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <span style={{ fontSize: '14px', opacity: 0.9 }}>Total Equity</span>
                  <span style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0' }}>
                    {data.equity ? data.equity.toLocaleString('en-US', {style: 'currency', currency: 'USD'}) : '$0.00'}
                  </span>
                  <span style={{ fontSize: '12px', opacity: 0.8 }}><Activity size={12} style={{display:'inline'}}/> Auto-managed by Policy Engine</span>
                </div>

                <div className="holdings-card" style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                   <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '10px', display: 'block' }}>Current Positions</span>
                   <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                     {data.positions && Object.keys(data.positions).length > 0 ? (
                       Object.entries(data.positions).map(([sym, shares]) => (
                         <div key={sym} style={{ background: 'white', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)', fontSize: '14px', fontWeight: 'bold' }}>
                           <span style={{ color: 'var(--brand-primary)' }}>{sym}</span>: {shares} shs
                         </div>
                       ))
                     ) : (
                       <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>No open positions.</span>
                     )}
                   </div>
                </div>
              </div>
            </div>

            <div className="logs-section" style={{ marginTop: '20px', background: '#0f172a', borderRadius: '10px', padding: '16px', color: '#10b981', fontFamily: 'monospace', fontSize: '13px', maxHeight: '150px', overflowY: 'auto' }}>
              <h4 style={{ color: '#fff', margin: '0 0 10px 0', fontSize: '14px' }}>Execution Terminal</h4>
              {data.logs?.map((log, i) => (
                <div key={i} style={{ marginBottom: '4px' }}>{`> ${log}`}</div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* JSON Viewer Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FileJson size={18} className="modal-icon"/> {latestTargetFile?.filename}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <pre className="json-code-block">
                <code>{latestTargetFile?.raw_json}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
