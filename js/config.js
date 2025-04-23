// Configuration for the Financial Literacy App

// Determine if we're in production (Render) or local development
const isProduction = window.location.hostname.includes('onrender.com');

// Set the base URL for API endpoints
const BASE_URL = isProduction
    ? 'https://financial-backend1.onrender.com'
    : 'http://localhost/FinancialLiteracyApp-main/backend';

// API endpoints
const API_ENDPOINTS = {
    LOGIN: `${BASE_URL}/login.php`,
    SIGNUP: `${BASE_URL}/signup.php`,
    CSRF_TOKEN: `${BASE_URL}/get_csrf_token.php`,
    XP_HANDLER: `${BASE_URL}/xp_handler.php`
};

// Export the configuration
window.APP_CONFIG = {
    BASE_URL,
    API_ENDPOINTS,
    isProduction
}; 