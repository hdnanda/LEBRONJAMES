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

// Detect environment
const isDevelopment = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' ||
                      window.location.hostname.includes('financial-frontend-3xkp.onrender.com');

// Log environment
console.log(`Running in ${isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION'} mode`);

// Configure backend - since we're having issues with the backend, 
// let's use a local mock implementation for demo/development
const useRealBackend = false; // Set to false to use mock implementation

// Base URL for API endpoints
const BASE_URL = (() => {
    // Always use mock backend in development due to CORS issues
    if (isDevelopment || !useRealBackend) {
        console.log('Using mock backend');
        return null; // No real backend will be used
    }
    
    const hostname = window.location.hostname;
    
    // For local development with real backend
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        console.log('Using local backend');
        return 'http://localhost/FinancialLiteracyApp-main/backend';
    }
    
    // For production on Render
    console.log('Using production backend');
    return 'https://financial-backend1.onrender.com';
})();

/**
 * Mock backend implementation for development/demo
 */
const MockBackend = {
    // Simple in-memory store
    users: JSON.parse(localStorage.getItem('mockUsers') || '[]'),
    
    // Save users to localStorage
    saveUsers() {
        localStorage.setItem('mockUsers', JSON.stringify(this.users));
    },
    
    // Find user by credentials
    findUser(username, email) {
        return this.users.find(user => 
            user.username === username || user.email === email
        );
    },
    
    // Create new user
    createUser(username, email, password) {
        // Check if user already exists
        if (this.findUser(username, email)) {
            return {
                success: false,
                message: 'Username or email already exists'
            };
        }
        
        // Create new user
        const newUser = {
            id: Date.now(),
            username,
            email,
            password, // In a real app, this would be hashed
            createdAt: new Date().toISOString()
        };
        
        // Add to users array
        this.users.push(newUser);
        this.saveUsers();
        
        return {
            success: true,
            message: 'User created successfully',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email
            }
        };
    },
    
    // Login user
    loginUser(username, email, password) {
        // Find user
        const user = this.findUser(username, email);
        
        // Check if user exists and password matches
        if (!user || user.password !== password) {
            return {
                success: false,
                message: 'Invalid credentials'
            };
        }
        
        return {
            success: true,
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        };
    }
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

        let response;
        
        // Use mock backend in development
        if (isDevelopment || !useRealBackend) {
            console.log('Using mock backend for login');
            response = MockBackend.loginUser(username, email, password);
        } else {
            // Use real backend
            const apiResponse = await fetch(`${BASE_URL}/login.php`, {
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
            
            response = await apiResponse.json();
        }

        if (!response.success) {
            throw new Error(response.message || 'Login failed');
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

        if (password.length < 8) {
            throw new Error('Password must be at least 8 characters long');
        }

        let response;
        
        // Use mock backend in development
        if (isDevelopment || !useRealBackend) {
            console.log('Using mock backend for signup');
            response = MockBackend.createUser(username, email, password);
        } else {
            // Use real backend
            const apiResponse = await fetch(`${BASE_URL}/signup.php`, {
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
            
            response = await apiResponse.json();
        }

        if (!response.success) {
            throw new Error(response.message || 'Signup failed');
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
        showError(error.message || 'An error occurred during signup', true);
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
