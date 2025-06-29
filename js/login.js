        // Login and authentication functionality for Financial Literacy App

        // DOM Elements
        const loginForm = document.getElementById('login-form');
        const usernameInput = document.getElementById('username');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const errorMessage = document.getElementById('error-message');
        const submitButton = document.getElementById('submit-btn');

        // Constants
        const AUTH_KEYS = {
            IS_LOGGED_IN: 'isLoggedIn',
            USERNAME: 'username',
            USER_EMAIL: 'userEmail',
            LAST_LOGIN: 'lastLogin'
        };

        // Detect environment
        const isDevelopment = window.location.hostname === 'localhost' || 
                            window.location.hostname === '127.0.0.1';

        // Log environment
        console.log(`Running in ${isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION'} mode`);

        // Configure backend - since we're having issues with the backend, 
        // let's use a local mock implementation for demo/development
        const useRealBackend = true; // Set to false to use mock implementation

        // API base URL configuration - ENSURE NO DUPLICATE DECLARATIONS
        const API_BASE_URL = (() => {
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
            // FIXED: Prevent default form submission to avoid exposing credentials in URL
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
                    const apiResponse = await fetch(`${API_BASE_URL}/login.php`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({
                            username,
                            email,
                            password
                        }),
                        // FIXED: Add timeout to prevent hanging requests
                        signal: AbortSignal.timeout(10000)
                    });
                    
                    response = await apiResponse.json();
                }

                if (!response.success) {
                    throw new Error(response.message || 'Login failed');
                }

                // Store auth data - FIXED: Use the exact username provided, not just from response
                const finalUsername = response.user?.username || username;
                console.log(`[Login] Storing username in localStorage: ${finalUsername}`);
                
                localStorage.setItem(AUTH_KEYS.IS_LOGGED_IN, 'true');
                localStorage.setItem(AUTH_KEYS.USERNAME, finalUsername);
                localStorage.setItem(AUTH_KEYS.USER_EMAIL, email);
                localStorage.setItem(AUTH_KEYS.LAST_LOGIN, new Date().toISOString());

                // FIXED: Redirect to main app with clean URL
                redirectToMainApp();

            } catch (error) {
                console.error('Login error:', error);
                showError(error.message || 'An error occurred during login');
                
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

                // Attach the event listener for the login form
                if (loginForm) {
                    loginForm.addEventListener('submit', handleLogin);
                }
                
                // Add additional initialization if needed
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
        * Redirect to main app after successful login/signup
        */
        function redirectToMainApp() {
            console.log('Login successful, redirecting to main app');
            
            // Initialize XP service if available
            if (window.xpService) {
                console.log('Initializing XP service');
                window.xpService.init();
            }
            
            // Redirect to levels page
            window.location.href = 'levels.html';
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
