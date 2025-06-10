// Signup and authentication functionality for Financial Literacy App

document.addEventListener('DOMContentLoaded', function() {
    console.log('Signup page loaded, initializing...');

    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    } else {
        console.error("Signup form not found!");
    }
    
    console.log('Initialization complete for signup page.');
});

async function handleSignup(event) {
    event.preventDefault();
    console.log("handleSignup triggered");

    const signupButton = document.getElementById('signup-btn');
    const usernameInput = document.getElementById('signup-username');
    const emailInput = document.getElementById('signup-email');
    const passwordInput = document.getElementById('signup-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    
    try {
        if (signupButton) {
            signupButton.disabled = true;
            signupButton.classList.add('disabled');
        }

        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (!username || !email || !password || !confirmPassword) {
            throw new Error('Please fill in all fields');
        }

        if (password !== confirmPassword) {
            throw new Error('Passwords do not match');
        }

        if (!isValidEmail(email)) {
            throw new Error('Please enter a valid email address');
        }

        if (password.length < 8) {
            throw new Error('Password must be at least 8 characters long');
        }
        
        // This relies on ConnectionHelper being available from connection_helper.js
        const connection = await ConnectionHelper.getInstance();
        const response = await connection.signup(username, email, password);

        if (!response.success) {
            throw new Error(response.message || 'Signup failed');
        }

        // Store auth data
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', response.user.username);
        localStorage.setItem('userEmail', response.user.email);
        localStorage.setItem('lastLogin', new Date().toISOString());

        // Redirect to main app
        window.location.href = 'levels.html';

    } catch (error) {
        console.error('Signup error:', error);
        showError(error.message || 'An error occurred during signup');
        
        if (signupButton) {
            signupButton.disabled = false;
            signupButton.classList.remove('disabled');
        }
    }
}

function handleGoogleSignUp(response) {
    console.log("ID: " + response.credential);
    // Here you would send the credential to your backend for verification and user creation/login
    // For now, we'll just log it.
    
    // Example of what you might do:
    // const id_token = response.credential;
    // const backendResponse = await fetch('/auth/google', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ token: id_token })
    // });
    // const data = await backendResponse.json();
    // if(data.success) {
    //     // store session, redirect
    // }
}


function isValidEmail(email) {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
}

function showError(message) {
    const errorContainer = document.getElementById('signup-error-message');
    if (errorContainer) {
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
        // Optional: add a shake animation for better UX
        setTimeout(() => {
            errorContainer.style.display = 'none';
        }, 5000); // Hide after 5 seconds
    }
} 