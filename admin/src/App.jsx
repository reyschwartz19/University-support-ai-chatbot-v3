import React from 'react';
import { Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { isAuthenticated, logout, getCurrentUser } from './services/api';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ChatLogs from './pages/ChatLogs';
import Submissions from './pages/Submissions';
import FAQEditor from './pages/FAQEditor';
import FeedbackReview from './pages/FeedbackReview';

function ProtectedRoute({ children }) {
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }
    return children;
}

function AdminLayout({ children }) {
    const navigate = useNavigate();
    const user = getCurrentUser();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-sidebar__logo">
                    <h1>Admin Dashboard</h1>
                    <span>University Chatbot</span>
                </div>

                <nav>
                    <ul className="admin-sidebar__nav">
                        <li>
                            <NavLink to="/dashboard" className={({ isActive }) => `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="3" width="7" height="7" />
                                    <rect x="14" y="3" width="7" height="7" />
                                    <rect x="14" y="14" width="7" height="7" />
                                    <rect x="3" y="14" width="7" height="7" />
                                </svg>
                                Dashboard
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/chat-logs" className={({ isActive }) => `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                                </svg>
                                Chat Logs
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/feedback" className={({ isActive }) => `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" />
                                </svg>
                                Feedback
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/submissions" className={({ isActive }) => `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 12h6M12 9v6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Submissions
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/faq" className={({ isActive }) => `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                                    <rect x="9" y="3" width="6" height="4" rx="1" />
                                </svg>
                                FAQ Editor
                            </NavLink>
                        </li>
                    </ul>
                </nav>

                <div style={{ marginTop: 'auto', padding: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: '14px', marginBottom: '8px' }}>
                        Signed in as <strong>{user?.username}</strong>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            width: '100%',
                            fontSize: '14px'
                        }}
                    >
                        Sign Out
                    </button>
                </div>
            </aside>

            <main className="admin-main">
                {children}
            </main>
        </div>
    );
}

export default function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <AdminLayout><Dashboard /></AdminLayout>
                </ProtectedRoute>
            } />
            <Route path="/chat-logs" element={
                <ProtectedRoute>
                    <AdminLayout><ChatLogs /></AdminLayout>
                </ProtectedRoute>
            } />
            <Route path="/feedback" element={
                <ProtectedRoute>
                    <AdminLayout><FeedbackReview /></AdminLayout>
                </ProtectedRoute>
            } />
            <Route path="/submissions" element={
                <ProtectedRoute>
                    <AdminLayout><Submissions /></AdminLayout>
                </ProtectedRoute>
            } />
            <Route path="/faq" element={
                <ProtectedRoute>
                    <AdminLayout><FAQEditor /></AdminLayout>
                </ProtectedRoute>
            } />
        </Routes>
    );
}
