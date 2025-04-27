// Login and authentication functionality for Financial Literacy App

// DOM Elements
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('error-message');
const submitButton = document.getElementById('submit-btn');
const signupButton = document.getElementById('signup-btn');

// Constants
const AUTH_KEYS = {
    IS_LOGGED_IN: 'isLoggedIn',
    USERNAME: 'username',
    USER_EMAIL: 'userEmail',
    LAST_LOGIN: 'lastLogin',
    CSRF_TOKEN: 'csrfToken'
};

// Base URL for API endpoints
// If running locally, use local backend
const BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost/FinancialLiteracyApp-main/backend' 
    : 'https://financial-backend1.onrender.com';

// API endpoints
const API_ENDPOINTS = {
    LOGIN: `${BASE_URL}/login.php`,
    SIGNUP: `${BASE_URL}/signup.php`,
    CSRF: `${BASE_URL}/get_csrf_token.php`
};

// Log API endpoints for debugging
console.log('API Endpoints:', API_ENDPOINTS);

// CSRF token management
const CSRF = {
    token: null,
    lastFetch: null,
    maxAge: 3600000, // 1 hour in milliseconds
    retryAttempts: 5,  // Increased from 3 to 5
    retryDelay: 2000,  // Increased from 1000 to 2000 milliseconds
    
    async getToken(force = false) {
        try {
            // Check if we have a valid cached token
            if (!force && this.token && this.lastFetch && 
                (Date.now() - this.lastFetch < this.maxAge)) {
                console.log('Using cached CSRF token');
                return this.token;
            }
            
            // Fetch new token
            console.log('Getting fresh CSRF token');
            const token = await this.fetchNewToken();
            this.token = token;
            this.lastFetch = Date.now();
            
            return token;
        } catch (error) {
            console.error('Failed to get CSRF token:', error);
            throw new Error('Could not secure the request. Please try again.');
        }
    },
    
    async fetchNewToken(attempt = 1) {
        try {
            console.log(`Fetching CSRF token, attempt ${attempt}/${this.retryAttempts}`);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // Increased from 5000 to 15000 ms
            
            const response = await fetch(API_ENDPOINTS.CSRF, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                },
                signal: controller.signal,
                mode: 'cors' // Explicitly set CORS mode
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                console.error('CSRF token request failed:', response.status, response.statusText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('CSRF token response:', data);
            
            // Check token in both locations
            if (data.token) {
                return data.token;
            } else if (data.data && data.data.token) {
                return data.data.token;
            } else {
                console.error('Invalid token format:', data);
                throw new Error('Invalid token response format');
            }
            
        } catch (error) {
            console.error(`CSRF token fetch error (attempt ${attempt}/${this.retryAttempts}):`, error);
            
            if (attempt < this.retryAttempts) {
                const retryDelay = this.retryDelay * attempt; // Progressive backoff
                console.log(`Retrying CSRF token fetch in ${retryDelay}ms...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                return this.fetchNewToken(attempt + 1);
            }
            throw error;
        }
    }
};

/**
 * Make a secure API request with CSRF token
 */
async function makeSecureRequest(url, options = {}) {
    try {
        const token = await CSRF.getToken();
        
        const secureOptions = {
            ...options,
            credentials: 'include',
            headers: {
                ...options.headers,
                'X-CSRF-Token': token
            }
        };
        
        const response = await fetch(url, secureOptions);
        
        // If we get a 403 with specific CSRF error, retry with new token
        if (response.status === 403) {
            const data = await response.json();
            if (data.error === 'invalid_csrf') {
                const newToken = await CSRF.getToken(true);
                secureOptions.headers['X-CSRF-Token'] = newToken;
                return fetch(url, secureOptions);
            }
        }
        
        return response;
    } catch (error) {
        console.error('Secure request failed:', error);
        throw new Error('Failed to make secure request');
    }
}

/**
 * Handle login form submission
 */
async function handleLogin(event) {
    event.preventDefault();
    
    try {
        // Disable submit button
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.classList.add('disabled');
        }

        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Validate inputs
        if (!username || !email || !password) {
            throw new Error('Please fill in all fields');
        }

        if (!isValidEmail(email)) {
            throw new Error('Please enter a valid email address');
        }

        const response = await makeSecureRequest(API_ENDPOINTS.LOGIN, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                username,
                email,
                password
            })
        });

        const data = await response.json();
        
        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Login failed');
        }

        // Store auth data
        localStorage.setItem(AUTH_KEYS.IS_LOGGED_IN, 'true');
        localStorage.setItem(AUTH_KEYS.USERNAME, username);
        localStorage.setItem(AUTH_KEYS.USER_EMAIL, email);
        localStorage.setItem(AUTH_KEYS.LAST_LOGIN, new Date().toISOString());

        // Redirect to main app
        redirectToMainApp();

    } catch (error) {
        console.error('Login error:', error);
        showError(error.message || 'An error occurred during login');
    } finally {
        // Re-enable submit button
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.classList.remove('disabled');
        }
    }
}

/**
 * Handle signup form submission
 */
async function handleSignup(event) {
    event.preventDefault();
    
    try {
        // Disable submit button
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.classList.add('disabled');
        }

        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Validate inputs
        if (!username || !email || !password) {
            throw new Error('Please fill in all fields');
        }

        if (!isValidEmail(email)) {
            throw new Error('Please enter a valid email address');
        }

        const response = await makeSecureRequest(API_ENDPOINTS.SIGNUP, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                username,
                email,
                password
            })
        });

        const data = await response.json();
        
        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Signup failed');
        }

        // Store auth data
        localStorage.setItem(AUTH_KEYS.IS_LOGGED_IN, 'true');
        localStorage.setItem(AUTH_KEYS.USERNAME, username);
        localStorage.setItem(AUTH_KEYS.USER_EMAIL, email);
        localStorage.setItem(AUTH_KEYS.LAST_LOGIN, new Date().toISOString());

        // Redirect to main app
        redirectToMainApp();

    } catch (error) {
        console.error('Signup error:', error);
        showError(error.message || 'An error occurred during signup');
    } finally {
        // Re-enable submit button
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.classList.remove('disabled');
        }
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Login page loaded, initializing...');
    
    try {
        // Pre-fetch CSRF token
        await CSRF.getToken();
        
        // Check if user is already logged in
        if (localStorage.getItem(AUTH_KEYS.IS_LOGGED_IN)) {
            console.log('User already logged in, redirecting to main app...');
            redirectToMainApp();
            return;
        }
        
        // Setup login form submission
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
            console.log('Login form event listener attached');
        }

        // Setup signup form submission
        if (signupForm) {
            signupForm.addEventListener('submit', handleSignup);
            console.log('Signup form event listener attached');
        }
        
        console.log('Initialization complete');
    } catch (error) {
        console.error('Initialization failed:', error);
        showError('Failed to initialize login page. Please refresh and try again.');
    }
});

/**
 * Basic email validation using regex
 */
function isValidEmail(email) {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
}

/**
 * Show error message to user
 */
function showError(message, isSignup = false) {
    const errorContainer = isSignup ? 
        document.getElementById('signup-error-message') : 
        errorMessage;
    
    if (errorContainer) {
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
        errorContainer.classList.add('shake');
        
        // Hide error after 3 seconds
        setTimeout(() => {
            errorContainer.style.display = 'none';
            errorContainer.classList.remove('shake');
        }, 3000);
    }
}

/**
 * Redirect to main app
 */
function redirectToMainApp() {
    try {
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Redirect error:', error);
        showError('Failed to redirect. Please try refreshing the page.');
    }
}

// Add form styles
const style = document.createElement('style');
style.textContent = `
    .invalid {
        border-color: #ff4444 !important;
        background-color: rgba(255, 68, 68, 0.1);
    }
    
    .valid {
        border-color: #00C851 !important;
        background-color: rgba(0, 200, 81, 0.1);
    }
    
    .disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
    
    @keyframes shake {
        0% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        50% { transform: translateX(10px); }
        75% { transform: translateX(-10px); }
        100% { transform: translateX(0); }
    }
    
    .shake {
        animation: shake 0.5s ease-in-out;
    }
`;
document.head.appendChild(style); 
