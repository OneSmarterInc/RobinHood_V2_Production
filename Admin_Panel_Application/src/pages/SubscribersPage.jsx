import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div>
      <div className="header">
        <h1>Subscribers Management</h1>
        <p>View all registered users and manage their access to the platform.</p>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Status</th>
              <th>Joined Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="6">Loading...</td></tr> : subscribers.map(sub => (
              <tr key={sub.id}>
                <td>#{sub.id}</td>
                <td>{sub.username}</td>
                <td>{sub.email}</td>
                <td>
                  <span className={`badge ${sub.status.toLowerCase()}`}>{sub.status}</span>
                </td>
                <td>{new Date(sub.created_at).toLocaleDateString()}</td>
                <td>
                  {sub.status === 'ACTIVE' ? (
                    <button className="btn btn-danger" onClick={() => handleAction(sub.id, 'revoke')}>
                      <ShieldAlert size={14} /> Revoke
                    </button>
                  ) : (
                    <button className="btn btn-success" onClick={() => handleAction(sub.id, 'activate')}>
                      <ShieldCheck size={14} /> Reactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
