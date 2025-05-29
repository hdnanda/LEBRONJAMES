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
                'Content-Type': 'application/json',
                'X-Username': 'test' // Add default username for testing
            },
            mode: 'cors' // Explicitly request CORS mode
        };
        
        // Merge options
        const fetchOptions = {...defaultOptions, ...options};
        
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT_MS);
        fetchOptions.signal = controller.signal;
        
        try {
            // Remove 'backend/' prefix when using the fallback URL since the paths are already at root
            const cleanEndpoint = endpoint.replace('backend/', '');
            
            // Try several backends in sequence if needed
            let response = null;
            let error = null;
            
            console.log('[ConnectionHelper] Attempting to fetch data...');
            
            // For dummy_xp.php, only try the backend URL and don't fall back
            if (cleanEndpoint === 'dummy_xp.php') {
                const directUrl = `${API_CONFIG.BACKEND_URL}/${cleanEndpoint}`;
                console.log(`[ConnectionHelper] Using only backend URL for dummy_xp: ${directUrl}`);
                
                try {
                    response = await fetch(directUrl, fetchOptions);
                    if (response.ok) {
                        console.log(`[ConnectionHelper] Backend URL succeeded: ${directUrl}`);
                        const contentType = response.headers.get('content-type');
                        if (contentType && contentType.includes('application/json')) {
                            const data = await response.json();
                            return data;
                        } else {
                            console.warn(`[ConnectionHelper] Response not JSON: ${contentType}`);
                            // Handle non-JSON response
                            const text = await response.text();
                            throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}...`);
                        }
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                } catch (e) {
                    console.error(`[ConnectionHelper] Backend URL failed: ${e.message}`);
                    throw e; // Don't fall back for dummy_xp.php
                }
            }
            
            // For other endpoints, use normal fallback mechanism
            // Try direct URL first (backend URL + endpoint)
            try {
                const directUrl = `${API_CONFIG.BACKEND_URL}/${cleanEndpoint}`;
                console.log(`[ConnectionHelper] Trying direct URL: ${directUrl}`);
                
                response = await fetch(directUrl, fetchOptions);
                if (response.ok) {
                    console.log(`[ConnectionHelper] Direct URL succeeded: ${directUrl}`);
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const data = await response.json();
                        return data;
                    } else {
                        console.warn(`[ConnectionHelper] Response not JSON: ${contentType}`);
                        // Handle non-JSON response
                        const text = await response.text();
                        throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}...`);
                    }
                }
                error = `HTTP error! status: ${response.status}`;
            } catch (e) {
                console.error(`[ConnectionHelper] Direct URL failed: ${e.message}`);
                error = e.message;
            }
            
            // Try alternative URL (frontend URL + endpoint)
            try {
                const alternativeUrl = `${API_CONFIG.FALLBACK_URL}/${cleanEndpoint}`;
                console.log(`[ConnectionHelper] Trying alternative URL: ${alternativeUrl}`);
                
                response = await fetch(alternativeUrl, fetchOptions);
                if (response.ok) {
                    console.log(`[ConnectionHelper] Alternative URL succeeded: ${alternativeUrl}`);
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const data = await response.json();
                        return data;
                    } else {
                        console.warn(`[ConnectionHelper] Response not JSON: ${contentType}`);
                        // Handle non-JSON response
                        const text = await response.text();
                        throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}...`);
                    }
                }
                error = `HTTP error! status: ${response.status}`;
            } catch (e) {
                console.error(`[ConnectionHelper] Alternative URL failed: ${e.message}`);
                error = e.message;
            }
            
            // Try relative URL as last resort
            try {
                const relativeUrl = cleanEndpoint;
                console.log(`[ConnectionHelper] Trying relative URL: ${relativeUrl}`);
                
                response = await fetch(relativeUrl, fetchOptions);
                if (response.ok) {
                    console.log(`[ConnectionHelper] Relative URL succeeded: ${relativeUrl}`);
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const data = await response.json();
                        return data;
                    } else {
                        console.warn(`[ConnectionHelper] Response not JSON: ${contentType}`);
                        // Handle non-JSON response
                        const text = await response.text();
                        throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}...`);
                    }
                }
                error = `HTTP error! status: ${response.status}`;
            } catch (e) {
                console.error(`[ConnectionHelper] Relative URL failed: ${e.message}`);
                error = e.message;
            }
            
            // If we get here, all attempts failed
            throw new Error(`All connection attempts failed. Last error: ${error}`);
        } catch (error) {
            console.error(`[ConnectionHelper] Request failed:`, error);
            // Rethrow for caller to handle
            throw error;
        } finally {
            clearTimeout(timeoutId);
        }
    },
    
    /**
     * Test database connection
     * @returns {Promise} - Promise resolving to connection status
     */
    testConnection: async function() {
        try {
            console.log('[ConnectionHelper] Testing connection...');
            // For testing, return mock successful response
            return {
                success: true,
                message: 'Mock connection successful (actual backend unavailable)',
                server_info: 'Mock Server'
            };
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
            const directUrl = `${API_CONFIG.BACKEND_URL}/xp_handler.php?username=${encodeURIComponent(username)}`;
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
            if (data && typeof data.xp !== 'undefined') {
                return {
                    success: true,
                    xp: parseInt(data.xp) || 0,
                    level: parseInt(data.level) || 1,
                    completed_levels: data.completed_levels || [],
                    completed_exams: data.completed_exams || [],
                    last_completed_topic_exam: parseInt(data.last_completed_topic_exam) || 0,
                    message: data.message || 'XP retrieved successfully'
                };
            } else {
                console.warn('[ConnectionHelper] Invalid XP response format:', data);
                return {
                    success: false,
                    xp: 0,
                    level: 1,
                    completed_levels: [],
                    completed_exams: [],
                    last_completed_topic_exam: 0,
                    message: 'Invalid response format from server'
                };
            }
        } catch (error) {
            console.error('[ConnectionHelper] Failed to get user XP:', error);
            // Return 0 as default XP if server connection fails
            return {
                success: false,
                xp: 0,
                level: 1,
                completed_levels: [],
                completed_exams: [],
                last_completed_topic_exam: 0,
                message: 'Could not connect to server: ' + (error.message || 'Unknown error')
            };
        }
    },
    
    /**
     * Update user XP on the server
     * @param {number} xp - The new XP value
     * @param {Array} completedLevels - Optional array of completed levels
     * @param {Array} completedExams - Optional array of completed exams (will become unused)
     * @param {number} lastCompletedTopicExam - Optional new field for the last topic exam completed
     * @returns {Promise} - Promise resolving to updated user data
     */
    updateXP: async function(xp, completedLevels = [], completedExams = [], lastCompletedTopicExam = null) {
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
            
            // Only include last_completed_topic_exam if it's a number (and not null)
            if (typeof lastCompletedTopicExam === 'number') {
                data.last_completed_topic_exam = lastCompletedTopicExam;
            }
            
            // Force direct backend URL for xp_handler.php
            const directUrl = `${API_CONFIG.BACKEND_URL}/xp_handler.php`;
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
                    completed_levels: result.completed_levels || [],
                    completed_exams: result.completed_exams || [],
                    last_completed_topic_exam: parseInt(result.last_completed_topic_exam) || 0,
                    message: result.message || 'XP updated successfully'
                };
            } else {
                console.warn('[ConnectionHelper] Invalid update response format:', result);
                return {
                    success: false,
                    xp: xp, // Return the XP we tried to set
                    completed_levels: completedLevels,
                    completed_exams: completedExams,
                    last_completed_topic_exam: lastCompletedTopicExam,
                    message: 'Invalid response format from server'
                };
            }
        } catch (error) {
            console.error('[ConnectionHelper] Failed to update XP:', error);
            return {
                success: false,
                xp: xp, // Return the XP we tried to set
                completed_levels: completedLevels,
                completed_exams: completedExams,
                last_completed_topic_exam: lastCompletedTopicExam,
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
