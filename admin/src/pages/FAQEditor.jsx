import React, { useState, useEffect } from 'react';
import { getFAQEntries, createFAQEntry, updateFAQEntry, deleteFAQEntry } from '../services/api';

export default function FAQEditor() {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);
    const [formData, setFormData] = useState({
        question: '',
        answer: '',
        category: 'general',
        faculty: 'All Faculties',
        academic_year: '2024-2025'
    });
    const [saving, setSaving] = useState(false);

    const categories = [
        { value: 'registration', label: 'Registration' },
        { value: 'academic-calendar', label: 'Academic Calendar' },
        { value: 'examinations', label: 'Examinations' },
        { value: 'fees', label: 'Fees & Payments' },
        { value: 'offices', label: 'Administrative Offices' },
        { value: 'staff', label: 'University Staff' },
        { value: 'general', label: 'General' }
    ];

    useEffect(() => {
        loadEntries();
    }, [page]);

    const loadEntries = async () => {
        setLoading(true);
        try {
            const data = await getFAQEntries(page, 15);
            setEntries(data.entries);
            setTotalPages(data.pages);
        } catch (err) {
            console.error('Failed to load entries:', err);
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingEntry(null);
        setFormData({
            question: '',
            answer: '',
            category: 'general',
            faculty: 'All Faculties',
            academic_year: '2024-2025'
        });
        setShowModal(true);
    };

    const openEditModal = (entry) => {
        setEditingEntry(entry);
        setFormData({
            question: entry.question,
            answer: entry.answer,
            category: entry.category || 'general',
            faculty: entry.faculty || 'All Faculties',
            academic_year: entry.academic_year || '2024-2025'
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.question.trim() || !formData.answer.trim()) {
            return alert('Question and answer are required');
        }

        setSaving(true);
        try {
            if (editingEntry) {
                await updateFAQEntry(editingEntry.id, formData);
            } else {
                await createFAQEntry(formData);
            }
            setShowModal(false);
            loadEntries();
        } catch (err) {
            alert('Failed to save: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this FAQ entry?')) return;

        try {
            await deleteFAQEntry(id);
            loadEntries();
        } catch (err) {
            alert('Failed to delete: ' + err.message);
        }
    };

    return (
        <div>
            <div className="admin-header">
                <h2>FAQ Editor</h2>
                <button className="btn btn--primary" onClick={openCreateModal}>
                    + Add New Entry
                </button>
            </div>

            <div className="data-table">
                <table>
                    <thead>
                        <tr>
                            <th>Question</th>
                            <th>Category</th>
                            <th>Faculty</th>
                            <th>Updated</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entries.map(entry => (
                            <tr key={entry.id}>
                                <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {entry.question}
                                </td>
                                <td>
                                    <span className="badge badge--info">{entry.category}</span>
                                </td>
                                <td>{entry.faculty || '-'}</td>
                                <td>{entry.last_updated ? new Date(entry.last_updated).toLocaleDateString() : '-'}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button className="btn btn--sm btn--secondary" onClick={() => openEditModal(entry)}>
                                            Edit
                                        </button>
                                        <button className="btn btn--sm btn--danger" onClick={() => handleDelete(entry.id)}>
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {entries.length === 0 && !loading && (
                    <div className="empty-state">
                        <h3>No FAQ entries</h3>
                        <p>Create your first FAQ entry to get started.</p>
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

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal__header">
                            <h3 className="modal__title">{editingEntry ? 'Edit FAQ Entry' : 'Create FAQ Entry'}</h3>
                            <button className="modal__close" onClick={() => setShowModal(false)}>✕</button>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Question *</label>
                            <textarea
                                className="form-textarea"
                                value={formData.question}
                                onChange={e => setFormData({ ...formData, question: e.target.value })}
                                placeholder="Enter the question..."
                                rows={2}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Answer *</label>
                            <textarea
                                className="form-textarea"
                                value={formData.answer}
                                onChange={e => setFormData({ ...formData, answer: e.target.value })}
                                placeholder="Enter the official answer..."
                                rows={5}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <select
                                    className="form-select"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {categories.map(cat => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Faculty</label>
                                <input
                                    className="form-input"
                                    value={formData.faculty}
                                    onChange={e => setFormData({ ...formData, faculty: e.target.value })}
                                    placeholder="e.g., Faculty of Science"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Academic Year</label>
                            <input
                                className="form-input"
                                value={formData.academic_year}
                                onChange={e => setFormData({ ...formData, academic_year: e.target.value })}
                                placeholder="e.g., 2024-2025"
                            />
                        </div>

                        <div className="modal__footer">
                            <button className="btn btn--secondary" onClick={() => setShowModal(false)}>
                                Cancel
                            </button>
                            <button className="btn btn--primary" onClick={handleSave} disabled={saving}>
                                {saving ? 'Saving...' : (editingEntry ? 'Update Entry' : 'Create Entry')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
