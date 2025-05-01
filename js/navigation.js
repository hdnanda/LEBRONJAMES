// Navigation Controller for Financial Literacy App

document.addEventListener('DOMContentLoaded', function() {
    // Check what page we're on
    const currentPath = window.location.pathname;
    const isRootUrl = currentPath === '/' || 
                      currentPath.endsWith('/index.html') || 
                      currentPath === '/financial-frontend-3xkp.onrender.com/' ||
                      currentPath === '/financial-frontend-3xkp.onrender.com/index.html';
    
    // If we're at the root URL or index.html, redirect to homepage.html
    if (isRootUrl) {
        console.log('Redirecting from index to homepage');
        window.location.href = 'homepage.html';
        return;
    }
    
    // Add event listener for "Get Started" button on homepage
    const getStartedBtn = document.querySelector('.btn-primary');
    if (getStartedBtn && currentPath.includes('homepage.html')) {
        console.log('Setting up homepage "Get Started" button handler');
        getStartedBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Show transition overlay if it exists
            const transitionOverlay = document.getElementById('page-transition');
            if (transitionOverlay) {
                transitionOverlay.classList.add('active');
            }
            
            // Check if user is logged in
            if (isUserLoggedIn()) {
                console.log('User is logged in, redirecting to levels');
                // If logged in, redirect to levels page
                setTimeout(() => {
                    window.location.href = 'levels.html';
                }, 500);
            } else {
                console.log('User is not logged in, redirecting to guest');
                // If not logged in, redirect to guest page
                setTimeout(() => {
                    window.location.href = 'guest.html';
                }, 500);
            }
        });
    }
    
    // Handle signup redirect to levels
    if (currentPath.includes('signup.html')) {
        console.log('On signup page - will redirect to levels upon successful signup');
        // The signup.html already has code to redirect to levels.html after successful signup
    }
    
    // Handle guest page completion redirect to signup
    if (currentPath.includes('guest.html')) {
        console.log('On guest page - will redirect to signup upon completion');
        // The guest.html already has code to redirect to signup.html
    }
});

/**
 * Check if the user is currently logged in
 * @returns {boolean} True if logged in, false otherwise
 */
function isUserLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true';
} 