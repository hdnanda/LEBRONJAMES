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
    SIGNUP: `${BASE_URL}/signup.php`,
    CSRF_TOKEN: `${BASE_URL}/get_csrf_token.php`
};

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('Login page loaded, initializing...');
    
    try {
        // Validate all required DOM elements exist
        const requiredElements = {
            'login-form': loginForm,
            'signup-form': signupForm,
            'username': usernameInput,
            'email': emailInput,
            'password': passwordInput,
            'error-message': errorMessage,
            'submit-btn': submitButton,
            'signup-btn': signupButton
        };

        let missingElements = [];
        for (const [name, element] of Object.entries(requiredElements)) {
            if (!element) {
                missingElements.push(name);
                console.error(`Required element "${name}" not found!`);
            }
        }

        if (missingElements.length > 0) {
            throw new Error(`Missing required elements: ${missingElements.join(', ')}`);
        }
        
        // Initialize theme
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        const themeIcon = document.querySelector('.theme-toggle i');
        if (themeIcon) {
            themeIcon.className = savedTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
        }
        
        // Check if user is already logged in
        if (localStorage.getItem(AUTH_KEYS.IS_LOGGED_IN)) {
            console.log('User already logged in, redirecting to main app...');
            redirectToMainApp();
            return;
        }
        
        // Setup login form submission
        loginForm.addEventListener('submit', handleLogin);
        console.log('Login form event listener attached');

        // Setup signup form submission
        signupForm.addEventListener('submit', handleSignup);
        console.log('Signup form event listener attached');
        
        // Setup input validation
        setupInputValidation();
        
        console.log('Initialization complete');
    } catch (error) {
        console.error('Initialization failed:', error);
        showError('Failed to initialize login page. Please refresh and try again.');
    }
});

/**
 * Set up real-time input validation
 */
function setupInputValidation() {
    const inputs = [usernameInput, emailInput, passwordInput];
    
    inputs.forEach(input => {
        if (input) {
            input.addEventListener('input', () => {
                validateInput(input);
                updateSubmitButton();
            });
        }
    });
}

/**
 * Validate individual input field
 */
function validateInput(input) {
    const value = input.value.trim();
    let isValid = true;
    let errorMsg = '';
    
    switch(input.id) {
        case 'username':
            isValid = value.length >= 3 && /^[a-zA-Z0-9_]+$/.test(value);
            errorMsg = 'Username must be at least 3 characters long and contain only letters, numbers, and underscores';
            break;
        case 'email':
            isValid = isValidEmail(value);
            errorMsg = 'Please enter a valid email address';
            break;
        case 'password':
            isValid = validatePassword(value);
            errorMsg = 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character';
            break;
    }
    
    // Update input styling
    input.classList.toggle('invalid', !isValid);
    input.classList.toggle('valid', isValid && value.length > 0);
    
    // Show error message if invalid
    if (!isValid) {
        showError(errorMsg);
    }
    
    return isValid;
}

/**
 * Validate password strength
 */
function validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return password.length >= minLength && 
           hasUpperCase && 
           hasLowerCase && 
           hasNumbers && 
           hasSpecialChar;
}

/**
 * Update submit button state based on form validity
 */
function updateSubmitButton() {
    if (submitButton) {
        const isFormValid = validateForm();
        submitButton.disabled = !isFormValid;
        submitButton.classList.toggle('disabled', !isFormValid);
    }
}

/**
 * Validate entire form
 */
function validateForm() {
    const usernameValid = validateInput(usernameInput);
    const emailValid = validateInput(emailInput);
    const passwordValid = validateInput(passwordInput);
    
    return usernameValid && emailValid && passwordValid;
}

// CSRF token handling
async function fetchCSRFToken(retryCount = 3) {
    console.log('Fetching CSRF token, attempt:', 4 - retryCount);
    
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(API_ENDPOINTS.CSRF_TOKEN, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            },
            mode: 'cors',
            signal: controller.signal
        }).finally(() => clearTimeout(timeout));

        console.log('CSRF Response Status:', response.status);
        console.log('CSRF Response Headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseText = await response.text();
        console.log('Raw CSRF response:', responseText);

        let data;
        try {
            data = JSON.parse(responseText);
            console.log('Parsed CSRF data:', data);
        } catch (e) {
            console.error('Failed to parse CSRF response:', e);
            throw new Error('Invalid CSRF token response format');
        }
        
        if (!data.success || !data.data?.token) {
            console.error('Invalid CSRF data:', data);
            throw new Error('Invalid CSRF token response format');
        }

        return data.data.token;
    } catch (error) {
        console.error('CSRF token fetch error:', error);
        
        if (retryCount > 1) {
            console.log('Retrying CSRF token fetch...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            return fetchCSRFToken(retryCount - 1);
        }
        
        throw new Error('Failed to fetch CSRF token after multiple attempts');
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

        // Get CSRF token with retry mechanism
        const csrfToken = await fetchCSRFToken();
        
        console.log('Making login request to:', API_ENDPOINTS.LOGIN);
        const response = await fetch(API_ENDPOINTS.LOGIN, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken,
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

        // Get CSRF token with retry mechanism
        const csrfToken = await fetchCSRFToken();
        
        console.log('Making signup request to:', API_ENDPOINTS.SIGNUP);
        const response = await fetch(API_ENDPOINTS.SIGNUP, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken,
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
 * Play success sound on successful login
 */
function playSuccessSound() {
    if (window.AudioManager) {
        AudioManager.playSound('correct');
    } else {
        console.warn('AudioManager not available for login sound');
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

// Theme toggle functionality
function toggleTheme() {
    const root = document.documentElement;
    const currentTheme = root.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    const themeIcon = document.querySelector('.theme-toggle i');
    if (themeIcon) {
        themeIcon.className = newTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    }
}

// Form switching functionality
const loginContainer = document.querySelector('.login-container');
const signupContainer = document.getElementById('signupContainer');
const showSignup = document.getElementById('showSignup');
const showLogin = document.getElementById('showLogin');

/**
 * Reset form state
 */
function resetFormState(form) {
    if (form) {
        form.reset();
        const inputs = form.querySelectorAll('input');
        inputs.forEach(input => {
            input.classList.remove('valid', 'invalid');
        });
        const errorContainer = form.querySelector('.error-message');
        if (errorContainer) {
            errorContainer.style.display = 'none';
            errorContainer.textContent = '';
        }
    }
}

if (showSignup) {
    showSignup.addEventListener('click', (e) => {
        e.preventDefault();
        resetFormState(loginForm);
        loginContainer.style.display = 'none';
        signupContainer.style.display = 'block';
    });
}

if (showLogin) {
    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        resetFormState(signupForm);
        signupContainer.style.display = 'none';
        loginContainer.style.display = 'block';
    });
} 
