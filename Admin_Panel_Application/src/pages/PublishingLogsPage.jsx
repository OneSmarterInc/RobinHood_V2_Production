import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, FileJson, AlertTriangle, Clock, RefreshCw, Search, ChevronLeft, ChevronRight, Activity, Box } from 'lucide-react';

export default function PublishingLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination and Filtering State
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const fetchLogs = () => {
    setLoading(true);
    axios.get('http://127.0.0.1:8000/api/v1/auth/admin/publishing-history/', {
      headers: { Authorization: `Token ${localStorage.getItem('adminToken')}` }
    })
      .then(res => {
        setLogs(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching publishing logs:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filter logs based on search term (date, status, reason)
  const filteredLogs = logs.filter(log => {
    const searchString = `${log.date} ${log.status} ${log.reason}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  // Calculate Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'PUBLISHED':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '99px', fontSize: '13px', fontWeight: '600', backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' }}>
            <span style={{ display: 'block', width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', opacity: 0.8 }}></span>
            Published
          </span>
        );
      case 'SKIPPED':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '99px', fontSize: '13px', fontWeight: '600', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>
            <span style={{ display: 'block', width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', opacity: 0.8 }}></span>
            Skipped
          </span>
        );
      case 'PENDING':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '99px', fontSize: '13px', fontWeight: '600', backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
            <span style={{ display: 'block', width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', opacity: 0.8 }}></span>
            Pending
          </span>
        );
      case 'ERROR':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '99px', fontSize: '13px', fontWeight: '600', backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' }}>
            <span style={{ display: 'block', width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', opacity: 0.8 }}></span>
            Error / Missed
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.3s ease-out' }}>
      
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>Publishing History</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', margin: 0, maxWidth: '600px', lineHeight: '1.5' }}>
            Track the generation of daily JSON targets, including weekends and NYSE holidays.
          </p>
        </div>
        <button 
          className="btn" 
          onClick={fetchLogs} 
          disabled={loading} 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', color: 'var(--text-main)', border: '1px solid var(--border-color)', padding: '10px 20px', borderRadius: '10px', fontWeight: '600', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'all 0.2s' }}
          onMouseOver={e => {e.currentTarget.style.background = '#f8fafc'}}
          onMouseOut={e => {e.currentTarget.style.background = 'white'}}
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} style={loading ? {animation: 'spin 1s linear infinite'} : {}} /> 
          {loading ? 'Syncing...' : 'Refresh Logs'}
        </button>
      </div>

      {/* Main Table Card */}
      <div className="card" style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        
        {/* Table Header / Search */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            Target Logs <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>{filteredLogs.length}</span>
          </h3>
          <div className="search-bar" style={{ position: 'relative', width: '320px' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '12px', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Search date, status, reason..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', fontFamily: 'inherit', fontSize: '14px', transition: 'border-color 0.2s, box-shadow 0.2s', boxSizing: 'border-box' }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
        </div>
        
        {/* Table Content */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--border-color)' }}>Target Date</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--border-color)' }}>Status</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--border-color)' }}>Reason / Notes</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--border-color)' }}>Sequence ID</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--border-color)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                    <Activity style={{ margin: '0 auto', marginBottom: '10px', animation: 'spin 1s linear infinite' }} /> 
                    Loading publishing history...
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                    <Box size={32} style={{ margin: '0 auto', marginBottom: '12px', opacity: 0.5 }} /> 
                    No records found matching your search.
                  </td>
                </tr>
              ) : currentItems.map((log, index) => (
                <tr key={index} style={{ transition: 'background-color 0.2s', borderBottom: '1px solid var(--border-color)' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                        <Calendar size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '14px' }}>
                          {new Date(log.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>{log.date}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    {getStatusBadge(log.status)}
                  </td>
                  <td style={{ padding: '16px 24px', color: 'var(--text-main)', fontSize: '14px', fontWeight: '500' }}>
                    {log.reason}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    {log.sequence ? (
                      <span style={{ fontFamily: 'monospace', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontSize: '13px', color: '#475569', fontWeight: '600' }}>
                        #{log.sequence}
                      </span>
                    ) : (
                      <span style={{ color: '#cbd5e1' }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    {log.url ? (
                      <a 
                        href={`http://127.0.0.1:8000${log.url}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#eef2ff', color: '#4f46e5', borderRadius: '8px', fontSize: '13px', fontWeight: '600', textDecoration: 'none', transition: 'background 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.background = '#e0e7ff'}
                        onMouseOut={e => e.currentTarget.style.background = '#eef2ff'}
                      >
                        <FileJson size={16} /> View JSON
                      </a>
                    ) : (
                      <span style={{ color: '#cbd5e1' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!loading && filteredLogs.length > 0 && (
          <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa', borderRadius: '0 0 16px 16px' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Showing <strong>{indexOfFirstItem + 1}</strong> to <strong>{Math.min(indexOfLastItem, filteredLogs.length)}</strong> of <strong>{filteredLogs.length}</strong> records
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                disabled={currentPage === 1}
                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: currentPage === 1 ? '#f1f5f9' : 'white', color: currentPage === 1 ? '#94a3b8' : 'var(--text-main)', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.2s' }}
                onMouseOver={e => {if(currentPage !== 1) e.currentTarget.style.background = '#f8fafc'}}
                onMouseOut={e => {if(currentPage !== 1) e.currentTarget.style.background = 'white'}}
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                disabled={currentPage === totalPages || totalPages === 0}
                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: (currentPage === totalPages || totalPages === 0) ? '#f1f5f9' : 'white', color: (currentPage === totalPages || totalPages === 0) ? '#94a3b8' : 'var(--text-main)', cursor: (currentPage === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.2s' }}
                onMouseOver={e => {if(currentPage !== totalPages && totalPages !== 0) e.currentTarget.style.background = '#f8fafc'}}
                onMouseOut={e => {if(currentPage !== totalPages && totalPages !== 0) e.currentTarget.style.background = 'white'}}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
