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
    LAST_LOGIN: 'lastLogin'
};

// Base URL for API endpoints
const BASE_URL = 'https://financial-backend1.onrender.com';

// API endpoints
const API_ENDPOINTS = {
    LOGIN: `${BASE_URL}/login.php`,
    SIGNUP: `${BASE_URL}/signup.php`
};

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
        
        console.log('Making login request to:', API_ENDPOINTS.LOGIN);
        const response = await fetch(API_ENDPOINTS.LOGIN, {
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
        
        console.log('Making signup request to:', API_ENDPOINTS.SIGNUP);
        const response = await fetch(API_ENDPOINTS.SIGNUP, {
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
document.addEventListener('DOMContentLoaded', function() {
    console.log('Login page loaded, initializing...');
    
    try {
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
