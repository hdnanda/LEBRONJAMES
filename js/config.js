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

// Development mode settings
const DEVELOPMENT_MODE = true; // Set to false to use actual backend when available

// XP system configuration
const XP_SYSTEM = {
    LEVELS: {
        1: { baseXP: 10, requirement: 0 },
        2: { baseXP: 15, requirement: 100 },
        3: { baseXP: 20, requirement: 250 },
        4: { baseXP: 25, requirement: 450 },
        5: { baseXP: 30, requirement: 700 }
    },
    BONUSES: {
        STREAK: 5,
        SPEED: 3,
        PERFECT: 10,
        EXAM: 20
    }
};

// Export the configuration
window.APP_CONFIG = {
    BASE_URL,
    API_ENDPOINTS,
    isProduction,
    DEVELOPMENT_MODE,
    XP_SYSTEM
}; 