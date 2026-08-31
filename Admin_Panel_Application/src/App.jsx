import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { LayoutDashboard, Users, MessageSquareText, ShieldAlert } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import SubscribersPage from './pages/SubscribersPage';
import QueriesPage from './pages/QueriesPage';
import LoginPage from './pages/LoginPage';
import StaffManagementPage from './pages/StaffManagementPage';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('adminToken');
  const role = localStorage.getItem('adminRole');
  if (!token) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <div style={{padding: '40px', textAlign: 'center', color: 'red'}}><h2>403 - Access Denied</h2><p>Your role ({role}) does not have permission to view this page.</p></div>;
  }
  return children;
};

export default function App() {
  const isAuth = !!localStorage.getItem('adminToken');
  const role = localStorage.getItem('adminRole');

  return (
    <BrowserRouter>
      <div className="app-container">
        {isAuth && <aside className="sidebar">
          <div className="sidebar-logo" style={{flexDirection: 'column', alignItems: 'flex-start'}}>
            <span>One Smarter Admin</span>
            <span style={{fontSize: '12px', color: '#64748b', fontWeight: '600', marginTop: '4px'}}>Role: {role}</span>
          </div>
          <nav className="nav-menu">
            <NavLink to="/" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
              <LayoutDashboard size={20} /> Dashboard Overview
            </NavLink>
            
            {(role === 'SuperAdmin' || role === 'Manager') && (
              <NavLink to="/subscribers" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
                <Users size={20} /> Subscribers
              </NavLink>
            )}

            <NavLink to="/queries" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
              <MessageSquareText size={20} /> Support Queries
            </NavLink>

            {role === 'SuperAdmin' && (
              <NavLink to="/staff" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
                <ShieldAlert size={20} /> Staff Management
              </NavLink>
            )}

            <div style={{marginTop: 'auto', padding: '0 16px', marginBottom: '24px', paddingTop: '40px'}}>
              <button onClick={() => {localStorage.clear(); window.location.href='/login';}} style={{width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: '#fee2e2', color: '#b91c1c', fontWeight: '700', cursor: 'pointer'}}>Log Out</button>
            </div>
          </nav>
        </aside>}
        <main className="main-content">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/subscribers" element={<ProtectedRoute allowedRoles={['SuperAdmin', 'Manager']}><SubscribersPage /></ProtectedRoute>} />
            <Route path="/queries" element={<ProtectedRoute><QueriesPage /></ProtectedRoute>} />
            <Route path="/staff" element={<ProtectedRoute allowedRoles={['SuperAdmin']}><StaffManagementPage /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
