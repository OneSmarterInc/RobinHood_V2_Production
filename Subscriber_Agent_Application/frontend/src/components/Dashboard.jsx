import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw, Power, Server, FileJson, X, CheckCircle2, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';


const CalendarModal = ({ token, onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tradingDays, setTradingDays] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCalendar = async (year, month) => {
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8001/api/calendar?year=${year}&month=${month}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTradingDays(data.trading_days || []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCalendar(currentDate.getFullYear(), currentDate.getMonth() + 1);
  }, [currentDate, token]);

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="modal-overlay" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 1000}}>
      <div style={{
        background: '#ffffff', 
        borderRadius: '12px', 
        width: '100%', 
        maxWidth: '450px', 
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden',
        fontFamily: 'system-ui, sans-serif'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '20px 24px', 
          borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc'
        }}>
          <h3 style={{margin: 0, fontSize: '18px', fontWeight: '600', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px'}}>
            <Calendar size={20} color="#4f46e5" /> NYSE Market Calendar
          </h3>
          <button onClick={onClose} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b'}}>
            <X size={20} />
          </button>
        </div>
        
        {/* Body */}
        <div style={{padding: '24px'}}>
          {/* Navigation */}
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
            <button onClick={prevMonth} style={{
              background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569'
            }}><ChevronLeft size={20}/></button>
            <h4 style={{margin: 0, fontSize: '16px', fontWeight: '600', color: '#1e293b'}}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h4>
            <button onClick={nextMonth} style={{
              background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569'
            }}><ChevronRight size={20}/></button>
          </div>
          
          {/* Calendar Grid */}
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center'}}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} style={{fontWeight: '600', color: '#94a3b8', fontSize: '12px', paddingBottom: '8px', textTransform: 'uppercase'}}>
                {d}
              </div>
            ))}
            
            {days.map((day, idx) => {
              if (day === null) return <div key={idx}></div>;
              const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isOpen = tradingDays.includes(dateStr);
              return (
                <div key={idx} style={{
                  padding: '10px 0',
                  borderRadius: '8px',
                  background: isOpen ? '#e0e7ff' : '#f8fafc',
                  color: isOpen ? '#4f46e5' : '#94a3b8',
                  border: isOpen ? '1px solid #c7d2fe' : '1px dashed #cbd5e1',
                  fontWeight: isOpen ? '600' : '400',
                  fontSize: '14px'
                }}>
                  {day}
                </div>
              );
            })}
          </div>
          
          {/* Legend */}
          <div style={{marginTop: '28px', display: 'flex', gap: '20px', justifyContent: 'center', fontSize: '13px', color: '#64748b', fontWeight: '500'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              <div style={{width: '14px', height: '14px', background: '#e0e7ff', border: '1px solid #c7d2fe', borderRadius: '4px'}}></div> Market Open
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              <div style={{width: '14px', height: '14px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '4px'}}></div> Market Closed
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ token, onLogout }) => {
  const [data, setData] = useState({
    status: 'SYSTEM ACTIVE',
    logs: ['Waiting for automated sync...'],
    latest_document: null
  });

  const [latestTargetFile, setLatestTargetFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
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
          <button className="btn-secondary" onClick={() => setShowCalendarModal(true)} style={{marginTop: '10px'}}>
            <Calendar size={16} /> Market Calendar
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
      {showCalendarModal && <CalendarModal token={token} onClose={() => setShowCalendarModal(false)} />}
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
