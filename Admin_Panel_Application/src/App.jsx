import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import SubscribersPage from './pages/SubscribersPage';
import QueriesPage from './pages/QueriesPage';
import LoginPage from './pages/LoginPage';
import StaffManagementPage from './pages/StaffManagementPage';
import Layout from './components/Layout';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Layout><Dashboard /></Layout>} />
        <Route path="/subscribers" element={<Layout allowedRoles={['SuperAdmin', 'Manager']}><SubscribersPage /></Layout>} />
        <Route path="/queries" element={<Layout><QueriesPage /></Layout>} />
        <Route path="/staff" element={<Layout allowedRoles={['SuperAdmin']}><StaffManagementPage /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}
