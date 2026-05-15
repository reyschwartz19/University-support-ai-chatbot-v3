import React, { useState, useEffect } from 'react';
import { getAdminBlockedDates, addBlockedDate, removeBlockedDate } from '../services/api';

export default function AdminAvailability() {
    const [blockedDates, setBlockedDates] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Form
    const [dateToBlock, setDateToBlock] = useState('');
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchDates();
    }, []);

    const fetchDates = async () => {
        setLoading(true);
        try {
            const data = await getAdminBlockedDates();
            setBlockedDates(data);
        } catch (err) {
            console.error('Failed to load blocked dates:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleBlockDate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const data = await addBlockedDate(dateToBlock, reason);
            setBlockedDates(prev => [...prev, data.blocked_date].sort((a, b) => a.date.localeCompare(b.date)));
            setDateToBlock('');
            setReason('');
        } catch (err) {
            alert(err.message || 'Failed to block date');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUnblock = async (id) => {
        if (!window.confirm('Are you sure you want to unblock this date?')) return;
        try {
            await removeBlockedDate(id);
            setBlockedDates(prev => prev.filter(d => d.id !== id));
        } catch (err) {
            alert('Failed to unblock date: ' + err.message);
        }
    };

    const getTodayStr = () => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const todayStr = getTodayStr();
    const upcoming = blockedDates.filter(d => d.date >= todayStr);
    const past = blockedDates.filter(d => d.date < todayStr);

    return (
        <div className="admin-page">
            <header className="admin-page__header">
                <h2>Availability Management</h2>
            </header>
            
            <p style={{ marginBottom: '20px', color: '#666' }}>
                <strong>{upcoming.length}</strong> upcoming dates are currently blocked.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px' }}>
                
                {/* Left Side: Form */}
                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', height: 'fit-content' }}>
                    <h3 style={{ marginTop: 0 }}>Block a Date</h3>
                    <form onSubmit={handleBlockDate}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>Date *</label>
                            <input 
                                type="date" 
                                required 
                                min={todayStr}
                                value={dateToBlock}
                                onChange={e => {
                                    const d = new Date(e.target.value);
                                    if (d.getUTCDay() === 0 || d.getUTCDay() === 6) {
                                        alert('Weekends are automatically blocked.');
                                        return;
                                    }
                                    setDateToBlock(e.target.value);
                                }}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>Reason (Optional)</label>
                            <input 
                                type="text" 
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                placeholder="e.g. Public Holiday"
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={submitting || !dateToBlock}
                            style={{ width: '100%', padding: '10px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: (submitting || !dateToBlock) ? 'not-allowed' : 'pointer' }}
                        >
                            {submitting ? 'Blocking...' : 'Block This Date'}
                        </button>
                    </form>
                </div>

                {/* Right Side: Table */}
                <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    {loading ? (
                        <div style={{ padding: '20px' }}>Loading dates...</div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ background: '#f8f9fa' }}>
                                <tr>
                                    <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>Date</th>
                                    <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>Reason</th>
                                    <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>Blocked By</th>
                                    <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {upcoming.map(d => (
                                    <tr key={d.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                                        <td style={{ padding: '12px 16px' }}><strong>{d.date}</strong></td>
                                        <td style={{ padding: '12px 16px', color: '#666' }}>{d.reason || '-'}</td>
                                        <td style={{ padding: '12px 16px' }}>{d.blocked_by}</td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <button 
                                                onClick={() => handleUnblock(d.id)}
                                                style={{ padding: '4px 8px', color: 'red', background: 'white', border: '1px solid red', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                                            >
                                                Unblock
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {upcoming.length === 0 && (
                                    <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No upcoming blocked dates.</td></tr>
                                )}
                                
                                {past.length > 0 && (
                                    <>
                                        <tr>
                                            <td colSpan="4" style={{ padding: '12px 16px', background: '#f8f9fa', fontWeight: 'bold', fontSize: '14px', borderBottom: '1px solid #dee2e6' }}>
                                                Past Blocked Dates
                                            </td>
                                        </tr>
                                        {past.map(d => (
                                            <tr key={d.id} style={{ borderBottom: '1px solid #dee2e6', background: '#fcfcfc', opacity: 0.7 }}>
                                                <td style={{ padding: '12px 16px' }}>{d.date}</td>
                                                <td style={{ padding: '12px 16px' }}>{d.reason || '-'}</td>
                                                <td style={{ padding: '12px 16px' }}>{d.blocked_by}</td>
                                                <td style={{ padding: '12px 16px' }}>-</td>
                                            </tr>
                                        ))}
                                    </>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
