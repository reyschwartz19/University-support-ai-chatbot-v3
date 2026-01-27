import React, { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import ExampleQuestions from './ExampleQuestions';
import ErrorMessage from './ErrorMessage';
import SubmitQuestionModal from './SubmitQuestionModal';
import { sendChatMessage, submitFeedback, submitQuestion } from '../services/api';

export default function ChatContainer() {
    const [messages, setMessages] = React.useState([]);
    const [inputValue, setInputValue] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [showSubmitModal, setShowSubmitModal] = React.useState(false);
    const [pendingQuestion, setPendingQuestion] = React.useState('');

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSendMessage = async (messageText = inputValue) => {
        if (!messageText.trim() || isLoading) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            text: messageText.trim()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setError(null);
        setIsLoading(true);

        try {
            const response = await sendChatMessage(messageText.trim());

            const botMessage = {
                id: Date.now() + 1,
                type: 'bot',
                text: response.response,
                confidence: response.confidence,
                fallback: response.fallback,
                chatId: response.chat_id
            };

            setMessages(prev => [...prev, botMessage]);

            // If fallback, offer to submit question
            if (response.fallback) {
                setPendingQuestion(messageText.trim());
            }

        } catch (err) {
            setError(err.message || 'Failed to get response. Please try again.');
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    const handleFeedback = async (chatId, rating) => {
        try {
            await submitFeedback(chatId, rating);
        } catch (err) {
            console.error('Feedback error:', err);
        }
    };

    const handleSubmitQuestion = async (question, context) => {
        await submitQuestion(question, context);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleExampleQuestion = (question) => {
        handleSendMessage(question);
    };

    return (
        <div className="chat-container">
            <ExampleQuestions onSelectQuestion={handleExampleQuestion} />

            <div
                className="chat-messages"
                role="log"
                aria-live="polite"
                aria-label="Chat messages"
            >
                {messages.length === 0 && (
                    <div className="welcome-message">
                        <div className="welcome-message__icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <h2 className="welcome-message__title">Welcome to University Administrative Support</h2>
                        <p className="welcome-message__text">
                            I am here to assist you with administrative inquiries regarding registration, fees, examinations,
                            academic calendar, and university offices. Please type your question below or select from the examples above.
                        </p>
                    </div>
                )}

                {messages.map(message => (
                    <MessageBubble
                        key={message.id}
                        message={message}
                        onFeedback={handleFeedback}
                    />
                ))}

                {isLoading && <TypingIndicator />}

                <div ref={messagesEndRef} />
            </div>

            {error && (
                <ErrorMessage
                    message={error}
                    onDismiss={() => setError(null)}
                />
            )}

            {pendingQuestion && !showSubmitModal && messages.length > 0 && messages[messages.length - 1]?.fallback && (
                <div style={{
                    padding: '12px 24px',
                    background: 'var(--color-gray-50)',
                    borderTop: '1px solid var(--color-gray-200)',
                    textAlign: 'center'
                }}>
                    <button
                        onClick={() => setShowSubmitModal(true)}
                        style={{
                            background: 'var(--color-secondary)',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500'
                        }}
                    >
                        Submit this question for review
                    </button>
                </div>
            )}

            <div className="chat-input">
                <textarea
                    ref={inputRef}
                    className="chat-input__field"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your administrative question here..."
                    aria-label="Type your message"
                    rows={1}
                    disabled={isLoading}
                />
                <button
                    className="chat-input__button"
                    onClick={() => handleSendMessage()}
                    disabled={!inputValue.trim() || isLoading}
                    aria-label="Send message"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </button>
            </div>

            <SubmitQuestionModal
                isOpen={showSubmitModal}
                onClose={() => {
                    setShowSubmitModal(false);
                    setPendingQuestion('');
                }}
                onSubmit={handleSubmitQuestion}
                initialQuestion={pendingQuestion}
            />
        </div>
    );
}
