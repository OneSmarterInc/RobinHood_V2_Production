import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw, Power, Server, FileJson, X, CheckCircle2, Calendar, ChevronLeft, ChevronRight, Settings, Key, Briefcase, TrendingUp, MessageSquare } from 'lucide-react';


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



const BrokerModal = ({ token, onClose, onBrokerSwitched }) => {
  const [brokers, setBrokers] = useState({});
  const [activeBroker, setActiveBroker] = useState("");
  const [loading, setLoading] = useState(false);
  const [newBroker, setNewBroker] = useState({ id: "", type: "alpaca", label: "", api_key: "", api_secret: "", username: "", password: "", cash_usd: 50000 });
  const [showAdd, setShowAdd] = useState(false);

  const fetchBrokers = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8001/api/brokers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBrokers(data.brokers || {});
        setActiveBroker(data.active || "");
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchBrokers();
  }, [token]);

  const switchBroker = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8001/api/brokers/active?broker_id=${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setActiveBroker(id);
        if (onBrokerSwitched) onBrokerSwitched();
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const addBroker = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8001/api/brokers', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(newBroker)
      });
      if (res.ok) {
        setShowAdd(false);
        fetchBrokers();
        setNewBroker({ id: "", type: "alpaca", label: "", api_key: "", api_secret: "", username: "", password: "", cash_usd: 50000 });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getIconForType = (type) => {
    switch(type) {
      case 'alpaca': return <Activity size={18} color="#4f46e5" />;
      case 'robinhood': return <TrendingUp size={18} color="#10b981" />;
      default: return <Briefcase size={18} color="#64748b" />;
    }
  };

  const inputStyle = {
    display: 'block', 
    width: '100%', 
    padding: '10px 12px', 
    border: '1px solid #cbd5e1', 
    borderRadius: '6px', 
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    color: '#475569',
    marginBottom: '6px'
  };

  const formGroup = { marginBottom: '16px' };

  return (
    <div className="modal-overlay" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(6px)', zIndex: 1000}}>
      <div style={{background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', fontFamily: 'Inter, system-ui, sans-serif'}}>
        
        {/* Header */}
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #e2e8f0'}}>
          <div>
            <h3 style={{margin: 0, fontSize: '20px', fontWeight: '600', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px'}}>
              <Settings size={22} color="#4f46e5"/> Broker Integrations
            </h3>
            <p style={{margin: '4px 0 0 0', fontSize: '13px', color: '#64748b'}}>Manage your connected brokerage accounts</p>
          </div>
          <button onClick={onClose} style={{background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b'}}>
            <X size={18}/>
          </button>
        </div>
        
        <div style={{padding: '24px'}}>
          {/* Connected Brokers List */}
          <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
            {Object.entries(brokers).map(([id, b]) => (
              <div key={id} style={{
                padding: '20px', 
                background: activeBroker === id ? '#f8fafc' : '#ffffff',
                border: activeBroker === id ? '2px solid #4f46e5' : '1px solid #e2e8f0', 
                borderRadius: '12px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                transition: 'all 0.2s ease',
                boxShadow: activeBroker === id ? '0 4px 6px -1px rgba(79, 70, 229, 0.1)' : 'none'
              }}>
                <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                  <div style={{width: '48px', height: '48px', borderRadius: '12px', background: activeBroker === id ? '#e0e7ff' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    {getIconForType(b.type)}
                  </div>
                  <div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px'}}>
                      <h4 style={{margin: 0, fontSize: '16px', fontWeight: '600', color: '#0f172a'}}>{b.label}</h4>
                      {activeBroker === id && (
                        <span style={{fontSize: '11px', fontWeight: '600', color: '#4f46e5', background: '#e0e7ff', padding: '2px 8px', borderRadius: '12px'}}>ACTIVE</span>
                      )}
                    </div>
                    <div style={{fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px'}}>
                      <span style={{textTransform: 'capitalize', fontWeight: '500'}}>{b.type}</span> &bull; 
                      <span style={{fontFamily: 'monospace'}}>{id}</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  disabled={activeBroker === id || loading} 
                  onClick={() => switchBroker(id)} 
                  style={{
                    padding: '8px 16px', 
                    background: activeBroker === id ? '#ffffff' : '#f1f5f9', 
                    color: activeBroker === id ? '#cbd5e1' : '#0f172a', 
                    border: activeBroker === id ? '1px solid #e2e8f0' : 'none', 
                    borderRadius: '8px', 
                    cursor: activeBroker === id ? 'not-allowed' : 'pointer', 
                    fontWeight: '600',
                    fontSize: '13px',
                    transition: 'all 0.2s ease'
                  }}>
                  {activeBroker === id ? 'Connected' : 'Connect'}
                </button>
              </div>
            ))}
          </div>
          
          {/* Add Broker Form */}
          {showAdd ? (
            <div style={{marginTop: '24px', padding: '24px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px'}}>
                <div style={{width: '32px', height: '32px', background: '#e0e7ff', color: '#4f46e5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <Key size={16} />
                </div>
                <h4 style={{margin: 0, fontSize: '16px', fontWeight: '600'}}>Configure New Broker</h4>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px'}}>
                <div style={formGroup}>
                  <label style={labelStyle}>Connection ID</label>
                  <input placeholder="e.g. alpaca_main" style={inputStyle} value={newBroker.id} onChange={e => setNewBroker({...newBroker, id: e.target.value})} />
                </div>
                <div style={formGroup}>
                  <label style={labelStyle}>Provider</label>
                  <select style={{...inputStyle, background: '#fff', cursor: 'pointer'}} value={newBroker.type} onChange={e => setNewBroker({...newBroker, type: e.target.value})}>
                    <option value="alpaca">Alpaca (API)</option>
                    <option value="robinhood">Robinhood</option>
                    <option value="mock">Paper Simulator</option>
                  </select>
                </div>
              </div>

              <div style={formGroup}>
                <label style={labelStyle}>Display Label</label>
                <input placeholder="e.g. My Personal Alpaca" style={inputStyle} value={newBroker.label} onChange={e => setNewBroker({...newBroker, label: e.target.value})} />
              </div>

              <div style={{height: '1px', background: '#e2e8f0', margin: '20px 0'}}></div>

              {newBroker.type === 'alpaca' && (
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                  <div style={formGroup}>
                    <label style={labelStyle}>API Key</label>
                    <input placeholder="PK..." style={inputStyle} value={newBroker.api_key} onChange={e => setNewBroker({...newBroker, api_key: e.target.value})} />
                  </div>
                  <div style={formGroup}>
                    <label style={labelStyle}>API Secret</label>
                    <input placeholder="Secret Key" type="password" style={inputStyle} value={newBroker.api_secret} onChange={e => setNewBroker({...newBroker, api_secret: e.target.value})} />
                  </div>
                </div>
              )}

              {newBroker.type === 'robinhood' && (
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                  <div style={formGroup}>
                    <label style={labelStyle}>Username / Email</label>
                    <input placeholder="user@example.com" style={inputStyle} value={newBroker.username} onChange={e => setNewBroker({...newBroker, username: e.target.value})} />
                  </div>
                  <div style={formGroup}>
                    <label style={labelStyle}>Password</label>
                    <input placeholder="ΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇó" type="password" style={inputStyle} value={newBroker.password} onChange={e => setNewBroker({...newBroker, password: e.target.value})} />
                  </div>
                </div>
              )}

              <div style={{display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px'}}>
                <button onClick={() => setShowAdd(false)} style={{padding: '10px 16px', background: 'transparent', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', fontSize: '14px'}}>
                  Cancel
                </button>
                <button onClick={addBroker} style={{padding: '10px 20px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', fontSize: '14px', boxShadow: '0 2px 4px rgba(79, 70, 229, 0.2)'}}>
                  Save Connection
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowAdd(true)} style={{marginTop: '24px', width: '100%', padding: '16px', background: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s ease'}}>
              <span style={{fontSize: '20px', display: 'flex'}}>+</span> Add New Broker Connection
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


import SupportModal from './SupportModal';

const Dashboard = ({ token, username, onLogout }) => {
  const [data, setData] = useState({
    status: 'SYSTEM ACTIVE',
    logs: ['Waiting for automated sync...'],
    latest_document: null
  });

  const [latestTargetFile, setLatestTargetFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showBrokerModal, setShowBrokerModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
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
          <h2>One Smarter</h2>
        </div>
        
        <div className="sidebar-menu">
          <button className="btn-secondary" onClick={forceSync}>
            <RefreshCw size={16} /> Sync Signals
          </button>
          <button className="btn-secondary" onClick={() => setShowCalendarModal(true)} style={{marginTop: '10px'}}>
            <Calendar size={16} /> Market Calendar
          </button>
          <button className="btn-secondary" onClick={() => setShowBrokerModal(true)} style={{marginTop: '10px'}}>
            <Settings size={16} /> Broker Setup
          </button>
          <button className="btn-secondary" onClick={() => setShowSupportModal(true)} style={{marginTop: '10px', background: '#3b82f6', color: 'white'}}>
            <MessageSquare size={16} /> Support Tickets
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
      {showBrokerModal && <BrokerModal token={token} onClose={() => setShowBrokerModal(false)} onBrokerSwitched={fetchStatus} />}
      {showCalendarModal && <CalendarModal token={token} onClose={() => setShowCalendarModal(false)} />}
      {showSupportModal && <SupportModal username={username} onClose={() => setShowSupportModal(false)} />}
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
