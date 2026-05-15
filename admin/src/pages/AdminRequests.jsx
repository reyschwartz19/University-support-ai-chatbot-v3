import React, { useState, useEffect } from 'react';
import { getAdminRequests, updateAdminRequest } from '../services/api';

export default function AdminRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'schedule'
    
    // Filters
    const [statusFilter, setStatusFilter] = useState('All');
    const [dateFilter, setDateFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    
    // Inline Note
    const [activeNoteId, setActiveNoteId] = useState(null);
    const [noteText, setNoteText] = useState('');

    useEffect(() => {
        fetchRequests();
    }, [statusFilter, dateFilter, typeFilter]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const data = await getAdminRequests({
                status: statusFilter !== 'All' ? statusFilter : '',
                date: dateFilter,
                request_type: typeFilter
            });
            setRequests(data);
        } catch (err) {
            console.error('Failed to load requests:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const updated = await updateAdminRequest(id, { status: newStatus });
            setRequests(reqs => reqs.map(r => r.id === id ? updated : r));
        } catch (err) {
            alert('Failed to update status: ' + err.message);
        }
    };

    const handleSaveNote = async (id) => {
        try {
            const updated = await updateAdminRequest(id, { admin_note: noteText });
            setRequests(reqs => reqs.map(r => r.id === id ? updated : r));
            setActiveNoteId(null);
            setNoteText('');
        } catch (err) {
            alert('Failed to save note: ' + err.message);
        }
    };

    const getRowStyle = (status) => {
        switch(status) {
            case 'Pending': return { backgroundColor: '#fffccc' };
            case 'Processing': return { backgroundColor: '#e6f2ff' };
            case 'Ready for Pickup': return { backgroundColor: '#e6ffed' };
            case 'Completed': return { backgroundColor: '#f5f5f5', opacity: 0.7 };
            default: return {};
        }
    };

    // Schedule view grouping
    const todayStr = new Date().toISOString().split('T')[0];
    const todayRequests = requests.filter(r => r.preferred_date === todayStr);
    const groupedBySlot = todayRequests.reduce((acc, req) => {
        if (!acc[req.preferred_time]) acc[req.preferred_time] = [];
        acc[req.preferred_time].push(req);
        return acc;
    }, {});
    const sortedSlots = Object.keys(groupedBySlot).sort();

    return (
        <div className="admin-page">
            <header className="admin-page__header">
                <h2>Student Requests</h2>
                <button onClick={() => setViewMode(v => v === 'table' ? 'schedule' : 'table')} style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}>
                    Toggle View: {viewMode === 'table' ? 'Table View' : 'Schedule View'}
                </button>
            </header>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', background: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Status</label>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '6px' }}>
                        <option value="All">All</option>
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Ready for Pickup">Ready for Pickup</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Date</label>
                    <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} style={{ padding: '6px' }} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Request Type</label>
                    <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ padding: '6px' }}>
                        <option value="">All Types</option>
                        <option value="Student ID Card">Student ID Card</option>
                        <option value="Course Registration">Course Registration</option>
                        <option value="Transcript">Transcript</option>
                        <option value="Attestation Letter">Attestation Letter</option>
                        <option value="Bursary Query">Bursary Query</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div style={{ marginTop: 'auto' }}>
                    <button onClick={() => { setStatusFilter('All'); setDateFilter(''); setTypeFilter(''); }} style={{ padding: '6px 12px', cursor: 'pointer' }}>Clear Filters</button>
                </div>
            </div>

            {loading ? (
                <div>Loading requests...</div>
            ) : viewMode === 'table' ? (
                <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#f8f9fa' }}>
                            <tr>
                                <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>Reference</th>
                                <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>Name</th>
                                <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>Matricule</th>
                                <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>Request Type</th>
                                <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>Appointment</th>
                                <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>Status</th>
                                <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map(req => (
                                <React.Fragment key={req.id}>
                                    <tr style={{ ...getRowStyle(req.status), borderBottom: '1px solid #dee2e6' }}>
                                        <td style={{ padding: '12px 16px' }}><strong>{req.reference_code}</strong></td>
                                        <td style={{ padding: '12px 16px' }}>{req.student_name}</td>
                                        <td style={{ padding: '12px 16px' }}>{req.student_id}</td>
                                        <td style={{ padding: '12px 16px' }}>{req.request_type}</td>
                                        <td style={{ padding: '12px 16px' }}>{req.preferred_date}<br/><small>{req.preferred_time}</small></td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <select 
                                                value={req.status} 
                                                onChange={e => handleStatusChange(req.id, e.target.value)}
                                                style={{ padding: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Processing">Processing</option>
                                                <option value="Ready for Pickup">Ready for Pickup</option>
                                                <option value="Completed">Completed</option>
                                            </select>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <button 
                                                onClick={() => {
                                                    setActiveNoteId(activeNoteId === req.id ? null : req.id);
                                                    setNoteText(req.admin_note || '');
                                                }}
                                                style={{ padding: '4px 8px', fontSize: '12px', cursor: 'pointer', background: '#e9ecef', border: '1px solid #ccc', borderRadius: '4px' }}
                                            >
                                                📝 Add Note
                                            </button>
                                        </td>
                                    </tr>
                                    {activeNoteId === req.id && (
                                        <tr style={{ ...getRowStyle(req.status), borderBottom: '1px solid #dee2e6' }}>
                                            <td colSpan="7" style={{ padding: '12px 16px' }}>
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    <input 
                                                        type="text" 
                                                        value={noteText} 
                                                        onChange={e => setNoteText(e.target.value)} 
                                                        placeholder="Enter note for student..." 
                                                        style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                                    />
                                                    <button onClick={() => handleSaveNote(req.id)} style={{ padding: '8px 16px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save Note</button>
                                                    <button onClick={() => setActiveNoteId(null)} style={{ padding: '8px 16px', background: 'white', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                            {requests.length === 0 && (
                                <tr><td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No requests found matching criteria.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <h3 style={{ margin: 0 }}>Schedule View for Today ({todayStr})</h3>
                    {sortedSlots.length === 0 ? (
                        <div style={{ padding: '20px', background: 'white', borderRadius: '8px', textAlign: 'center', color: '#666' }}>No appointments scheduled for today.</div>
                    ) : (
                        sortedSlots.map(slot => (
                            <div key={slot}>
                                <h4 style={{ margin: '0 0 8px 0', color: '#495057' }}>{slot} ({groupedBySlot[slot].length} appointments)</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {groupedBySlot[slot].map(req => (
                                        <div key={req.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'white', borderRadius: '8px', borderLeft: `4px solid ${req.status === 'Completed' ? '#ccc' : 'var(--color-primary)'}`, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                            <div style={{ flex: 1 }}>
                                                <strong>{req.student_name}</strong> | {req.student_id} | {req.request_type} | Ref: {req.reference_code}
                                            </div>
                                            <div>
                                                <select 
                                                    value={req.status} 
                                                    onChange={e => handleStatusChange(req.id, e.target.value)}
                                                    style={{ padding: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Processing">Processing</option>
                                                    <option value="Ready for Pickup">Ready for Pickup</option>
                                                    <option value="Completed">Completed</option>
                                                </select>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
