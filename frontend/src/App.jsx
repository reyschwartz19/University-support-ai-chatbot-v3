import React from 'react';
import ChatContainer from './components/ChatContainer';

export default function App() {
    return (
        <div className="app-container">
            <a href="#main-content" className="skip-link">
                Skip to main content
            </a>

            <header className="app-header">
                <div className="app-header__logo">
                    <div className="app-header__icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                        </svg>
                    </div>
                    <h1 className="app-header__title">University Administrative Chatbot</h1>
                </div>
                <p className="app-header__subtitle">
                    Your official source for administrative information and guidance
                </p>
            </header>

            <main id="main-content">
                <ChatContainer />
            </main>

            <footer style={{
                textAlign: 'center',
                padding: '16px',
                color: 'var(--color-gray-500)',
                fontSize: '12px',
                marginTop: '16px'
            }}>
                <p>© 2026 University Administrative Services. All rights reserved.</p>
                <p style={{ marginTop: '4px' }}>
                    For urgent matters, please contact the relevant administrative office directly.
                </p>
            </footer>
        </div>
    );
}
