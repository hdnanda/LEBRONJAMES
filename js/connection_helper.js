/**
 * Connection Helper for TheMoneyOlympics
 * This file provides utility functions to simplify API calls with proper error handling
 */

// API configuration
const API_CONFIG = {
    // Use relative paths for local development
    BASE_URL: '',
    FALLBACK_URL: 'https://financial-backend1.onrender.com',
    // Timeout for API requests in milliseconds
    TIMEOUT_MS: 5000
};

// Connection Helper object
const ConnectionHelper = {
    /**
     * Make an API request with error handling and fallback
     * @param {string} endpoint - API endpoint (e.g., 'backend/dummy_user.php')
     * @param {Object} options - Fetch options
     * @returns {Promise} - Promise resolving to JSON response
     */
    request: async function(endpoint, options = {}) {
        // Default options
        const defaultOptions = {
            credentials: 'include',
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
            // First try direct fallback URL instead of local endpoint
            console.log(`[ConnectionHelper] Trying with fallback URL: ${endpoint}`);
            
            // Remove 'backend/' prefix when using the fallback URL since the paths are already at root
            const cleanEndpoint = endpoint.replace('backend/', '');
            const fallbackUrl = `${API_CONFIG.FALLBACK_URL}/${cleanEndpoint}`;
            console.log(`[ConnectionHelper] Request URL: ${fallbackUrl}`);
            
            const response = await fetch(fallbackUrl, fetchOptions);
            
            // If response is not OK, throw error
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Parse JSON response
            const data = await response.json();
            return data;
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
            return await this.request('connection_test.php');
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
            console.log('[ConnectionHelper] Fetching XP for user: test');
            // Return direct request to xp_handler.php with the fallback URL
            return await this.request('xp_handler.php');
        } catch (error) {
            console.error('[ConnectionHelper] Failed to get user XP:', error);
            // Return 0 as default XP
            return {
                success: false,
                xp: 0
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
