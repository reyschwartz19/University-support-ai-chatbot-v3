const API_BASE_URL = (import.meta.env.VITE_API_URL || '') + '/api';

/**
 * Send a chat message and get a response
 * @param {string} message - The user's message
 * @returns {Promise<Object>} - The chat response
 */
export async function sendChatMessage(message) {
    const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
    }

    return response.json();
}

/**
 * Submit feedback for a chat response
 * @param {string} chatId - The chat ID
 * @param {string} rating - 'up' or 'down'
 * @param {string} comment - Optional comment
 * @returns {Promise<Object>}
 */
export async function submitFeedback(chatId, rating, comment = '') {
    const response = await fetch(`${API_BASE_URL}/feedback`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chat_id: chatId, rating, comment }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit feedback');
    }

    return response.json();
}

/**
 * Submit a question for admin review
 * @param {string} question - The question
 * @param {string} context - Additional context
 * @returns {Promise<Object>}
 */
export async function submitQuestion(question, context = '') {
    const response = await fetch(`${API_BASE_URL}/faq-submission`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question, context }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit question');
    }

    return response.json();
}

/**
 * Get FAQ categories
 * @returns {Promise<Object>}
 */
export async function getCategories() {
    const response = await fetch(`${API_BASE_URL}/faq-categories`);

    if (!response.ok) {
        throw new Error('Failed to fetch categories');
    }

    return response.json();
}

/**
 * Health check
 * @returns {Promise<Object>}
 */
export async function healthCheck() {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
}

/**
 * Submit an administrative request
 */
export async function submitAdminRequest(data) {
    const response = await fetch(`${API_BASE_URL}/requests/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Failed to submit request');
    return result;
}

/**
 * Get request status
 */
export async function getRequestStatus(referenceCode) {
    const response = await fetch(`${API_BASE_URL}/requests/status/${referenceCode}`);
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Failed to check status');
    return result;
}

/**
 * Get available slots for a date
 */
export async function getAvailableSlots(date) {
    const response = await fetch(`${API_BASE_URL}/requests/slots?date=${date}`);
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Failed to get slots');
    return result;
}

/**
 * Get blocked dates
 */
export async function getBlockedDates() {
    const response = await fetch(`${API_BASE_URL}/requests/blocked-dates`);
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Failed to get blocked dates');
    return result;
}
