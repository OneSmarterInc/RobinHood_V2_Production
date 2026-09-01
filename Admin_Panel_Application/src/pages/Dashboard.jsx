import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Activity, MessageSquare, TrendingUp, Zap, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState({ subs: 0, queries: 0, activeSubs: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('http://127.0.0.1:8000/api/v1/auth/admin/subscribers/', { headers: { Authorization: `Token ${localStorage.getItem('adminToken')}` } }),
      axios.get('http://127.0.0.1:8000/api/v1/auth/admin/queries/', { headers: { Authorization: `Token ${localStorage.getItem('adminToken')}` } })
    ]).then(([subRes, queryRes]) => {
      setStats({
        subs: subRes.data.length,
        activeSubs: subRes.data.filter(s => s.status === 'ACTIVE').length,
        queries: queryRes.data.filter(q => q.status === 'PENDING').length
      });
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', borderRadius: '16px', padding: '32px 40px', color: 'white', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.2)' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>Welcome back, Admin!</h1>
          <p style={{ opacity: 0.9, fontSize: '15px', margin: 0 }}>Here's what's happening with the One Smarter platform today.</p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px 24px', borderRadius: '12px', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Clock size={20} />
          <span style={{ fontWeight: '600', letterSpacing: '0.5px' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>
      
      {/* Primary Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
        
        {/* Card 1 */}
        <div className="stat-card" style={{ position: 'relative', overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }} onMouseOver={e => {e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 12px 20px -5px rgba(0,0,0,0.08)'}} onMouseOut={e => {e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 4px 6px -1px rgba(0,0,0,0.05)'}}>
          <div style={{ position: 'absolute', right: '-20px', top: '-20px', background: '#e0e7ff', width: '100px', height: '100px', borderRadius: '50%', opacity: 0.5 }}></div>
          <div className="stat-title" style={{ fontSize: '15px' }}><Users size={20} color="#4f46e5" /> Total Subscribers</div>
          <div className="stat-value" style={{ fontSize: '42px', marginTop: '8px' }}>{loading ? '...' : stats.subs}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '13px', fontWeight: '600', marginTop: '12px' }}>
            <TrendingUp size={14} /> <span>{stats.activeSubs} Active Accounts</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="stat-card" style={{ position: 'relative', overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }} onMouseOver={e => {e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 12px 20px -5px rgba(0,0,0,0.08)'}} onMouseOut={e => {e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 4px 6px -1px rgba(0,0,0,0.05)'}}>
          <div style={{ position: 'absolute', right: '-20px', top: '-20px', background: '#fef3c7', width: '100px', height: '100px', borderRadius: '50%', opacity: 0.5 }}></div>
          <div className="stat-title" style={{ fontSize: '15px' }}><MessageSquare size={20} color="#f59e0b" /> Pending Queries</div>
          <div className="stat-value" style={{ fontSize: '42px', marginTop: '8px' }}>{loading ? '...' : stats.queries}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: stats.queries > 0 ? '#f59e0b' : '#64748b', fontSize: '13px', fontWeight: '600', marginTop: '12px' }}>
            {stats.queries > 0 ? <><Zap size={14} /> <span>Requires Attention</span></> : <><ShieldCheck size={14} /> <span>All caught up!</span></>}
          </div>
        </div>

        {/* Card 3 */}
        <div className="stat-card" style={{ position: 'relative', overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer', border: '1px solid #10b981' }} onMouseOver={e => {e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 12px 20px -5px rgba(16, 185, 129, 0.15)'}} onMouseOut={e => {e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 4px 6px -1px rgba(0,0,0,0.05)'}}>
          <div style={{ position: 'absolute', right: '-20px', top: '-20px', background: '#dcfce7', width: '100px', height: '100px', borderRadius: '50%', opacity: 0.5 }}></div>
          <div className="stat-title" style={{ fontSize: '15px' }}><Activity size={20} color="#10b981" /> Publisher Engine</div>
          <div className="stat-value" style={{ fontSize: '42px', marginTop: '8px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '12px' }}>
            Online <span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 0 4px #dcfce7', animation: 'pulse 2s infinite' }}></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px', fontWeight: '500', marginTop: '12px' }}>
            System operating at 100% capacity
          </div>
        </div>
      </div>

      {/* Quick Actions / Secondary Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Recent Activity Mockup */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)' }}>System Overview</h3>
            <Link to="/subscribers" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}>
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '15px' }}>Publisher Engine Active</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>Generating mathematically sound targets securely.</div>
                </div>
             </div>
             
             <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                  <MessageSquare size={24} />
                </div>
                <div>
                  <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '15px' }}>Support Queue Monitoring</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>{stats.queries} tickets waiting for administrator response.</div>
                </div>
             </div>
          </div>
        </div>

        {/* Quick Links */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '24px' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link to="/subscribers" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: '#f8fafc', borderRadius: '12px', textDecoration: 'none', color: 'var(--text-main)', fontWeight: '600', transition: 'background 0.2s', border: '1px solid #f1f5f9' }} onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'} onMouseOut={e => e.currentTarget.style.background = '#f8fafc'}>
              <Users size={20} color="#4f46e5" /> Manage Users
            </Link>
            <Link to="/queries" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: '#f8fafc', borderRadius: '12px', textDecoration: 'none', color: 'var(--text-main)', fontWeight: '600', transition: 'background 0.2s', border: '1px solid #f1f5f9' }} onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'} onMouseOut={e => e.currentTarget.style.background = '#f8fafc'}>
              <MessageSquare size={20} color="#f59e0b" /> Reply to Tickets
            </Link>
            <Link to="/staff" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: '#f8fafc', borderRadius: '12px', textDecoration: 'none', color: 'var(--text-main)', fontWeight: '600', transition: 'background 0.2s', border: '1px solid #f1f5f9' }} onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'} onMouseOut={e => e.currentTarget.style.background = '#f8fafc'}>
              <ShieldCheck size={20} color="#10b981" /> Staff Controls
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
