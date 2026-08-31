import React, { useState, useEffect } from 'react';
import { Download, Check, ShieldCheck, Cpu, TerminalSquare, Lock, ArrowLeft, Send } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function DownloadPage() {
  const navigate = useNavigate();
  const [queries, setQueries] = useState([]);
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  
  // We mock fetching the username from localStorage / token
  const username = localStorage.getItem('username') || 'Yash31';

  const fetchQueries = () => {
    axios.get('http://127.0.0.1:8000/api/v1/auth/subscriber/queries/', {
      headers: { 'X-Username': username }
    })
    .then(res => setQueries(res.data))
    .catch(err => console.error(err));
  };

  useEffect(() => { fetchQueries(); }, []);

  const handleSubmitQuery = async (e) => {
    e.preventDefault();
    if (!newSubject || !newMessage) return;
    try {
      await axios.post('http://127.0.0.1:8000/api/v1/auth/subscriber/queries/', {
        subject: newSubject, message: newMessage
      }, {
        headers: { 'X-Username': username }
      });
      setNewSubject('');
      setNewMessage('');
      fetchQueries();
    } catch (err) {
      alert("Failed to submit query");
    }
  };

  return (
    <div className="dl-container" style={{flexDirection: 'column', padding: '60px 20px', alignItems: 'center'}}>
      
      <div className="dl-card" style={{marginBottom: '40px'}}>
        <div className="dl-success-icon">
          <Check size={48} strokeWidth={4} />
        </div>
        
        <h2>Account Activated!</h2>
        <p className="subtitle">
          Your One Smarter account is securely provisioned. Download the Subscriber Agent below to connect your brokerage and start automating.
        </p>
        
        <div className="dl-box">
          <div className="dl-box-header">
            <div className="dl-box-title">
              <TerminalSquare size={24} color="#6366f1" strokeWidth={2.5} />
              Subscriber Agent
            </div>
            <div className="dl-version-badge">v1.0.5 Release</div>
          </div>
          
          <ul className="dl-features">
            <li>
              <ShieldCheck size={20} />
              <span>Includes the local Ed25519 cryptographic verification engine to validate target JSONs.</span>
            </li>
            <li>
              <Cpu size={20} />
              <span>Native API connectors for Alpaca, Robinhood, and Tradier execution.</span>
            </li>
            <li>
              <Lock size={20} />
              <span>Human-in-the-loop dashboard: No trades execute without your explicit approval.</span>
            </li>
          </ul>
          
          <a href="/Subscriber_Agent.exe" download className="btn-download-mega" style={{ display: 'flex', textDecoration: 'none' }}>
            <Download size={24} strokeWidth={2.5} /> Download for Windows
          </a>
        </div>
        
        <Link to="/" className="dl-footer-link">
          <ArrowLeft size={18} strokeWidth={2.5} /> Return to Dashboard
        </Link>
      </div>

      {/* SUPPORT QUERIES SECTION */}
      <div className="dl-card" style={{padding: '40px'}}>
        <h2 style={{fontSize: '24px', textAlign: 'left', marginBottom: '20px'}}>Support Tickets</h2>
        
        <form onSubmit={handleSubmitQuery} style={{textAlign: 'left', marginBottom: '30px'}}>
          <div className="form-group">
            <label>Subject</label>
            <input type="text" className="form-control" style={{paddingLeft: '16px'}} value={newSubject} onChange={e => setNewSubject(e.target.value)} placeholder="e.g. Need help with Alpaca API keys" required/>
          </div>
          <div className="form-group">
            <label>Message</label>
            <textarea className="form-control" style={{paddingLeft: '16px', minHeight: '80px'}} value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Describe your issue..." required></textarea>
          </div>
          <button type="submit" className="btn-download-mega" style={{padding: '12px', fontSize: '16px', gap: '8px'}}>
            <Send size={18} /> Submit Query to Admin
          </button>
        </form>

        <div style={{textAlign: 'left'}}>
          <h3 style={{fontSize: '18px', marginBottom: '16px', color: 'var(--text-main)'}}>Your Recent Queries</h3>
          {queries.map(q => (
            <div key={q.id} style={{background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #e2e8f0'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                <strong style={{color: 'var(--text-main)'}}>{q.subject}</strong>
                <span style={{fontSize: '12px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '8px', background: q.status === 'RESOLVED' ? '#dcfce7' : '#fef3c7', color: q.status === 'RESOLVED' ? '#15803d' : '#b45309'}}>
                  {q.status}
                </span>
              </div>
              <p style={{fontSize: '14px', color: 'var(--text-muted)', marginBottom: '12px'}}>{q.message}</p>
              
              {q.reply && (
                <div style={{background: '#e0e7ff', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #4f46e5'}}>
                  <strong style={{color: '#4338ca', fontSize: '13px', display: 'block', marginBottom: '4px'}}>Admin Reply:</strong>
                  <p style={{fontSize: '14px', color: 'var(--text-main)'}}>{q.reply}</p>
                </div>
              )}
            </div>
          ))}
          {queries.length === 0 && <p style={{fontSize: '14px', color: 'var(--text-muted)'}}>No queries submitted yet.</p>}
        </div>
      </div>
    </div>
  );
}
