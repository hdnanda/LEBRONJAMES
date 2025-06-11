/**
 * Connection Helper for TheMoneyOlympics
 * This file provides utility functions to simplify API calls with proper error handling
 */

// API configuration
const API_CONFIG = {
    // Use relative paths for local development
    BASE_URL: '',
    FALLBACK_URL: 'https://financial-frontend-3xkp.onrender.com',
    BACKEND_URL: 'https://financial-backend1.onrender.com',
    // Timeout for API requests in milliseconds
    TIMEOUT_MS: 10000
};

// Connection Helper object
const ConnectionHelper = {
    API_CONFIG: API_CONFIG,
    /**
     * Make an API request with error handling and fallback
     * @param {string} endpoint - API endpoint (e.g., 'xp_handler.php')
     * @param {Object} options - Fetch options
     * @returns {Promise} - Promise resolving to JSON response
     */
    request: async function(endpoint, options = {}) {
        // Default options
        const defaultOptions = {
            credentials: 'omit', // Changed from 'include' to avoid CORS preflight issues
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            mode: 'cors' // Explicitly request CORS mode
        };
        
        // Merge options
        const baseFetchOptions = {...defaultOptions, ...options};
        
        const cleanEndpoint = endpoint.replace('backend/', '');
        let lastError = null;

        // 1. Try direct backend URL
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.API_CONFIG.TIMEOUT_MS);
            const fetchOptions = { ...baseFetchOptions, signal: controller.signal };
            
            const directUrl = `${this.API_CONFIG.BACKEND_URL}/${cleanEndpoint}`;
            console.log(`[ConnectionHelper] Trying direct URL: ${directUrl}`);
            
            const response = await fetch(directUrl, fetchOptions);
            clearTimeout(timeoutId);

            if (response.ok) {
                console.log(`[ConnectionHelper] Direct URL succeeded: ${directUrl}`);
                return await response.json();
            }
            // Throw a more detailed error for non-OK responses
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
        } catch (error) {
            console.error(`[ConnectionHelper] Request to backend failed: ${error.message}`);
            lastError = error;
        }

        // If all attempts failed
        console.error(`[ConnectionHelper] All connection attempts failed.`);
        throw new Error(`All connection attempts failed. Last error: ${lastError.message}`);
    },
    
    /**
     * Test database connection
     * @returns {Promise} - Promise resolving to connection status
     */
    testConnection: async function() {
        try {
            const response = await fetch(`${this.API_CONFIG.BACKEND_URL}/connection_test.php`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('[ConnectionHelper] Connection test successful:', data);
            return data;
        } catch (error) {
            console.error('[ConnectionHelper] Connection test failed:', error);
            return {
                success: false,
                error: error.message || 'Connection failed'
            };
        }
    },
    
    /**
     * Get user XP
     * @returns {Promise} - Promise resolving to user XP
     */
    getUserXP: async function() {
        try {
            // Get username from auth if available, with better fallback mechanism
            let username = 'guest';
            
            // First try to get username from auth object
            if (window.auth && typeof window.auth.getCurrentUser === 'function') {
                const authUsername = window.auth.getCurrentUser();
                if (authUsername) {
                    username = authUsername;
                }
            } 
            // If that fails, try localStorage directly
            else if (localStorage.getItem('username')) {
                username = localStorage.getItem('username');
            }
            
            console.log(`[ConnectionHelper] Fetching XP for user: ${username}`);
            
            if (username === 'guest') {
                console.warn('[ConnectionHelper] No username available, using guest account');
            }
            
            // Force direct backend URL for xp_handler.php - use query param instead of header
            const directUrl = `${this.API_CONFIG.BACKEND_URL}/xp_handler.php?username=${encodeURIComponent(username)}`;
            console.log(`[ConnectionHelper] Using direct backend URL: ${directUrl}`);
            
            const response = await fetch(directUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                mode: 'cors'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('[ConnectionHelper] XP data received:', data);
            
            // Validate and standardize response
            if (data && data.success === true && typeof data.xp !== 'undefined') {
                return {
                    success: true,
                    xp: parseInt(data.xp) || 0,
                    level: parseInt(data.level) || 1,
                    message: data.message || 'XP retrieved successfully',
                    completed_levels: data.completed_levels || [], // Ensure this is passed through
                    completed_exams: data.completed_exams || []   // Ensure this is passed through
                };
            } else if (data && typeof data.xp !== 'undefined') { // Fallback for older format if success flag is missing but xp is there
                 console.warn('[ConnectionHelper] XP response format is missing success flag but has XP. Processing partially.');
                 return {
                    success: true, // Assume success if XP is present
                    xp: parseInt(data.xp) || 0,
                    level: parseInt(data.level) || 1,
                    message: data.message || 'XP retrieved successfully (assumed success)',
                    completed_levels: data.completed_levels || [],
                    completed_exams: data.completed_exams || []
                };
            }
            else {
                console.warn('[ConnectionHelper] Invalid XP response format or request failed:', data);
                return {
                    success: false,
                    xp: 0,
                    level: 1,
                    message: data.message || 'Invalid response format from server or failed request',
                    completed_levels: [], // Ensure these are present in failure cases too
                    completed_exams: []
                };
            }
        } catch (error) {
            console.error('[ConnectionHelper] Failed to get user XP:', error);
            // Return 0 as default XP if server connection fails
            return {
                success: false,
                xp: 0,
                level: 1,
                message: 'Could not connect to server: ' + (error.message || 'Unknown error'),
                completed_levels: [],
                completed_exams: []
            };
        }
    },
    
    /**
     * Update user XP on the server
     * @param {number} xp - The new XP value
     * @param {Array} completedLevels - Optional array of completed levels
     * @param {Array} completedExams - Optional array of completed exams
     * @returns {Promise} - Promise resolving to updated user data
     */
    updateXP: async function(xp, completedLevels = [], completedExams = []) {
        try {
            // Get username with better fallback mechanism
            let username = 'guest';
            
            // First try to get username from auth object
            if (window.auth && typeof window.auth.getCurrentUser === 'function') {
                const authUsername = window.auth.getCurrentUser();
                if (authUsername) {
                    username = authUsername;
                }
            } 
            // If that fails, try localStorage directly
            else if (localStorage.getItem('username')) {
                username = localStorage.getItem('username');
            }
            
            console.log(`[ConnectionHelper] Updating XP to ${xp} for user: ${username}`);
            
            if (username === 'guest') {
                console.warn('[ConnectionHelper] No username available, using guest account');
            }
            
            const data = {
                xp: xp,
                completed_levels: completedLevels,
                completed_exams: completedExams,
                username: username // Include username in body
            };
            
            // Force direct backend URL for xp_handler.php
            const directUrl = `${this.API_CONFIG.BACKEND_URL}/xp_handler.php`;
            console.log(`[ConnectionHelper] Using direct backend URL: ${directUrl}`);
            
            const response = await fetch(directUrl, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                mode: 'cors',
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('[ConnectionHelper] Update XP response:', result);
            
            // Validate and standardize response
            if (result && typeof result.xp !== 'undefined') {
                return {
                    success: true,
                    xp: parseInt(result.xp) || 0,
                    level: parseInt(result.level) || 1,
                    message: result.message || 'XP updated successfully'
                };
            } else {
                console.warn('[ConnectionHelper] Invalid update response format:', result);
                return {
                    success: false,
                    xp: xp, // Return the XP we tried to set
                    message: 'Invalid response format from server'
                };
            }
        } catch (error) {
            console.error('[ConnectionHelper] Failed to update XP:', error);
            return {
                success: false,
                xp: xp, // Return the XP we tried to set
                message: 'Failed to update XP on server: ' + (error.message || 'Unknown error')
            };
        }
    },
    
    /**
     * Login test user
     * @returns {Promise} - Promise resolving to login status
     */
    loginTestUser: async function() {
        try {
            console.log('[ConnectionHelper] Logging in test user');
            return {
                success: true,
                message: 'Test user authenticated',
                username: 'test'
            };
        } catch (error) {
            console.error('[ConnectionHelper] Login failed:', error);
            throw error;
        }
    },
    
    /**
     * Update user XP on the server.
     * @param {number} xp - The new XP value.
     * @param {Array} completedLevels - Array of completed level objects.
     * @param {Array} completedExams - Array of completed exam IDs.
     * @returns {Promise} - Promise resolving to the server's response.
     */
    updateUserXP: async function(xp, completedLevels = [], completedExams = []) {
        let username = 'guest';
        if (window.auth && typeof window.auth.getCurrentUser === 'function') {
            const authUsername = window.auth.getCurrentUser();
            if (authUsername) username = authUsername;
        } else if (localStorage.getItem('username')) {
            username = localStorage.getItem('username');
        }

        console.log(`[ConnectionHelper] Updating XP for user: ${username}`);
        if (username === 'guest') {
            console.warn('[ConnectionHelper] Cannot update XP for guest user on the server.');
            return { success: false, error: 'Guest user data is not saved to the server.' };
        }
        
        const endpoint = `${this.API_CONFIG.BACKEND_URL}/xp_handler.php`;
        const body = {
            username: username,
            xp: xp,
            completed_levels: completedLevels,
            completed_exams: completedExams
        };

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body),
                mode: 'cors'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('[ConnectionHelper] XP update response:', data);
            return data;
        } catch (error) {
            console.error(`[ConnectionHelper] Failed to update user XP:`, error);
            throw error;
        }
    },
    
    /**
     * Get CSRF token
     * @returns {Promise}
     */
    getCSRFToken: async function() {
        // Implementation of getCSRFToken function
    },
    
    /**
     * Sign up a new user
     * @param {string} username
     * @param {string} email
     * @param {string} password
     * @returns {Promise<any>}
     */
    signup: async function(username, email, password) {
        console.log(`[ConnectionHelper] Signing up user: ${username}`);
        return this.request('backend/signup.php', {
            method: 'POST',
            body: JSON.stringify({ username, email, password })
        });
    }
};

// Make available globally
window.ConnectionHelper = ConnectionHelper;

// Add this for extra assurance
if (typeof ConnectionHelper !== 'undefined' && !window.ConnectionHelper) {
    console.log('[ConnectionHelper] Re-applying global assignment');
    window.ConnectionHelper = ConnectionHelper;
}

// Log successful initialization
console.log('[ConnectionHelper] Successfully initialized and attached to window');

// For modules that might need it
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConnectionHelper;
} 
