import React from 'react';

export default function MessageBubble({ message, onFeedback }) {
    const isUser = message.type === 'user';
    const [feedbackGiven, setFeedbackGiven] = React.useState(null);

    const handleFeedback = async (rating) => {
        if (feedbackGiven) return;
        setFeedbackGiven(rating);
        if (onFeedback && message.chatId) {
            await onFeedback(message.chatId, rating);
        }
    };

    return (
        <div
            className={`message message--${isUser ? 'user' : 'bot'}`}
            role="article"
            aria-label={isUser ? 'Your message' : 'Assistant response'}
        >
            <div className="message__avatar" aria-hidden="true">
                {isUser ? 'You' : 'UA'}
            </div>
            <div className="message__content">
                <div className="message__text">{message.text}</div>
                {!isUser && message.confidence !== undefined && (
                    <div className="message__meta">
                        <span className="message__confidence">
                            <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {Math.round(message.confidence * 100)}% confident
                        </span>
                        {message.fallback && (
                            <span className="message__fallback-badge">Fallback response</span>
                        )}
                    </div>
                )}
                {!isUser && message.chatId && !feedbackGiven && (
                    <div className="feedback-buttons" role="group" aria-label="Rate this response">
                        <button
                            className="feedback-button"
                            onClick={() => handleFeedback('up')}
                            aria-label="Helpful response"
                        >
                            <svg viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                            </svg>
                            Helpful
                        </button>
                        <button
                            className="feedback-button"
                            onClick={() => handleFeedback('down')}
                            aria-label="Not helpful response"
                        >
                            <svg viewBox="0 0 20 20" fill="currentColor">
                                <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.106-1.79l-.05-.025A4 4 0 0011.057 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                            </svg>
                            Not helpful
                        </button>
                    </div>
                )}
                {feedbackGiven && (
                    <div className="message__meta" style={{ marginTop: '8px' }}>
                        <span style={{ color: 'var(--color-success)', fontSize: '12px' }}>
                            ✓ Thank you for your feedback
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
