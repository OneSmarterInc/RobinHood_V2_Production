import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { UserPlus, Trash2 } from 'lucide-react';

export default function StaffManagementPage() {
  const [staff, setStaff] = useState([]);
  const [formData, setFormData] = useState({ username: '', password: '', role: 'Support' });

  const fetchStaff = () => {
    axios.get('http://127.0.0.1:8000/api/v1/auth/admin/staff/', { headers: { Authorization: `Token ${localStorage.getItem('adminToken')}` } })
      .then(res => setStaff(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:8000/api/v1/auth/admin/staff/', formData, { headers: { Authorization: `Token ${localStorage.getItem('adminToken')}` } });
      setFormData({ username: '', password: '', role: 'Support' });
      fetchStaff();
    } catch (err) {
      alert("Error creating staff: " + (err.response?.data?.error || "Unknown error"));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this staff member?")) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/v1/auth/admin/staff/${id}/`, { headers: { Authorization: `Token ${localStorage.getItem('adminToken')}` } });
      fetchStaff();
    } catch (err) {
      alert("Failed to delete.");
    }
  };

  return (
    <div>
      <div className="header">
        <h1>Staff Management</h1>
        <p>Create and assign roles to team members. Only SuperAdmins can view this page.</p>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px'}}>
        <div className="table-container" style={{alignSelf: 'start'}}>
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map(s => (
                <tr key={s.id}>
                  <td>{s.username}</td>
                  <td><span className="badge" style={{background: '#e0e7ff', color: '#4338ca'}}>{s.role}</span></td>
                  <td>
                    <button className="btn btn-danger" onClick={() => handleDelete(s.id)}><Trash2 size={14}/> Remove</button>
                  </td>
                </tr>
              ))}
              {staff.length === 0 && <tr><td colSpan="3">No staff members found.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="stat-card" style={{alignSelf: 'start'}}>
          <h3 style={{marginBottom: '16px'}}>Add New Staff</h3>
          <form onSubmit={handleCreate} style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
            <input type="text" placeholder="Username" className="form-control" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)'}}/>
            <input type="password" placeholder="Temporary Password" className="form-control" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)'}}/>
            <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)'}}>
              <option value="Support">Support (Queries Only)</option>
              <option value="Manager">Manager (Queries + Subscribers)</option>
            </select>
            <button type="submit" className="btn btn-primary" style={{justifyContent: 'center'}}><UserPlus size={16}/> Create Account</button>
          </form>
        </div>
      </div>
    </div>
  );
}
