/**
 * Device Detection Script for TheMoneyOlympics
 * 
 * This script uses feature detection to reliably determine 
 * if the current device is a mobile phone or desktop computer.
 * It adds a data-device attribute to the HTML element that can be used for CSS targeting.
 * 
 * Usage:
 * 1. Include this script in the <head> section BEFORE other scripts
 * 2. Use the isDeviceMobile() function to check device type
 * 3. Use [data-device="mobile"] or [data-device="desktop"] in CSS for device-specific styling
 */

// Run device detection immediately to avoid layout shifts
(function() {
    // Detect device type and set HTML attribute
    detectDevice();
    
    // Also detect on resize for responsive testing
    window.addEventListener('resize', function() {
        // Throttle resize event to avoid excessive calls
        if (this.resizeTimer) clearTimeout(this.resizeTimer);
        this.resizeTimer = setTimeout(function() {
            detectDevice();
        }, 500);
    });
    
    // Add to DOMContentLoaded for any post-load adjustments
    document.addEventListener('DOMContentLoaded', function() {
        // Run any post-load device-specific adjustments
        applyDeviceSpecificAdjustments();
    });
})();

/**
 * Detects if the current device is a mobile device using feature detection
 * @returns {boolean} True if the device is a mobile device, false otherwise
 */
function isDeviceMobile() {
    // Check for touch capabilities
    const hasTouchScreen = !!(('ontouchstart' in window) || 
                            (navigator.maxTouchPoints > 0) || 
                            (navigator.msMaxTouchPoints > 0));
    
    // Check for screen size (mobile typically has smaller screens)
    const isSmallScreen = window.innerWidth < 768;
    
    // Check for mobile-specific browser features in user agent
    const hasMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Check for mobile-specific orientation capability
    const hasOrientationChange = typeof window.orientation !== 'undefined';
    
    // Final determination based on multiple factors
    return hasTouchScreen && (isSmallScreen || hasMobileUA || hasOrientationChange);
}

/**
 * Detects the device type and sets the data-device attribute on the HTML element
 * Also provides debug logging in the console
 * @returns {boolean} True if the device is a mobile device, false otherwise
 */
function detectDevice() {
    // Get individual detection signals
    const hasTouchScreen = !!(('ontouchstart' in window) || 
                           (navigator.maxTouchPoints > 0) || 
                           (navigator.msMaxTouchPoints > 0));
    
    const isSmallScreen = window.innerWidth < 768;
    
    const hasMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    const hasOrientationChange = typeof window.orientation !== 'undefined';
    
    // Final determination based on multiple factors
    const isMobileDevice = hasTouchScreen && (isSmallScreen || hasMobileUA || hasOrientationChange);
    
    // Debug logging (only in development mode)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log("📱 DEVICE DETECTION:");
        console.log("- Has touch screen:", hasTouchScreen);
        console.log("- Is small screen:", isSmallScreen, `(${window.innerWidth}px)`);
        console.log("- Has mobile user agent:", hasMobileUA);
        console.log("- Has orientation change:", hasOrientationChange);
        console.log("➡️ RESULT:", isMobileDevice ? "MOBILE PHONE" : "COMPUTER");
    }
    
    // Set device type as a data attribute on HTML for CSS targeting
    // This can run early as documentElement is available.
    document.documentElement.setAttribute('data-device', isMobileDevice ? 'mobile' : 'desktop');
    
    // Defer body class manipulation until DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        if (isMobileDevice) {
            if (document.body) { // Extra safety check
                document.body.classList.add('mobile-device');
                document.body.classList.remove('desktop-device');
            }
        } else {
            if (document.body) { // Extra safety check
                document.body.classList.add('desktop-device');
                document.body.classList.remove('mobile-device');
            }
        }
    });
    
    return isMobileDevice;
}

/**
 * Apply device-specific adjustments after the DOM is fully loaded
 * This function will be customized for different pages as needed
 */
function applyDeviceSpecificAdjustments() {
    const isMobile = document.documentElement.getAttribute('data-device') === 'mobile';
    
    if (isMobile) {
        // Common mobile adjustments for all pages
        console.log("Applying mobile-specific adjustments...");
        
        // Apply specific styles for mobile quizzes if present
        if (document.querySelector('.quiz-container')) {
            document.querySelector('.quiz-container').classList.add('mobile-quiz');
        }
        
        // Check for question containers that need mobile styling
        const questionContainers = document.querySelectorAll('.question-wrapper');
        if (questionContainers.length > 0) {
            questionContainers.forEach(container => {
                container.style.justifyContent = 'center';
                container.style.alignItems = 'center';
            });
            
            // For options containers, ensure they're single column on mobile
            const optionsContainers = document.querySelectorAll('#options-container, .options-grid');
            optionsContainers.forEach(container => {
                container.style.gridTemplateColumns = '1fr';
            });
        }
    } else {
        console.log("Applying desktop-specific adjustments...");
        // Desktop-specific adjustments
    }
} 
