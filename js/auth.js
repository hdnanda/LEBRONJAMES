// Authentication functionality for Financial Literacy App

/**
 * This module handles authentication-related tasks:
 * 1. Checking if user is logged in when accessing protected pages
 * 2. Handling the settings panel toggle
 * 3. Managing the logout process
 */

// DOM Elements
const logoutBtn = document.getElementById('logout-btn');
const userNameDisplay = document.getElementById('user-name-display');
const userEmailInPanel = document.getElementById('user-email-display');
const userInfoBtn = document.getElementById('user-info-btn');
const settingsPanel = document.getElementById('settings-panel');
const closeSettingsBtn = document.getElementById('close-settings');
const settingsOverlay = document.getElementById('settings-overlay');

// Create a window.auth object to expose authentication functions globally
window.auth = {
    /**
     * Get the current user's username
     * @returns {string} The current username or null if not logged in
     */
    getCurrentUser: function() {
        return localStorage.getItem('username') || null;
    },
    
    /**
     * Check if the user is currently logged in
     * @returns {boolean} True if logged in, false otherwise
     */
    isLoggedIn: function() {
        return !!localStorage.getItem('isLoggedIn');
    },
    
    /**
     * Get the user's email
     * @returns {string} The user's email or null if not available
     */
    getUserEmail: function() {
        return localStorage.getItem('userEmail') || null;
    }
};

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    checkAuthentication();
    
    // Setup logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', confirmLogout);
    }
    
    // Setup settings panel toggle
    if (userInfoBtn) {
        userInfoBtn.addEventListener('click', openSettingsPanel);
    }
    
    // Setup close settings button
    if (closeSettingsBtn) {
        closeSettingsBtn.addEventListener('click', closeSettingsPanel);
    }
    
    // Setup overlay click to close settings
    if (settingsOverlay) {
        settingsOverlay.addEventListener('click', closeSettingsPanel);
    }
    
    // Make sure ConnectionHelper is loaded
    if (!window.ConnectionHelper && typeof ConnectionHelper !== 'undefined') {
        console.log('[Auth] Initializing ConnectionHelper globally');
        window.ConnectionHelper = ConnectionHelper;
    }
    
    // Check if ConnectionHelper is available
    if (window.ConnectionHelper) {
        console.log('[Auth] ConnectionHelper is available');
    } else {
        console.error('[Auth] ConnectionHelper is not available, this might cause issues.');
    }
    
    // Log the current user for debugging
    console.log('[Auth] Current user:', window.auth.getCurrentUser());
});

/**
 * Check if user is authenticated
 * If not logged in, redirects to login page
 */
function checkAuthentication() {
    const currentPage = window.location.pathname.split('/').pop();
    const publicPages = ['login.html', 'signup.html', 'homepage.html', '']; // Add '' for root path if homepage is index.html

    console.log('[Auth DEBUG] Checking authentication...');
    console.log('[Auth DEBUG] Current page for auth check:', currentPage);
    console.log('[Auth DEBUG] isLoggedIn value:', localStorage.getItem('isLoggedIn'));
    
    if (!localStorage.getItem('isLoggedIn')) {
        // User is not logged in
        // Only redirect if the current page is NOT one of the public/auth pages
        if (!publicPages.includes(currentPage)) {
            console.log('[Auth DEBUG] User not authenticated on a protected page. Redirecting to homepage...');
            window.location.href = 'homepage.html';
        }
    } else {
        // User is logged in
        
        // If on index.html without parameters, redirect to levels page
        const urlParams = new URLSearchParams(window.location.search);
        
        console.log('[Auth DEBUG] User authenticated. Current page:', currentPage);
        
        if ((currentPage === 'index.html' || currentPage === '') && 
            !urlParams.has('topic') && !urlParams.has('sublevel')) {
            console.log('[Auth DEBUG] No topic/sublevel specified. Redirecting to levels page...');
            window.location.href = 'levels.html';
            return;
        }
        
        // Display user info in settings panel
        const username = localStorage.getItem('username');
        const userEmail = localStorage.getItem('userEmail');
        
        if (username && userNameDisplay) {
            userNameDisplay.textContent = username;
        }
        
        if (userEmail && userEmailInPanel) {
            userEmailInPanel.textContent = userEmail;
        }
        
        console.log('[Auth DEBUG] User authenticated details displayed for:', username);
    }
}

/**
 * Open the settings panel
 * Shows the panel with a sliding animation and activates the overlay
 */
function openSettingsPanel() {
    if (settingsPanel && settingsOverlay) {
        settingsPanel.classList.remove('hidden');
        settingsPanel.classList.add('active');
        settingsOverlay.classList.add('active');
        
        // Add rotation to settings icon
        if (userInfoBtn) {
            userInfoBtn.classList.add('rotating');
        }
        
        // Prevent scrolling the main content when panel is open
        document.body.style.overflow = 'hidden';
        
        // Announce for screen readers (accessibility)
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.style.position = 'absolute';
        announcement.style.clip = 'rect(0 0 0 0)';
        announcement.textContent = 'Settings panel opened';
        document.body.appendChild(announcement);
        
        // Remove announcement after it's read
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }
}

/**
 * Close the settings panel
 * Hides the panel with a sliding animation and deactivates the overlay
 */
function closeSettingsPanel() {
    if (settingsPanel && settingsOverlay) {
        settingsPanel.classList.remove('active');
        settingsPanel.classList.add('hidden');
        settingsOverlay.classList.remove('active');
        
        // Remove rotation from settings icon
        if (userInfoBtn) {
            userInfoBtn.classList.remove('rotating');
        }
        
        // Restore scrolling
        document.body.style.overflow = '';
        
        // Announce for screen readers (accessibility)
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.style.position = 'absolute';
        announcement.style.clip = 'rect(0 0 0 0)';
        announcement.textContent = 'Settings panel closed';
        document.body.appendChild(announcement);
        
        // Remove announcement after it's read
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }
}

/**
 * Show confirmation dialog before logging out
 * This prevents accidental logouts
 */
function confirmLogout() {
    // Close settings panel first
    closeSettingsPanel();
    
    // Create a stylish confirmation dialog
    const confirmDialog = document.createElement('div');
    confirmDialog.className = 'logout-confirm-dialog';
    confirmDialog.innerHTML = `
        <div class="logout-confirm-content">
            <h3><i class="fas fa-sign-out-alt"></i> Confirm Logout</h3>
            <p>Are you sure you want to log out?</p>
            <div class="logout-confirm-buttons">
                <button id="confirm-logout-btn">Yes, Log Out</button>
                <button id="cancel-logout-btn">Cancel</button>
            </div>
        </div>
    `;
    
    // Add dialog styles
    const dialogStyle = document.createElement('style');
    dialogStyle.textContent = `
        .logout-confirm-dialog {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            animation: fadeIn 0.3s ease;
        }
        
        .logout-confirm-content {
            background: rgba(0, 0, 0, 0.9);
            border: 1px solid #D4AF37;
            border-radius: 10px;
            padding: 20px;
            text-align: center;
            max-width: 90%;
            width: 300px;
            color: white;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
        }
        
        .logout-confirm-content h3 {
            color: #D4AF37;
            margin-top: 0;
        }
        
        .logout-confirm-buttons {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-top: 20px;
        }
        
        .logout-confirm-buttons button {
            padding: 8px 16px;
            border-radius: 5px;
            cursor: pointer;
            border: none;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        
        #confirm-logout-btn {
            background: #800000;
            color: white;
        }
        
        #confirm-logout-btn:hover {
            background: #a00000;
        }
        
        #cancel-logout-btn {
            background: #333;
            color: white;
        }
        
        #cancel-logout-btn:hover {
            background: #555;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
    `;
    
    // Add dialog and styles to the document
    document.body.appendChild(dialogStyle);
    document.body.appendChild(confirmDialog);
    
    // Add event listeners for dialog buttons
    document.getElementById('confirm-logout-btn').addEventListener('click', () => {
        // Close dialog
        confirmDialog.remove();
        dialogStyle.remove();
        
        // Proceed with logout
        handleLogout();
    });
    
    document.getElementById('cancel-logout-btn').addEventListener('click', () => {
        // Close dialog
        confirmDialog.remove();
        dialogStyle.remove();
    });
    
    // Also close dialog when clicking outside
    confirmDialog.addEventListener('click', (event) => {
        if (event.target === confirmDialog) {
            confirmDialog.remove();
            dialogStyle.remove();
        }
    });
    
    // Add keyboard support for accessibility (Escape closes dialog)
    document.addEventListener('keydown', function escapeHandler(event) {
        if (event.key === 'Escape') {
            confirmDialog.remove();
            dialogStyle.remove();
            document.removeEventListener('keydown', escapeHandler);
        }
    });
}

/**
 * Handle logout button click
 * 1. Removes the isLoggedIn flag from localStorage
 * 2. Plays a sound effect
 * 3. Redirects user to login page
 */
function handleLogout() {
    console.log('Logout requested');
    
    // Clear ALL authentication data from localStorage
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('lastLogin');
    
    // Clear any session-specific data but keep settings preferences
    // This is important to ensure XP data doesn't carry over between users
    
    console.log('User data cleared from localStorage');
    
    // Play logout sound
    playLogoutSound();
    
    // Redirect to login page
    window.location.href = 'login.html';
}

/**
 * Play sound when user logs out
 * Uses the existing level-complete.mp3 sound
 */
function playLogoutSound() {
    try {
        const logoutSound = new Audio('assets/sounds/level-complete.mp3');
        logoutSound.play().catch(error => {
            console.log(`Sound play error: ${error}`);
        });
    } catch (error) {
        console.log(`Sound error: ${error}`);
    }
} 
