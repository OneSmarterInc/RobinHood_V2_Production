import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Send, CheckCircle } from 'lucide-react';

export default function QueriesPage() {
  const [queries, setQueries] = useState([]);
  const [replyText, setReplyText] = useState({});

  const fetchQueries = () => {
    axios.get('http://127.0.0.1:8000/api/v1/auth/admin/queries/', { headers: { Authorization: `Token ${localStorage.getItem('adminToken')}` } })
      .then(res => setQueries(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => { fetchQueries(); }, []);

  const handleReply = async (id) => {
    if (!replyText[id]) return;
    try {
      await axios.post(`http://127.0.0.1:8000/api/v1/auth/admin/queries/${id}/reply/`, {
        reply: replyText[id]
      }, { headers: { Authorization: `Token ${localStorage.getItem('adminToken')}` } });
      fetchQueries();
    } catch (err) {
      alert("Failed to send reply");
    }
  };

  return (
    <div>
      <div className="header">
        <h1>Support Queries</h1>
        <p>Respond to issues raised by subscribers from their desktop app.</p>
      </div>

      <div>
        {queries.map(q => (
          <div className="query-card" key={q.id}>
            <div className="query-header">
              <div>
                <div className="query-subject">{q.subject}</div>
                <div className="query-meta">From: @{q.username} &bull; {new Date(q.created_at).toLocaleString()}</div>
              </div>
              <span className={`badge ${q.status.toLowerCase()}`}>{q.status}</span>
            </div>
            
            <div className="query-message">
              {q.message}
            </div>

            {q.status === 'PENDING' ? (
              <div className="query-reply-form">
                <textarea 
                  placeholder="Type your reply to the subscriber..." 
                  value={replyText[q.id] || ''}
                  onChange={(e) => setReplyText({...replyText, [q.id]: e.target.value})}
                />
                <button className="btn btn-primary" style={{alignSelf: 'flex-start'}} onClick={() => handleReply(q.id)}>
                  <Send size={16} /> Send Reply
                </button>
              </div>
            ) : (
              <div className="reply-badge">
                <strong><CheckCircle size={14} style={{display: 'inline', marginBottom: '-2px'}}/> Admin Reply:</strong> {q.reply}
              </div>
            )}
          </div>
        ))}
        {queries.length === 0 && <p style={{color: '#64748b'}}>No queries found.</p>}
      </div>
    </div>
  );
}
