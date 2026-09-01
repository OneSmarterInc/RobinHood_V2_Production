import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ShieldAlert, ShieldCheck, Search, Users, Activity, UserX, Mail, ChevronLeft, ChevronRight } from 'lucide-react';

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchSubs = () => {
    axios.get('http://127.0.0.1:8000/api/v1/auth/admin/subscribers/', { headers: { Authorization: `Token ${localStorage.getItem('adminToken')}` } })
      .then(res => { setSubscribers(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  useEffect(() => { fetchSubs(); }, []);

  const handleAction = async (id, action) => {
    try {
      await axios.post(`http://127.0.0.1:8000/api/v1/auth/admin/subscribers/${id}/${action}/`, {}, { headers: { Authorization: `Token ${localStorage.getItem('adminToken')}` } });
      fetchSubs();
    } catch (err) {
      alert('Action failed. Ensure backend is running and endpoint is correct.');
    }
  };

  // Filter subscribers based on search term
  const filteredSubs = subscribers.filter(sub => 
    sub.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    sub.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredSubs.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSubs.slice(indexOfFirstItem, indexOfLastItem);

  const totalUsers = subscribers.length;
  const activeUsers = subscribers.filter(s => s.status === 'ACTIVE').length;
  const revokedUsers = subscribers.filter(s => s.status === 'REVOKED').length;

  return (
    <div>
      <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' }}>
        <div>
          <h1>Subscribers Management</h1>
          <p>View and manage all registered platform users securely.</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card" style={{ borderLeft: '4px solid var(--primary)', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.transform='translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform='translateY(0)'}>
          <div className="stat-title"><Users size={18} color="var(--primary)" /> Total Subscribers</div>
          <div className="stat-value">{totalUsers}</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid var(--success)', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.transform='translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform='translateY(0)'}>
          <div className="stat-title"><Activity size={18} color="var(--success)" /> Active Accounts</div>
          <div className="stat-value">{activeUsers}</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid var(--danger)', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.transform='translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform='translateY(0)'}>
          <div className="stat-title"><UserX size={18} color="var(--danger)" /> Revoked Access</div>
          <div className="stat-value">{revokedUsers}</div>
        </div>
      </div>

      <div className="table-container" style={{ overflow: 'visible' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', borderRadius: '16px 16px 0 0' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            User Directory <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>{filteredSubs.length}</span>
          </h3>
          <div className="search-bar" style={{ position: 'relative', width: '320px' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '12px', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Search by username or email..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', fontFamily: 'inherit', fontSize: '14px', transition: 'border-color 0.2s, box-shadow 0.2s' }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>User Profile</th>
                <th>Status</th>
                <th>Joined Date</th>
                <th style={{ textAlign: 'right' }}>Security Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan="4" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}><Activity className="animate-spin" style={{ margin: '0 auto', marginBottom: '10px', animation: 'spin 1s linear infinite' }} /> Loading subscribers...</td></tr> : 
                currentItems.length === 0 ? <tr><td colSpan="4" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}><Users size={32} style={{ margin: '0 auto', marginBottom: '12px', opacity: 0.5 }} /> No users found matching your search.</td></tr> :
                currentItems.map(sub => (
                <tr key={sub.id} style={{ transition: 'background-color 0.2s' }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '18px', boxShadow: '0 4px 6px -1px rgba(79,70,229,0.2)' }}>
                        {sub.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '15px' }}>{sub.username}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}><Mail size={12} /> {sub.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${sub.status.toLowerCase()}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}>
                      <span style={{ display: 'block', width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', opacity: 0.8 }}></span>
                      {sub.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ color: 'var(--text-main)', fontWeight: '600', fontSize: '14px' }}>{new Date(sub.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>ID: #{sub.id}</div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {sub.status === 'ACTIVE' ? (
                      <button className="btn" style={{ padding: '8px 16px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', display: 'inline-flex', gap: '8px' }} onClick={() => handleAction(sub.id, 'revoke')} onMouseOver={e => {e.currentTarget.style.background = '#fee2e2'}} onMouseOut={e => {e.currentTarget.style.background = '#fef2f2'}}>
                        <ShieldAlert size={16} /> Revoke Access
                      </button>
                    ) : (
                      <button className="btn" style={{ padding: '8px 16px', background: '#f0fdf4', color: '#10b981', border: '1px solid #bbf7d0', display: 'inline-flex', gap: '8px' }} onClick={() => handleAction(sub.id, 'activate')} onMouseOver={e => {e.currentTarget.style.background = '#dcfce7'}} onMouseOut={e => {e.currentTarget.style.background = '#f0fdf4'}}>
                        <ShieldCheck size={16} /> Reactivate User
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!loading && filteredSubs.length > 0 && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderRadius: '0 0 16px 16px' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Showing <strong>{indexOfFirstItem + 1}</strong> to <strong>{Math.min(indexOfLastItem, filteredSubs.length)}</strong> of <strong>{filteredSubs.length}</strong> users
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
    </div>
  );
}
