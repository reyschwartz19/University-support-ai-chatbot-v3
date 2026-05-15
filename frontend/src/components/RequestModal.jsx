import React, { useState, useEffect } from 'react';
import { submitAdminRequest, getAvailableSlots } from '../services/api';

export default function RequestModal({ isOpen, onClose, blockedDates, onSuccess }) {
    const [formData, setFormData] = useState({
        student_name: '',
        student_id: '',
        request_type: 'Student ID Card',
        details: '',
        preferred_date: '',
        preferred_time: ''
    });
    
    const [slotsInfo, setSlotsInfo] = useState(null);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isOpen) {
            // reset form on close
            setFormData({
                student_name: '',
                student_id: '',
                request_type: 'Student ID Card',
                details: '',
                preferred_date: '',
                preferred_time: ''
            });
            setSlotsInfo(null);
            setError(null);
        }
    }, [isOpen]);

    useEffect(() => {
        if (formData.preferred_date) {
            setLoadingSlots(true);
            setSlotsInfo(null);
            setFormData(prev => ({ ...prev, preferred_time: '' }));
            getAvailableSlots(formData.preferred_date)
                .then(res => setSlotsInfo(res))
                .catch(err => setSlotsInfo({ available: false, reason: 'Failed to load slots.' }))
                .finally(() => setLoadingSlots(false));
        }
    }, [formData.preferred_date]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            const result = await submitAdminRequest(formData);
            onSuccess(result, formData);
            onClose();
        } catch (err) {
            setError(err.message || 'Submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    const getTodayStr = () => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    return (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="modal-content" style={{ background: 'white', padding: '24px', borderRadius: '8px', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
                <h2 style={{ marginTop: 0 }}>Submit an Administrative Pre-Request</h2>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
                    Fill in your details and book a time slot. You will receive a reference code to track your request and be attended to without joining the queue.
                </p>

                {error && <div style={{ color: 'red', marginBottom: '16px', fontWeight: 'bold' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', marginBottom: '4px' }}>Full Name *</label>
                        <input type="text" required style={{ width: '100%', padding: '8px' }} value={formData.student_name} onChange={e => setFormData({...formData, student_name: e.target.value})} />
                    </div>
                    
                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', marginBottom: '4px' }}>Matricule Number *</label>
                        <input type="text" required style={{ width: '100%', padding: '8px' }} value={formData.student_id} onChange={e => setFormData({...formData, student_id: e.target.value})} />
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', marginBottom: '4px' }}>Request Type *</label>
                        <select style={{ width: '100%', padding: '8px' }} value={formData.request_type} onChange={e => setFormData({...formData, request_type: e.target.value})}>
                            <option value="Student ID Card">Student ID Card</option>
                            <option value="Course Registration">Course Registration</option>
                            <option value="Transcript">Transcript</option>
                            <option value="Attestation Letter">Attestation Letter</option>
                            <option value="Bursary Query">Bursary Query</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', marginBottom: '4px' }}>Additional Details (Optional)</label>
                        <textarea style={{ width: '100%', padding: '8px' }} rows="3" value={formData.details} onChange={e => setFormData({...formData, details: e.target.value})} />
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', marginBottom: '4px' }}>Preferred Date *</label>
                        <input 
                            type="date" 
                            required 
                            min={getTodayStr()}
                            style={{ width: '100%', padding: '8px' }} 
                            value={formData.preferred_date} 
                            onChange={e => {
                                const d = new Date(e.target.value);
                                const day = d.getUTCDay();
                                if (day === 0 || day === 6) {
                                    alert('Weekends are not available.');
                                    return;
                                }
                                if (blockedDates.includes(e.target.value)) {
                                    alert('This date is blocked.');
                                    return;
                                }
                                setFormData({...formData, preferred_date: e.target.value});
                            }} 
                        />
                    </div>

                    {loadingSlots && <div style={{ marginBottom: '12px' }}>Loading slots...</div>}

                    {slotsInfo && (
                        <div style={{ marginBottom: '20px' }}>
                            {!slotsInfo.available ? (
                                <div style={{ color: '#856404', backgroundColor: '#fff3cd', padding: '12px', borderRadius: '4px' }}>
                                    ⚠️ {slotsInfo.reason}. Please select a different date.
                                </div>
                            ) : (
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px' }}>Preferred Time Slot *</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                        {slotsInfo.slots.map(s => (
                                            <div 
                                                key={s.time}
                                                onClick={() => {
                                                    if (s.available) setFormData({...formData, preferred_time: s.time});
                                                }}
                                                style={{
                                                    padding: '10px',
                                                    border: formData.preferred_time === s.time ? '2px solid #28a745' : s.available ? '1px solid #28a745' : '1px solid #ccc',
                                                    backgroundColor: s.available ? (formData.preferred_time === s.time ? '#e8f5e9' : 'white') : '#f8f9fa',
                                                    color: s.available ? 'inherit' : '#6c757d',
                                                    cursor: s.available ? 'pointer' : 'not-allowed',
                                                    borderRadius: '4px',
                                                    textAlign: 'center'
                                                }}
                                            >
                                                {s.time} <br/>
                                                {s.available ? '✓ Available' : '✗ Fully Booked'}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                        <button type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}>Cancel</button>
                        <button type="submit" disabled={submitting || !formData.preferred_time} style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', background: 'var(--color-primary, #0056b3)', color: 'white', cursor: (submitting || !formData.preferred_time) ? 'not-allowed' : 'pointer' }}>
                            {submitting ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
