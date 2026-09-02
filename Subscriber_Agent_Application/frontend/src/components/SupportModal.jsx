import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Send, CheckCircle2, Clock, AlertCircle, Plus, ChevronLeft, Headphones, LifeBuoy, BookOpen } from 'lucide-react';

const SupportModal = ({ username, onClose }) => {
  const [queries, setQueries] = useState([]);
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  // UI State
  const [view, setView] = useState('list'); // 'list' or 'new'
  const [activeMenu, setActiveMenu] = useState('tickets'); // 'tickets', 'faq', etc. (for visual flavor)

  const fetchQueries = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/auth/subscriber/queries/', {
        headers: { 'X-Username': username }
      });
      if (res.ok) {
        const data = await res.json();
        setQueries(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (username) {
      fetchQueries();
    }
  }, [username]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newSubject || !newMessage) return;
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/auth/subscriber/queries/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Username': username
        },
        body: JSON.stringify({ subject: newSubject, message: newMessage })
      });
      if (res.ok) {
        setNewSubject('');
        setNewMessage('');
        await fetchQueries();
        setView('list'); // Go back to list after submit
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(20px)', zIndex: 9999
    }}>
      <div style={{
        background: '#090e17', 
        borderRadius: '24px', 
        width: '95vw', 
        maxWidth: '1200px', 
        height: '90vh',
        display: 'flex', 
        overflow: 'hidden', 
        boxShadow: '0 40px 80px -20px rgba(0, 0, 0, 1), inset 0 1px 0 rgba(255,255,255,0.05)', 
        border: '1px solid rgba(255, 255, 255, 0.1)',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        
        {/* Sidebar */}
        <div style={{
          width: '280px', 
          background: 'rgba(15, 23, 42, 0.6)', 
          borderRight: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', 
          flexDirection: 'column',
          padding: '24px 0'
        }}>
          <div style={{padding: '0 24px', marginBottom: '32px'}}>
            <h2 style={{margin: 0, fontSize: '20px', fontWeight: '800', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px'}}>
              <div style={{background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', padding: '6px', borderRadius: '8px', display: 'flex'}}>
                <LifeBuoy size={20} color="#fff" />
              </div>
              Help Center
            </h2>
          </div>
          
          <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 16px'}}>
            <button 
              onClick={() => { setActiveMenu('tickets'); setView('list'); }}
              style={{
                background: activeMenu === 'tickets' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                border: 'none', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px',
                color: activeMenu === 'tickets' ? '#818cf8' : '#94a3b8', fontWeight: '600', fontSize: '15px', cursor: 'pointer',
                transition: 'all 0.2s', textAlign: 'left'
              }}
              onMouseOver={(e) => { if(activeMenu !== 'tickets') e.currentTarget.style.color = '#e2e8f0' }}
              onMouseOut={(e) => { if(activeMenu !== 'tickets') e.currentTarget.style.color = '#94a3b8' }}
            >
              <MessageSquare size={18} /> My Tickets
            </button>
            <button 
              onClick={() => { setActiveMenu('new'); setView('new'); }}
              style={{
                background: activeMenu === 'new' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                border: 'none', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px',
                color: activeMenu === 'new' ? '#818cf8' : '#94a3b8', fontWeight: '600', fontSize: '15px', cursor: 'pointer',
                transition: 'all 0.2s', textAlign: 'left'
              }}
              onMouseOver={(e) => { if(activeMenu !== 'new') e.currentTarget.style.color = '#e2e8f0' }}
              onMouseOut={(e) => { if(activeMenu !== 'new') e.currentTarget.style.color = '#94a3b8' }}
            >
              <Plus size={18} /> Submit Request
            </button>
            <div style={{height: '1px', background: 'rgba(255,255,255,0.05)', margin: '12px 0'}}></div>
            <button 
              style={{
                background: 'transparent', border: 'none', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px',
                color: '#64748b', fontWeight: '600', fontSize: '15px', cursor: 'not-allowed', textAlign: 'left', opacity: 0.5
              }}
            >
              <BookOpen size={18} /> Knowledge Base (Soon)
            </button>
          </div>
          
          <div style={{padding: '0 24px', marginTop: 'auto'}}>
            <div style={{background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px'}}>
              <div style={{width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700'}}>
                {username.charAt(0).toUpperCase()}
              </div>
              <div style={{overflow: 'hidden'}}>
                <p style={{margin: 0, color: '#e2e8f0', fontSize: '14px', fontWeight: '600', whiteSpace: 'nowrap', textOverflow: 'ellipsis'}}>{username}</p>
                <p style={{margin: 0, color: '#64748b', fontSize: '12px'}}>Subscriber</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', position: 'relative'}}>
          
          {/* Top Bar */}
          <div style={{display: 'flex', justifyContent: 'flex-end', padding: '24px 32px'}}>
            <button onClick={onClose} style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', 
              width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
              cursor: 'pointer', color: '#94a3b8', transition: 'all 0.2s',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'scale(1.05)' }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.transform = 'scale(1)' }}
            >
              <X size={20}/>
            </button>
          </div>
          
          <div style={{flex: 1, overflowY: 'auto', padding: '0 64px 64px 64px'}}>
            
            {view === 'new' && (
              <div style={{maxWidth: '700px', margin: '0 auto'}}>
                <div style={{marginBottom: '40px'}}>
                  <h1 style={{margin: '0 0 12px 0', color: '#f8fafc', fontSize: '36px', fontWeight: '800', letterSpacing: '-1px'}}>Submit a Request</h1>
                  <p style={{margin: 0, color: '#94a3b8', fontSize: '16px', lineHeight: '1.6'}}>Describe your issue in detail. Our support engineers will get back to you directly through this portal.</p>
                </div>
                
                <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
                  <div>
                    <label style={{display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '700', marginBottom: '10px', letterSpacing: '0.5px', textTransform: 'uppercase'}}>Ticket Subject</label>
                    <input 
                      type="text" 
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      placeholder="e.g., Target not syncing correctly" 
                      required
                      style={{
                        width: '100%', padding: '20px', borderRadius: '16px', 
                        background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.1)', 
                        color: '#f8fafc', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                        fontSize: '16px', transition: 'border 0.2s, box-shadow 0.2s'
                      }}
                      onFocus={(e) => {
                        e.target.style.border = '1px solid #6366f1';
                        e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.15)';
                      }}
                      onBlur={(e) => {
                        e.target.style.border = '1px solid rgba(255,255,255,0.1)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <div>
                    <label style={{display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '700', marginBottom: '10px', letterSpacing: '0.5px', textTransform: 'uppercase'}}>Issue Description</label>
                    <textarea 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Please provide as much detail as possible..." 
                      required
                      rows="10"
                      style={{
                        width: '100%', padding: '20px', borderRadius: '16px', 
                        background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.1)', 
                        color: '#f8fafc', outline: 'none', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box',
                        fontSize: '16px', transition: 'border 0.2s, box-shadow 0.2s', lineHeight: '1.6'
                      }}
                      onFocus={(e) => {
                        e.target.style.border = '1px solid #6366f1';
                        e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.15)';
                      }}
                      onBlur={(e) => {
                        e.target.style.border = '1px solid rgba(255,255,255,0.1)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '16px'}}>
                    <button type="submit" disabled={loading} style={{
                      background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
                      color: 'white', border: 'none', padding: '18px 36px', borderRadius: '14px', 
                      fontWeight: '700', fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer', 
                      display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 25px rgba(79, 70, 229, 0.4)',
                      transition: 'transform 0.1s, opacity 0.2s',
                      opacity: loading ? 0.7 : 1
                    }}
                    onMouseDown={(e) => {if(!loading) e.currentTarget.style.transform = 'scale(0.97)'}}
                    onMouseUp={(e) => {if(!loading) e.currentTarget.style.transform = 'scale(1)'}}
                    onMouseLeave={(e) => {if(!loading) e.currentTarget.style.transform = 'scale(1)'}}
                    >
                      <Send size={18} /> {loading ? 'Submitting Request...' : 'Send Secure Message'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {view === 'list' && (
              <div style={{maxWidth: '900px', margin: '0 auto'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px'}}>
                  <div>
                    <h1 style={{margin: '0 0 12px 0', color: '#f8fafc', fontSize: '36px', fontWeight: '800', letterSpacing: '-1px'}}>Ticket History</h1>
                    <p style={{margin: 0, color: '#94a3b8', fontSize: '16px', lineHeight: '1.6'}}>Track your support requests and view admin responses here.</p>
                  </div>
                  <button 
                    onClick={() => { setActiveMenu('new'); setView('new'); }}
                    style={{
                      background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.2)',
                      padding: '12px 24px', borderRadius: '12px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', 
                      transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)'; e.currentTarget.style.color = '#a5b4fc'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)'; e.currentTarget.style.color = '#818cf8'; e.currentTarget.style.transform = 'translateY(0)' }}
                  >
                    <Plus size={16} /> New Request
                  </button>
                </div>

                {queries.length === 0 ? (
                  <div style={{
                    textAlign: 'center', padding: '100px 20px', background: 'rgba(30, 41, 59, 0.3)', 
                    borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)'
                  }}>
                    <div style={{width: '96px', height: '96px', background: 'rgba(255,255,255,0.02)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto', border: '1px solid rgba(255,255,255,0.05)'}}>
                      <Headphones size={40} color="#64748b" />
                    </div>
                    <h5 style={{margin: '0 0 12px 0', color: '#f8fafc', fontSize: '24px', fontWeight: '800'}}>How can we help?</h5>
                    <p style={{margin: '0 0 32px 0', color: '#94a3b8', fontSize: '16px', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto', lineHeight: '1.6'}}>You haven't submitted any support requests yet. If you run into issues, let us know!</p>
                    <button onClick={() => { setActiveMenu('new'); setView('new'); }} style={{
                      background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: '#fff', border: 'none',
                      padding: '16px 32px', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', 
                      transition: '0.2s', boxShadow: '0 8px 20px rgba(79, 70, 229, 0.3)'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.05)' }}
                    onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
                    >
                      Create your first ticket
                    </button>
                  </div>
                ) : (
                  <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
                    {queries.map(q => (
                      <div key={q.id} style={{
                        background: 'rgba(30, 41, 59, 0.4)',
                        border: '1px solid rgba(255,255,255,0.05)', 
                        borderRadius: '24px', 
                        overflow: 'hidden',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(30, 41, 59, 0.7)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 15px 30px -10px rgba(0,0,0,0.5)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'rgba(30, 41, 59, 0.4)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      >
                        <div style={{padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '32px'}}>
                          <div style={{flex: 1}}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px'}}>
                              <h3 style={{margin: 0, color: '#f8fafc', fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px'}}>{q.subject}</h3>
                            </div>
                            <p style={{color: '#94a3b8', fontSize: '16px', margin: 0, lineHeight: '1.6'}}>{q.message}</p>
                          </div>
                          
                          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0}}>
                            <span style={{
                              padding: '8px 16px', 
                              borderRadius: '99px', 
                              fontSize: '13px', 
                              fontWeight: '800',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              background: q.status === 'RESOLVED' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)', 
                              color: q.status === 'RESOLVED' ? '#4ade80' : '#fbbf24',
                              border: q.status === 'RESOLVED' ? '1px solid rgba(74, 222, 128, 0.2)' : '1px solid rgba(251, 191, 36, 0.2)',
                              textTransform: 'uppercase',
                              letterSpacing: '1px'
                            }}>
                              {q.status === 'RESOLVED' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                              {q.status}
                            </span>
                          </div>
                        </div>
                        
                        {q.reply && (
                          <div style={{
                            padding: '24px 32px', 
                            background: 'rgba(99, 102, 241, 0.05)', 
                            borderTop: '1px solid rgba(99, 102, 241, 0.1)',
                            display: 'flex',
                            gap: '20px'
                          }}>
                            <div style={{width: '4px', background: 'linear-gradient(to bottom, #818cf8, #6366f1)', borderRadius: '4px'}}></div>
                            <div>
                              <strong style={{color: '#818cf8', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800'}}>
                                <AlertCircle size={16} /> Official Response
                              </strong>
                              <p style={{color: '#e2e8f0', fontSize: '16px', margin: 0, lineHeight: '1.6'}}>{q.reply}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportModal;
