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
          <div className="glass-card advisory-card" style={{ borderColor: markedDone ? '#22c55e' : '#3b82f6', transition: 'border-color 0.5s ease' }}>
            <div className="advisory-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={28} color="#22c55e" />
                <div>
                  <h2 style={{ margin: 0, color: 'white' }}>Today's Verified Targets</h2>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>Session: {document.effective_session}</span>
                </div>
              </div>
              <button className="btn-secondary btn-sm" onClick={() => setShowModal(true)}>
                <FileJson size={16} style={{marginRight: '6px'}}/> View Signed JSON
              </button>
            </div>

            <div className="rationale-box" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '15px', borderRadius: '8px', marginBottom: '25px' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity size={16} /> Market Rationale
              </h4>
              <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.5' }}>{rationale}</p>
            </div>

            <h3 style={{ marginBottom: '15px', color: '#e2e8f0' }}>Target Allocations</h3>
            <div className="pos-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
              {Object.entries(targets).map(([sym, pct], idx) => (
                <div key={sym} className="pos-item" style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="pos-info" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="pos-avatar" style={{ background: '#3b82f6', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>
                      {sym.substring(0, 1)}
                    </div>
                    <span className="pos-sym" style={{ fontSize: '18px', fontWeight: 'bold' }}>{sym}</span>
                  </div>
                  <div className="pos-qty" style={{ textAlign: 'right' }}>
                    <span className="qty-val" style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff' }}>{pct}%</span>
                  </div>
                </div>
              ))}
              {cashPct > 0 && (
                <div className="pos-item" style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="pos-info" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="pos-avatar" style={{ background: '#22c55e', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>
                      $
                    </div>
                    <span className="pos-sym" style={{ fontSize: '18px', fontWeight: 'bold', color: '#22c55e' }}>CASH</span>
                  </div>
                  <div className="pos-qty" style={{ textAlign: 'right' }}>
                    <span className="qty-val" style={{ fontSize: '20px', fontWeight: 'bold', color: '#22c55e' }}>{cashPct}%</span>
                  </div>
                </div>
              )}
            </div>

            <div className="action-box" style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#94a3b8', fontSize: '14px' }}>
                <Activity size={16} color="#f59e0b" />
                <span>Execute these targets manually on your preferred broker.</span>
              </div>
              <button 
                className={markedDone ? "btn-success" : "btn-primary"} 
                onClick={() => setMarkedDone(true)}
                style={{ padding: '12px 24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: markedDone ? 'default' : 'pointer', background: markedDone ? '#22c55e' : '', color: 'white', border: 'none', borderRadius: '6px' }}
                disabled={markedDone}
              >
                {markedDone ? <><CheckCircle2 size={18}/> Acknowledged</> : "Mark as Executed"}
              </button>
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
