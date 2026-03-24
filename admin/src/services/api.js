const API_BASE_URL = (import.meta.env.VITE_API_URL || '') + '/api/admin';

// Get stored token
const getToken = () => localStorage.getItem('adminToken');

// Auth headers
const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
});

// Login
export async function login(username, password) {
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    localStorage.setItem('adminToken', data.token);
    localStorage.setItem('adminUser', JSON.stringify(data.user));
    return data;
}

// Logout
export function logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
}

// Check if logged in
export function isAuthenticated() {
    return !!getToken();
}

// Get current user
export function getCurrentUser() {
    const user = localStorage.getItem('adminUser');
    return user ? JSON.parse(user) : null;
}

// Get stats
export async function getStats() {
    const response = await fetch(`${API_BASE_URL}/stats`, {
        headers: authHeaders()
    });

    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
}

// Get chat logs
export async function getChatLogs(page = 1, perPage = 20) {
    const response = await fetch(
        `${API_BASE_URL}/chat-logs?page=${page}&per_page=${perPage}`,
        { headers: authHeaders() }
    );

    if (!response.ok) throw new Error('Failed to fetch chat logs');
    return response.json();
}

// Get feedback
export async function getFeedback(page = 1, perPage = 20) {
    const response = await fetch(
        `${API_BASE_URL}/feedback?page=${page}&per_page=${perPage}`,
        { headers: authHeaders() }
    );

    if (!response.ok) throw new Error('Failed to fetch feedback');
    return response.json();
}

// Get submissions
export async function getSubmissions(status = 'pending', page = 1, perPage = 20) {
    const response = await fetch(
        `${API_BASE_URL}/submissions?status=${status}&page=${page}&per_page=${perPage}`,
        { headers: authHeaders() }
    );

    if (!response.ok) throw new Error('Failed to fetch submissions');
    return response.json();
}

// Approve submission
export async function approveSubmission(submissionId, answer, category, faculty) {
    const response = await fetch(`${API_BASE_URL}/submissions/${submissionId}/approve`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ answer, category, faculty })
    });

    if (!response.ok) throw new Error('Failed to approve submission');
    return response.json();
}

// Reject submission
export async function rejectSubmission(submissionId) {
    const response = await fetch(`${API_BASE_URL}/submissions/${submissionId}/reject`, {
        method: 'POST',
        headers: authHeaders()
    });

    if (!response.ok) throw new Error('Failed to reject submission');
    return response.json();
}

// Get FAQ entries
export async function getFAQEntries(page = 1, perPage = 20, category = null) {
    let url = `${API_BASE_URL}/faq?page=${page}&per_page=${perPage}`;
    if (category) url += `&category=${category}`;

    const response = await fetch(url, { headers: authHeaders() });

    if (!response.ok) throw new Error('Failed to fetch FAQ entries');
    return response.json();
}

// Create FAQ entry
export async function createFAQEntry(data) {
    const response = await fetch(`${API_BASE_URL}/faq`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error('Failed to create FAQ entry');
    return response.json();
}

// Update FAQ entry
export async function updateFAQEntry(entryId, data) {
    const response = await fetch(`${API_BASE_URL}/faq/${entryId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error('Failed to update FAQ entry');
    return response.json();
}

// Delete FAQ entry
export async function deleteFAQEntry(entryId) {
    const response = await fetch(`${API_BASE_URL}/faq/${entryId}`, {
        method: 'DELETE',
        headers: authHeaders()
    });

    if (!response.ok) throw new Error('Failed to delete FAQ entry');
    return response.json();
}

// Trigger monthly update
export async function triggerUpdate() {
    const response = await fetch(`${API_BASE_URL}/trigger-update`, {
        method: 'POST',
        headers: authHeaders()
    });

    if (!response.ok) throw new Error('Failed to trigger update');
    return response.json();
}
