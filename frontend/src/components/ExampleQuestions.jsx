import React from 'react';

const EXAMPLE_QUESTIONS = [
    "What are the registration deadlines?",
    "How do I pay my tuition fees?",
    "Where is the Registrar's Office?",
    "What are the examination rules?",
    "How do I apply for a transcript?"
];

export default function ExampleQuestions({ onSelectQuestion }) {
    return (
        <div className="example-questions" role="region" aria-label="Example questions">
            <div className="example-questions__title">
                <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                Try asking:
            </div>
            <div className="example-questions__list" role="list">
                {EXAMPLE_QUESTIONS.map((question, index) => (
                    <button
                        key={index}
                        className="example-questions__item"
                        onClick={() => onSelectQuestion(question)}
                        role="listitem"
                    >
                        {question}
                    </button>
                ))}
            </div>
        </div>
    );
}
