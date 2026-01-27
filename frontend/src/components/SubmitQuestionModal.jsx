import React from 'react';

export default function SubmitQuestionModal({ isOpen, onClose, onSubmit, initialQuestion = '' }) {
    const [question, setQuestion] = React.useState(initialQuestion);
    const [context, setContext] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [submitted, setSubmitted] = React.useState(false);

    React.useEffect(() => {
        if (isOpen) {
            setQuestion(initialQuestion);
            setContext('');
            setSubmitted(false);
        }
    }, [isOpen, initialQuestion]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!question.trim()) return;

        setIsSubmitting(true);
        try {
            await onSubmit(question, context);
            setSubmitted(true);
        } catch (error) {
            console.error('Submit error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="modal-overlay"
            onClick={(e) => e.target === e.currentTarget && onClose()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div className="modal">
                {submitted ? (
                    <>
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                margin: '0 auto 16px',
                                background: 'var(--color-success)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <svg viewBox="0 0 20 20" fill="white" width="32" height="32">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h3 style={{ marginBottom: '8px', color: 'var(--color-gray-800)' }}>
                                Question Submitted
                            </h3>
                            <p style={{ color: 'var(--color-gray-600)', marginBottom: '24px' }}>
                                Thank you! Your question has been submitted for review by our administrative team.
                            </p>
                            <button
                                className="modal__button modal__button--primary"
                                onClick={onClose}
                            >
                                Close
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <h2 id="modal-title" className="modal__title">
                            Submit Your Question
                        </h2>
                        <p style={{ color: 'var(--color-gray-600)', marginBottom: '16px', fontSize: '14px' }}>
                            Your question will be reviewed by our administrative team and may be added to our knowledge base.
                        </p>
                        <form className="modal__form" onSubmit={handleSubmit}>
                            <div className="modal__field">
                                <label htmlFor="question" className="modal__label">
                                    Your Question *
                                </label>
                                <textarea
                                    id="question"
                                    className="modal__textarea"
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    placeholder="Enter your administrative question..."
                                    required
                                    maxLength={1000}
                                />
                            </div>
                            <div className="modal__field">
                                <label htmlFor="context" className="modal__label">
                                    Additional Context (Optional)
                                </label>
                                <textarea
                                    id="context"
                                    className="modal__textarea"
                                    value={context}
                                    onChange={(e) => setContext(e.target.value)}
                                    placeholder="Provide any additional context that might help..."
                                    style={{ minHeight: '80px' }}
                                    maxLength={500}
                                />
                            </div>
                            <div className="modal__actions">
                                <button
                                    type="button"
                                    className="modal__button modal__button--secondary"
                                    onClick={onClose}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="modal__button modal__button--primary"
                                    disabled={isSubmitting || !question.trim()}
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Question'}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
