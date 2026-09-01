import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, MessageSquareText, ShieldAlert, LogOut, Hexagon, FileJson } from 'lucide-react';

export default function Sidebar({ role }) {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <aside style={{
      width: '280px', 
      background: '#0f172a', 
      color: '#f8fafc',
      display: 'flex', 
      flexDirection: 'column',
      borderRight: '1px solid #1e293b',
      boxShadow: '4px 0 24px rgba(0,0,0,0.05)'
    }}>
      {/* Brand Header */}
      <div style={{ padding: '32px 24px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(79,70,229,0.3)' }}>
          <Hexagon size={22} color="white" fill="currentColor" />
        </div>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, letterSpacing: '0.2px' }}>One Smarter</h2>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '2px' }}>Admin {role}</div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        <div style={{ fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', paddingLeft: '12px', marginTop: '12px' }}>Overview</div>
        
        <NavLink to="/" className={({isActive}) => isActive ? "nav-link-dark active" : "nav-link-dark"}>
          <LayoutDashboard size={18} /> Dashboard
        </NavLink>
        
        <div style={{ fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', paddingLeft: '12px', marginTop: '24px' }}>Management</div>

        {(role === 'SuperAdmin' || role === 'Manager') && (
          <NavLink to="/subscribers" className={({isActive}) => isActive ? "nav-link-dark active" : "nav-link-dark"}>
            <Users size={18} /> Subscribers
          </NavLink>
        )}

        {(role === 'SuperAdmin' || role === 'Manager') && (
          <NavLink to="/publishing-history" className={({isActive}) => isActive ? "nav-link-dark active" : "nav-link-dark"}>
            <FileJson size={18} /> Target History
          </NavLink>
        )}

        <NavLink to="/queries" className={({isActive}) => isActive ? "nav-link-dark active" : "nav-link-dark"}>
          <MessageSquareText size={18} /> Support Tickets
        </NavLink>

        {role === 'SuperAdmin' && (
          <NavLink to="/staff" className={({isActive}) => isActive ? "nav-link-dark active" : "nav-link-dark"}>
            <ShieldAlert size={18} /> Staff Controls
          </NavLink>
        )}
      </nav>

      {/* Footer / Logout */}
      <div style={{ padding: '24px', borderTop: '1px solid #1e293b' }}>
        <button onClick={handleLogout} style={{
          width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #334155', 
          background: 'transparent', color: '#cbd5e1', fontWeight: '600', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.2s'
        }} onMouseOver={e => {e.currentTarget.style.background='#1e293b'; e.currentTarget.style.color='white'}} onMouseOut={e => {e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#cbd5e1'}}>
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
