import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Send, CheckCircle, ArrowLeft, Clock, MessageSquare, User, Search, RefreshCw, Mail, ChevronLeft, ChevronRight } from 'lucide-react';

export default function QueriesPage() {
  const [queries, setQueries] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchQueries = async (showRefresh = false, page = 1) => {
    if (showRefresh) setIsRefreshing(true);
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/v1/auth/admin/queries/?page=${page}`, { 
        headers: { Authorization: `Token ${localStorage.getItem('adminToken')}` } 
      });
      setQueries(res.data.results);
      setTotalItems(res.data.count);
      setTotalPages(Math.ceil(res.data.count / 50)); // Matching backend page_size = 50
      
      // Update selected query if it's currently open
      if (selectedQuery) {
        const updated = res.data.results.find(q => q.id === selectedQuery.id);
        if (updated) setSelectedQuery(updated);
      }
    } catch (err) {
      console.error(err);
    }
    if (showRefresh) {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  useEffect(() => { 
    fetchQueries(false, currentPage);
    const interval = setInterval(() => fetchQueries(false, currentPage), 10000); // Auto refresh every 10s for new tickets
    return () => clearInterval(interval);
  }, [currentPage]); // Re-run when page changes

  const handleReply = async () => {
    if (!replyText.trim() || !selectedQuery) return;
    setLoading(true);
    try {
      await axios.post(`http://127.0.0.1:8000/api/v1/auth/admin/queries/${selectedQuery.id}/reply/`, {
        reply: replyText
      }, { headers: { Authorization: `Token ${localStorage.getItem('adminToken')}` } });
      setReplyText('');
      await fetchQueries(false, currentPage);
    } catch (err) {
      alert("Failed to send reply");
    }
    setLoading(false);
  };

  const filteredQueries = queries.filter(q => 
    q.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
    q.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) {
      return d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }
    return d.toLocaleDateString([], {month: 'short', day: 'numeric'});
  };

  const gradients = [
    'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
    'linear-gradient(135deg, #14b8a6 0%, #0ea5e9 100%)',
    'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
    'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
  ];
  
  const getAvatarGradient = (name) => {
    if (!name) return gradients[0];
    return gradients[name.charCodeAt(0) % gradients.length];
  };

  if (selectedQuery) {
    return (
      <div style={{display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', borderRadius: '16px', boxShadow: '0 20px 40px -10px rgba(79, 70, 229, 0.15)', border: '1px solid #eef2ff', overflow: 'hidden'}}>
        {/* Detail Toolbar */}
        <div style={{padding: '16px 24px', borderBottom: '1px solid #eef2ff', display: 'flex', alignItems: 'center', gap: '16px', background: 'linear-gradient(to right, #f8fafc, #eef2ff)'}}>
          <button 
            onClick={() => { setSelectedQuery(null); setReplyText(''); }} 
            style={{background: '#fff', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', color: '#4f46e5', transition: 'all 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'}}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 4px 10px rgba(79, 70, 229, 0.15)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.05)'; }}
          >
            <ArrowLeft size={20} />
          </button>
          <div style={{flex: 1}}>
            <h2 style={{margin: 0, fontSize: '20px', color: '#0f172a', fontWeight: '800'}}>{selectedQuery.subject}</h2>
            <span style={{
              display: 'inline-block',
              marginTop: '8px',
              padding: '4px 12px', 
              borderRadius: '99px', 
              fontSize: '12px', 
              fontWeight: '700',
              background: selectedQuery.status === 'RESOLVED' ? '#dcfce7' : '#fee2e2', 
              color: selectedQuery.status === 'RESOLVED' ? '#166534' : '#991b1b',
              border: selectedQuery.status === 'RESOLVED' ? '1px solid #bbf7d0' : '1px solid #fecaca',
              boxShadow: selectedQuery.status === 'RESOLVED' ? '0 0 10px rgba(22,101,52,0.1)' : '0 0 10px rgba(153,27,27,0.1)'
            }}>
              {selectedQuery.status}
            </span>
          </div>
        </div>

        {/* Conversation Thread */}
        <div style={{flex: 1, overflowY: 'auto', padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: '32px', background: '#fafcff'}}>
          
          {/* User Message */}
          <div style={{display: 'flex', gap: '16px'}}>
            <div style={{width: '44px', height: '44px', borderRadius: '12px', background: getAvatarGradient(selectedQuery.username), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)'}}>
              {selectedQuery.username.charAt(0).toUpperCase()}
            </div>
            <div style={{flex: 1}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px'}}>
                <div>
                  <strong style={{color: '#0f172a', fontSize: '16px', fontWeight: '700'}}>{selectedQuery.username}</strong>
                  <span style={{color: '#6366f1', fontSize: '13px', marginLeft: '8px', fontWeight: '600'}}>@{selectedQuery.username}</span>
                </div>
                <span style={{color: '#94a3b8', fontSize: '13px', fontWeight: '500'}}>{new Date(selectedQuery.created_at).toLocaleString()}</span>
              </div>
              <div style={{color: '#334155', fontSize: '15px', lineHeight: '1.6', whiteSpace: 'pre-wrap', background: '#fff', padding: '20px 24px', borderRadius: '0 16px 16px 16px', border: '1px solid #eef2ff', boxShadow: '0 2px 10px rgba(0,0,0,0.02)'}}>
                {selectedQuery.message}
              </div>
            </div>
          </div>

          {/* Admin Reply (if exists) */}
          {selectedQuery.reply && (
            <div style={{display: 'flex', gap: '16px'}}>
              <div style={{width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(16,185,129,0.2)'}}>
                <User size={22} />
              </div>
              <div style={{flex: 1}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px'}}>
                  <div>
                    <strong style={{color: '#0f172a', fontSize: '16px', fontWeight: '700'}}>System Admin</strong>
                    <span style={{color: '#10b981', fontSize: '13px', marginLeft: '8px', fontWeight: '600'}}>Staff</span>
                  </div>
                </div>
                <div style={{color: '#064e3b', fontSize: '15px', lineHeight: '1.6', whiteSpace: 'pre-wrap', background: '#ecfdf5', padding: '20px 24px', borderRadius: '0 16px 16px 16px', border: '1px solid #a7f3d0', boxShadow: '0 2px 10px rgba(16,185,129,0.05)'}}>
                  {selectedQuery.reply}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Reply Box */}
        {selectedQuery.status === 'PENDING' && (
          <div style={{padding: '24px 40px', background: '#fff', borderTop: '1px solid #eef2ff', boxShadow: '0 -4px 10px rgba(0,0,0,0.02)'}}>
            <textarea 
              placeholder="Type your official reply here..." 
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              style={{
                width: '100%', padding: '20px', borderRadius: '16px', border: '2px solid #e2e8f0', outline: 'none', 
                resize: 'vertical', minHeight: '120px', fontFamily: 'inherit', fontSize: '15px', marginBottom: '16px', 
                boxSizing: 'border-box', background: '#f8fafc', transition: 'all 0.2s', color: '#0f172a'
              }}
              onFocus={(e) => {
                e.target.style.border = '2px solid #6366f1';
                e.target.style.background = '#fff';
                e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.border = '2px solid #e2e8f0';
                e.target.style.background = '#f8fafc';
                e.target.style.boxShadow = 'none';
              }}
            />
            <div style={{display: 'flex', justifyContent: 'flex-end'}}>
              <button 
                onClick={handleReply}
                disabled={loading || !replyText.trim()}
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: '#fff', border: 'none', 
                  padding: '14px 28px', borderRadius: '12px', fontWeight: '700', cursor: (loading || !replyText.trim()) ? 'not-allowed' : 'pointer', 
                  display: 'flex', alignItems: 'center', gap: '8px', opacity: (loading || !replyText.trim()) ? 0.6 : 1,
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)', transition: 'transform 0.1s'
                }}
                onMouseOver={(e) => { if(!(loading || !replyText.trim())) e.currentTarget.style.transform = 'scale(1.02)' }}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Send size={18} /> {loading ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{height: '100%', overflowY: 'auto', padding: '4px'}}>
      <div className="header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px'}}>
        <div>
          <h1 style={{
            margin: '0 0 8px 0', 
            fontSize: '32px', 
            fontWeight: '800', 
            letterSpacing: '-1px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #ec4899 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Support Desk
          </h1>
          <p style={{margin: 0, color: '#64748b', fontSize: '15px', fontWeight: '500'}}>Manage and resolve issues raised by subscribers.</p>
        </div>
        <div style={{display: 'flex', gap: '16px'}}>
          <div style={{position: 'relative'}}>
            <Search size={18} color="#8b5cf6" style={{position: 'absolute', left: '16px', top: '13px'}} />
            <input 
              type="text" 
              placeholder="Search tickets..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '12px 20px 12px 44px', borderRadius: '99px', border: 'none', 
                outline: 'none', width: '280px', fontSize: '14px', background: '#fff',
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)', transition: 'all 0.2s', fontWeight: '500', color: '#0f172a'
              }}
              onFocus={(e) => {
                e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.2), 0 4px 15px rgba(0,0,0,0.05)';
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)';
              }}
            />
          </div>
          <button 
            onClick={() => fetchQueries(true, currentPage)}
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', border: 'none', borderRadius: '99px', padding: '0 24px', 
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff',
              fontWeight: '700', fontSize: '14px', transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.3)';
            }}
          >
            <RefreshCw size={16} className={isRefreshing ? 'spin' : ''} color="#fff" /> Refresh
          </button>
        </div>
      </div>

      <div style={{background: '#fff', borderRadius: '20px', boxShadow: '0 20px 40px -10px rgba(79, 70, 229, 0.15)', overflow: 'hidden', border: '1px solid #eef2ff'}}>
        {/* Table Header */}
        <div style={{display: 'flex', padding: '20px 24px', borderBottom: '1px solid #eef2ff', background: 'linear-gradient(to right, #f8fafc, #eef2ff)', color: '#4f46e5', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px'}}>
          <div style={{width: '25%'}}>Subscriber</div>
          <div style={{flex: 1}}>Subject & Message</div>
          <div style={{width: '15%', textAlign: 'center'}}>Status</div>
          <div style={{width: '15%', textAlign: 'right'}}>Received</div>
        </div>

        {/* Table Body */}
        {filteredQueries.length === 0 ? (
          <div style={{padding: '80px', textAlign: 'center', color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <div style={{width: '100px', height: '100px', background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', boxShadow: '0 10px 20px rgba(99, 102, 241, 0.1)'}}>
              <Mail size={48} color="#6366f1" />
            </div>
            <h3 style={{margin: '0 0 8px 0', color: '#0f172a', fontSize: '20px', fontWeight: '800'}}>No tickets found</h3>
            <p style={{margin: 0, fontSize: '15px', fontWeight: '500'}}>You're all caught up! Great job.</p>
          </div>
        ) : (
          <div style={{display: 'flex', flexDirection: 'column'}}>
            {filteredQueries.map((q, idx) => {
              const isUnread = q.status === 'PENDING';
              return (
                <div 
                  key={q.id} 
                  onClick={() => setSelectedQuery(q)}
                  style={{
                    display: 'flex', 
                    padding: '20px 24px', 
                    borderBottom: idx === filteredQueries.length - 1 ? 'none' : '1px solid #f1f5f9',
                    cursor: 'pointer',
                    background: isUnread ? '#fff' : '#fafaf9',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    alignItems: 'center',
                    borderLeft: isUnread ? '4px solid #6366f1' : '4px solid transparent',
                    position: 'relative'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#f8fafc';
                    if (!isUnread) e.currentTarget.style.borderLeft = '4px solid #cbd5e1';
                    e.currentTarget.style.paddingLeft = '28px';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = isUnread ? '#fff' : '#fafaf9';
                    e.currentTarget.style.borderLeft = isUnread ? '4px solid #6366f1' : '4px solid transparent';
                    e.currentTarget.style.paddingLeft = '24px';
                  }}
                >
                  {/* Subscriber Column */}
                  <div style={{width: '25%', display: 'flex', alignItems: 'center', gap: '16px'}}>
                    <div style={{position: 'relative'}}>
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '12px', 
                        background: getAvatarGradient(q.username), 
                        color: '#fff', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        fontSize: '18px', fontWeight: '800',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                      }}>
                        {q.username.charAt(0).toUpperCase()}
                      </div>
                      {isUnread && (
                        <div style={{
                          position: 'absolute', top: '-4px', right: '-4px', width: '14px', height: '14px', 
                          background: '#ef4444', border: '3px solid #fff', borderRadius: '50%',
                          boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.3)'
                        }}></div>
                      )}
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                      <strong style={{color: '#0f172a', fontSize: '15px', fontWeight: '700'}}>{q.username}</strong>
                      <span style={{color: '#8b5cf6', fontSize: '13px', fontWeight: '600'}}>@{q.username}</span>
                    </div>
                  </div>
                  
                  {/* Subject Column */}
                  <div style={{flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', paddingRight: '24px'}}>
                    <strong style={{color: '#0f172a', fontSize: '15px', marginBottom: '6px', fontWeight: isUnread ? '800' : '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{q.subject}</strong>
                    <span style={{color: '#64748b', fontSize: '14px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{q.message}</span>
                  </div>
                  
                  {/* Status Column */}
                  <div style={{width: '15%', display: 'flex', justifyContent: 'center'}}>
                    <span style={{
                      padding: '6px 14px', 
                      borderRadius: '99px', 
                      fontSize: '12px', 
                      fontWeight: '800',
                      background: q.status === 'RESOLVED' ? '#dcfce7' : '#fef2f2', 
                      color: q.status === 'RESOLVED' ? '#166534' : '#ef4444',
                      border: q.status === 'RESOLVED' ? '1px solid #bbf7d0' : '1px solid #fecaca',
                      boxShadow: q.status === 'RESOLVED' ? '0 0 10px rgba(22,101,52,0.1)' : '0 0 10px rgba(239,68,68,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {q.status === 'RESOLVED' ? <CheckCircle size={14} /> : <Clock size={14} />}
                      {q.status}
                    </span>
                  </div>
                  
                  {/* Date Column */}
                  <div style={{width: '15%', textAlign: 'right', color: isUnread ? '#4f46e5' : '#94a3b8', fontWeight: isUnread ? '700' : '600', fontSize: '13px'}}>
                    {formatTime(q.created_at)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 32px', borderTop: '1px solid #eef2ff', background: '#f8fafc'}}>
            <div style={{fontSize: '14px', color: '#64748b', fontWeight: '600'}}>
              Showing page <strong style={{color: '#4f46e5'}}>{currentPage}</strong> of <strong style={{color: '#0f172a'}}>{totalPages}</strong> <span style={{opacity: 0.5}}>({totalItems} total tickets)</span>
            </div>
            <div style={{display: 'flex', gap: '8px'}}>
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 16px', 
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', 
                  color: currentPage === 1 ? '#94a3b8' : '#4f46e5', fontWeight: '700', fontSize: '14px',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.05)', transition: 'all 0.2s'
                }}
                onMouseOver={(e) => { if(currentPage !== 1) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <ChevronLeft size={16} strokeWidth={3} /> Prev
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 16px', 
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', 
                  color: currentPage === totalPages ? '#94a3b8' : '#4f46e5', fontWeight: '700', fontSize: '14px',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.05)', transition: 'all 0.2s'
                }}
                onMouseOver={(e) => { if(currentPage !== totalPages) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Next <ChevronRight size={16} strokeWidth={3} />
              </button>
            </div>
          </div>
        )}
      </div>
      
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
