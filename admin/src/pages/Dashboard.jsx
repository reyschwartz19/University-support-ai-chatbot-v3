import React, { useState, useEffect } from 'react';
import { getStats, getChatLogs, triggerUpdate } from '../services/api';

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [recentLogs, setRecentLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [statsData, logsData] = await Promise.all([
                getStats(),
                getChatLogs(1, 5)
            ]);
            setStats(statsData);
            setRecentLogs(logsData.logs);
        } catch (err) {
            console.error('Failed to load dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleTriggerUpdate = async () => {
        setUpdating(true);
        try {
            await triggerUpdate();
            alert('Knowledge base update triggered successfully!');
            loadData();
        } catch (err) {
            alert('Failed to trigger update: ' + err.message);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
    }

    return (
        <div>
            <div className="admin-header">
                <h2>Dashboard</h2>
                <div className="admin-header__actions">
                    <button className="btn btn--primary" onClick={handleTriggerUpdate} disabled={updating}>
                        {updating ? 'Updating...' : 'Trigger Monthly Update'}
                    </button>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card__label">Total Chats</div>
                    <div className="stat-card__value">{stats?.total_chats || 0}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__label">Fallback Rate</div>
                    <div className="stat-card__value">{stats?.fallback_rate || 0}%</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__label">Satisfaction Rate</div>
                    <div className="stat-card__value">{stats?.satisfaction_rate || 0}%</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__label">Pending Submissions</div>
                    <div className="stat-card__value">{stats?.pending_submissions || 0}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__label">Total FAQ Entries</div>
                    <div className="stat-card__value">{stats?.total_faq_entries || 0}</div>
                </div>
            </div>

            <div className="data-table">
                <div className="data-table__header">
                    <h3 className="data-table__title">Recent Chat Interactions</h3>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Query</th>
                            <th>Confidence</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentLogs.map(log => (
                            <tr key={log.id}>
                                <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {log.user_query}
                                </td>
                                <td>{Math.round((log.confidence || 0) * 100)}%</td>
                                <td>
                                    <span className={`badge badge--${log.is_fallback ? 'warning' : 'success'}`}>
                                        {log.is_fallback ? 'Fallback' : 'Matched'}
                                    </span>
                                </td>
                                <td>{new Date(log.created_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {recentLogs.length === 0 && (
                    <div className="empty-state">
                        <h3>No chat interactions yet</h3>
                        <p>Chat logs will appear here once users start interacting with the chatbot.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
