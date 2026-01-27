import React, { useState, useEffect } from 'react';
import { getFeedback } from '../services/api';

export default function FeedbackReview() {
    const [feedback, setFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        loadFeedback();
    }, [page]);

    const loadFeedback = async () => {
        setLoading(true);
        try {
            const data = await getFeedback(page, 20);
            setFeedback(data.feedback);
            setTotalPages(data.pages);
        } catch (err) {
            console.error('Failed to load feedback:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="admin-header">
                <h2>Feedback Review</h2>
            </div>

            <div className="data-table">
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Rating</th>
                            <th>Comment</th>
                            <th>Chat ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        {feedback.map(fb => (
                            <tr key={fb.id}>
                                <td>{new Date(fb.created_at).toLocaleString()}</td>
                                <td>
                                    <span className={`badge badge--${fb.rating === 'up' ? 'success' : 'error'}`}>
                                        {fb.rating === 'up' ? '👍 Helpful' : '👎 Not Helpful'}
                                    </span>
                                </td>
                                <td>{fb.comment || '-'}</td>
                                <td style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>
                                    {fb.chat_id?.substring(0, 8)}...
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {feedback.length === 0 && !loading && (
                    <div className="empty-state">
                        <h3>No feedback yet</h3>
                        <p>User feedback will appear here once they start rating responses.</p>
                    </div>
                )}

                <div className="pagination">
                    <button className="pagination__btn" onClick={() => setPage(p => p - 1)} disabled={page <= 1}>
                        Previous
                    </button>
                    <span className="pagination__info">Page {page} of {totalPages}</span>
                    <button className="pagination__btn" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
