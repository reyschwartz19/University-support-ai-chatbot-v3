import React, { useState, useEffect } from 'react';
import { getChatLogs } from '../services/api';

export default function ChatLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedLog, setSelectedLog] = useState(null);

    useEffect(() => {
        loadLogs();
    }, [page]);

    const loadLogs = async () => {
        setLoading(true);
        try {
            const data = await getChatLogs(page, 15);
            setLogs(data.logs);
            setTotalPages(data.pages);
        } catch (err) {
            console.error('Failed to load logs:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="admin-header">
                <h2>Chat Logs</h2>
            </div>

            <div className="data-table">
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>User Query</th>
                            <th>Confidence</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log.id}>
                                <td>{new Date(log.created_at).toLocaleString()}</td>
                                <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {log.user_query}
                                </td>
                                <td>{Math.round((log.confidence || 0) * 100)}%</td>
                                <td>
                                    <span className={`badge badge--${log.is_fallback ? 'warning' : 'success'}`}>
                                        {log.is_fallback ? 'Fallback' : 'Matched'}
                                    </span>
                                </td>
                                <td>
                                    <button className="btn btn--sm btn--secondary" onClick={() => setSelectedLog(log)}>
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {logs.length === 0 && !loading && (
                    <div className="empty-state">
                        <h3>No chat logs found</h3>
                    </div>
                )}

                <div className="pagination">
                    <button
                        className="pagination__btn"
                        onClick={() => setPage(p => p - 1)}
                        disabled={page <= 1}
                    >
                        Previous
                    </button>
                    <span className="pagination__info">Page {page} of {totalPages}</span>
                    <button
                        className="pagination__btn"
                        onClick={() => setPage(p => p + 1)}
                        disabled={page >= totalPages}
                    >
                        Next
                    </button>
                </div>
            </div>

            {selectedLog && (
                <div className="modal-overlay" onClick={() => setSelectedLog(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal__header">
                            <h3 className="modal__title">Chat Details</h3>
                            <button className="modal__close" onClick={() => setSelectedLog(null)}>✕</button>
                        </div>

                        <div className="form-group">
                            <label className="form-label">User Query</label>
                            <div style={{ padding: '12px', background: 'var(--color-gray-100)', borderRadius: '8px' }}>
                                {selectedLog.user_query}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Bot Response</label>
                            <div style={{ padding: '12px', background: 'var(--color-gray-100)', borderRadius: '8px', whiteSpace: 'pre-wrap' }}>
                                {selectedLog.bot_response}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div>
                                <label className="form-label">Confidence</label>
                                <span className="badge badge--info">{Math.round((selectedLog.confidence || 0) * 100)}%</span>
                            </div>
                            <div>
                                <label className="form-label">Status</label>
                                <span className={`badge badge--${selectedLog.is_fallback ? 'warning' : 'success'}`}>
                                    {selectedLog.is_fallback ? 'Fallback' : 'Matched'}
                                </span>
                            </div>
                            <div>
                                <label className="form-label">Date</label>
                                <span>{new Date(selectedLog.created_at).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
