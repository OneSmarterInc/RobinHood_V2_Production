import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Activity, MessageSquare } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({ subs: 0, queries: 0 });

  useEffect(() => {
    // Fetch overview data
    Promise.all([
      axios.get('http://127.0.0.1:8000/api/v1/auth/admin/subscribers/', { headers: { Authorization: `Token ${localStorage.getItem('adminToken')}` } }),
      axios.get('http://127.0.0.1:8000/api/v1/auth/admin/queries/', { headers: { Authorization: `Token ${localStorage.getItem('adminToken')}` } })
    ]).then(([subRes, queryRes]) => {
      setStats({
        subs: subRes.data.length,
        queries: queryRes.data.filter(q => q.status === 'PENDING').length
      });
    }).catch(err => console.error(err));
  }, []);

  return (
    <div>
      <div className="header">
        <h1>Dashboard Overview</h1>
        <p>Welcome back to the One Smarter Admin Panel.</p>
      </div>
      
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-title"><Users size={18} color="#4f46e5" /> Total Subscribers</div>
          <div className="stat-value">{stats.subs}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title"><MessageSquare size={18} color="#f59e0b" /> Pending Queries</div>
          <div className="stat-value">{stats.queries}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title"><Activity size={18} color="#10b981" /> Publisher Engine</div>
          <div className="stat-value" style={{color: '#10b981'}}>Online</div>
        </div>
      </div>
    </div>
  );
}
