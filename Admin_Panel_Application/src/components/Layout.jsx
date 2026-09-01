import React from 'react';
import { Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout({ children, allowedRoles }) {
  const token = localStorage.getItem('adminToken');
  const role = localStorage.getItem('adminRole');
  
  if (!token) return <Navigate to="/login" replace />;
  
  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '400px' }}>
          <h2 style={{ color: '#ef4444', marginBottom: '16px' }}>Access Denied</h2>
          <p style={{ color: '#64748b' }}>Your current role (<strong>{role}</strong>) does not have permission to view this module.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar role={role} />
      <main className="main-content" style={{ background: '#f8fafc' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
