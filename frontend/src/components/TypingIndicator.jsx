import React from 'react';

export default function TypingIndicator() {
    return (
        <div className="typing-indicator" role="status" aria-label="Assistant is typing">
            <div className="typing-indicator__avatar">UA</div>
            <div className="typing-indicator__dots">
                <span className="typing-indicator__dot"></span>
                <span className="typing-indicator__dot"></span>
                <span className="typing-indicator__dot"></span>
            </div>
        </div>
    );
}
