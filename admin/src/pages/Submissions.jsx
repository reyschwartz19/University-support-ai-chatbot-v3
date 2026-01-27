import React, { useState, useEffect } from 'react';
import { getSubmissions, approveSubmission, rejectSubmission } from '../services/api';

export default function Submissions() {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [answer, setAnswer] = useState('');
    const [category, setCategory] = useState('general');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        loadSubmissions();
    }, [page]);

    const loadSubmissions = async () => {
        setLoading(true);
        try {
            const data = await getSubmissions('pending', page, 15);
            setSubmissions(data.submissions);
            setTotalPages(data.pages);
        } catch (err) {
            console.error('Failed to load submissions:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!answer.trim()) return alert('Please provide an answer');

        setProcessing(true);
        try {
            await approveSubmission(selectedSubmission.id, answer, category);
            setSelectedSubmission(null);
            setAnswer('');
            loadSubmissions();
        } catch (err) {
            alert('Failed to approve: ' + err.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async (id) => {
        if (!confirm('Are you sure you want to reject this submission?')) return;

        try {
            await rejectSubmission(id);
            loadSubmissions();
        } catch (err) {
            alert('Failed to reject: ' + err.message);
        }
    };

    const categories = [
        { value: 'registration', label: 'Registration' },
        { value: 'academic-calendar', label: 'Academic Calendar' },
        { value: 'examinations', label: 'Examinations' },
        { value: 'fees', label: 'Fees & Payments' },
        { value: 'offices', label: 'Administrative Offices' },
        { value: 'staff', label: 'University Staff' },
        { value: 'general', label: 'General' }
    ];

    return (
        <div>
            <div className="admin-header">
                <h2>Submitted Questions</h2>
            </div>

            <div className="data-table">
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Question</th>
                            <th>Context</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {submissions.map(sub => (
                            <tr key={sub.id}>
                                <td>{new Date(sub.created_at).toLocaleDateString()}</td>
                                <td style={{ maxWidth: '300px' }}>{sub.question}</td>
                                <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {sub.context || '-'}
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button className="btn btn--sm btn--success" onClick={() => setSelectedSubmission(sub)}>
                                            Approve
                                        </button>
                                        <button className="btn btn--sm btn--danger" onClick={() => handleReject(sub.id)}>
                                            Reject
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {submissions.length === 0 && !loading && (
                    <div className="empty-state">
                        <h3>No pending submissions</h3>
                        <p>All submitted questions have been reviewed.</p>
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

            {selectedSubmission && (
                <div className="modal-overlay" onClick={() => setSelectedSubmission(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal__header">
                            <h3 className="modal__title">Approve Question</h3>
                            <button className="modal__close" onClick={() => setSelectedSubmission(null)}>✕</button>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Question</label>
                            <div style={{ padding: '12px', background: 'var(--color-gray-100)', borderRadius: '8px' }}>
                                {selectedSubmission.question}
                            </div>
                        </div>

                        {selectedSubmission.context && (
                            <div className="form-group">
                                <label className="form-label">User Context</label>
                                <div style={{ padding: '12px', background: 'var(--color-gray-100)', borderRadius: '8px' }}>
                                    {selectedSubmission.context}
                                </div>
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                                {categories.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Answer *</label>
                            <textarea
                                className="form-textarea"
                                value={answer}
                                onChange={e => setAnswer(e.target.value)}
                                placeholder="Provide the official answer to this question..."
                                rows={5}
                            />
                        </div>

                        <div className="modal__footer">
                            <button className="btn btn--secondary" onClick={() => setSelectedSubmission(null)}>
                                Cancel
                            </button>
                            <button className="btn btn--success" onClick={handleApprove} disabled={processing}>
                                {processing ? 'Approving...' : 'Approve & Add to FAQ'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
