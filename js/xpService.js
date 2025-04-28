/**
 * XP Service for Financial Literacy App
 * Handles XP tracking and retrieval from server
 * Works with server backend only (no localStorage)
 */

const xpService = {
    // Service state
    initialized: false,
    currentUser: null,
    currentXP: 0,
    currentLevel: 1,
    isOnline: false,
    
    // Service configuration
    config: {
        xpLevels: {
            1: { min: 0, max: 99 },
            2: { min: 100, max: 249 },
            3: { min: 250, max: 449 },
            4: { min: 450, max: 699 },
            5: { min: 700, max: Infinity }
        },
        saveInterval: 5000, // How often to save (ms)
    },
    
    /**
     * Initialize the XP service
     */
    init() {
        if (this.initialized) return;
        
        console.log('Initializing XP Service');
        
        // Get current user from localStorage (username only)
        this.currentUser = localStorage.getItem('username');
        if (!this.currentUser) {
            console.warn('XP Service: No user logged in');
            return;
        }
        
        // Initialize default values
        this.currentXP = 0;
        this.currentLevel = 1;
        
        // Check online status
        this.checkOnlineStatus();
        
        // Try to get XP from server if online
        if (this.isOnline) {
            this.fetchFromServer();
        }
        
        // Add offline detection
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.fetchFromServer();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('XP Service: Switched to offline mode - XP changes disabled');
        });
        
        this.initialized = true;
        console.log(`XP Service initialized for user: ${this.currentUser}, XP: ${this.currentXP}, Level: ${this.currentLevel}`);
        
        // Update XP display
        this.updateXPDisplay();
    },
    
    /**
     * Check if the app is online
     */
    checkOnlineStatus() {
        this.isOnline = navigator.onLine;
        console.log(`XP Service: Online status: ${this.isOnline}`);
        return this.isOnline;
    },
    
    /**
     * Fetch XP data from server
     */
    async fetchFromServer() {
        if (!this.currentUser || !this.isOnline) return;
        
        try {
            console.log('XP Service: Fetching XP from server');
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch('/FinancialLiteracyApp-main/backend/xp_handler.php', {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                console.warn(`XP Service: Server returned ${response.status}`);
                return;
            }
            
            const data = await response.json();
            this.currentXP = data.xp || 0;
            this.currentLevel = data.level || this.calculateLevel(this.currentXP);
            
            this.updateXPDisplay();
            console.log(`XP Service: Fetched from server - XP: ${this.currentXP}, Level: ${this.currentLevel}`);
        } catch (error) {
            console.warn('XP Service: Error fetching from server', error);
            this.isOnline = false;
        }
    },
    
    /**
     * Update XP on the server
     */
    async updateServerXP() {
        if (!this.currentUser || !this.isOnline) {
            console.warn('XP Service: Cannot update XP while offline');
            return false;
        }
        
        try {
            console.log(`XP Service: Updating server XP to ${this.currentXP}`);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch('/FinancialLiteracyApp-main/backend/xp_handler.php', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ xp: this.currentXP }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                console.warn(`XP Service: Server update failed with status ${response.status}`);
                return false;
            }
            
            const data = await response.json();
            if (data.success) {
                console.log('XP Service: Server update successful');
                return true;
            }
            
            return false;
        } catch (error) {
            console.warn('XP Service: Error updating server XP', error);
            this.isOnline = false;
            return false;
        }
    },
    
    /**
     * Get current XP
     */
    getCurrentXP() {
        if (!this.initialized) this.init();
        return this.currentXP;
    },
    
    /**
     * Get current level
     */
    getCurrentLevel() {
        if (!this.initialized) this.init();
        return this.currentLevel;
    },
    
    /**
     * Calculate level based on XP
     */
    calculateLevel(xp) {
        for (let level = 5; level >= 1; level--) {
            if (xp >= this.config.xpLevels[level].min) {
                return level;
            }
        }
        return 1;
    },
    
    /**
     * Add XP points
     * @param {number} amount - Amount of XP to add
     * @param {object} options - Options like animation, sound, etc.
     */
    async addXP(amount, options = {}) {
        if (!this.initialized) this.init();
        if (!this.currentUser) return false;
        
        // Check if online - XP changes only allowed when online
        if (!this.isOnline) {
            console.warn('XP Service: Cannot add XP while offline');
            // Show offline notification instead of XP
            this.showOfflineNotification();
            return false;
        }
        
        const oldXP = this.currentXP;
        const oldLevel = this.currentLevel;
        
        // Add XP
        this.currentXP += amount;
        
        // Recalculate level
        this.currentLevel = this.calculateLevel(this.currentXP);
        
        // Update server
        const updated = await this.updateServerXP();
        
        if (!updated) {
            // If server update failed, revert changes
            this.currentXP = oldXP;
            this.currentLevel = oldLevel;
            return false;
        }
        
        // Update display
        this.updateXPDisplay();
        
        // Show XP gain notification
        this.showXPNotification(amount, oldLevel !== this.currentLevel);
        
        return true;
    },
    
    /**
     * Update XP display in UI
     */
    updateXPDisplay() {
        const xpCounter = document.querySelector('.xp-counter');
        if (xpCounter) {
            xpCounter.textContent = `XP: ${this.currentXP}`;
        }
    },
    
    /**
     * Show XP notification
     */
    showXPNotification(amount, leveledUp) {
        try {
            const container = document.querySelector('body');
            if (!container) return;
            
            const notification = document.createElement('div');
            notification.className = 'xp-notification';
            notification.innerHTML = `
                <div class="xp-notification-content">
                    <span class="xp-icon">⭐</span>
                    <span class="xp-amount">+${amount} XP</span>
                    ${leveledUp ? '<span class="level-up">Level Up! 🎉</span>' : ''}
                </div>
            `;
            
            container.appendChild(notification);
            
            // Add animation class after a small delay
            setTimeout(() => {
                notification.classList.add('show');
            }, 10);
            
            // Remove notification after animation
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    container.removeChild(notification);
                }, 500);
            }, 3000);
        } catch (error) {
            console.error('XP Service: Error showing notification', error);
        }
    },
    
    /**
     * Show offline notification
     */
    showOfflineNotification() {
        try {
            const container = document.querySelector('body');
            if (!container) return;
            
            const notification = document.createElement('div');
            notification.className = 'xp-notification offline-notification';
            notification.innerHTML = `
                <div class="xp-notification-content">
                    <span class="offline-icon">⚠️</span>
                    <span class="offline-message">You're offline. XP not saved.</span>
                </div>
            `;
            
            container.appendChild(notification);
            
            // Add animation class after a small delay
            setTimeout(() => {
                notification.classList.add('show');
            }, 10);
            
            // Remove notification after animation
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    container.removeChild(notification);
                }, 500);
            }, 3000);
        } catch (error) {
            console.error('XP Service: Error showing offline notification', error);
        }
    }
};

// Auto-initialize when script loads
document.addEventListener('DOMContentLoaded', () => {
    xpService.init();
    
    // Make available globally
    window.xpService = xpService;
});

// Add XP notification styles if not already in CSS
document.addEventListener('DOMContentLoaded', () => {
    if (!document.querySelector('#xp-notification-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'xp-notification-styles';
        styleSheet.textContent = `
            .xp-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background-color: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 10px 20px;
                border-radius: 5px;
                z-index: 10000;
                transform: translateX(120%);
                transition: transform 0.3s ease-in-out;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
            }
            
            .xp-notification.show {
                transform: translateX(0);
            }
            
            .xp-notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .xp-icon {
                font-size: 24px;
                color: gold;
            }
            
            .xp-amount {
                font-weight: bold;
                color: #4CAF50;
            }
            
            .level-up {
                font-weight: bold;
                color: #FFC107;
                animation: pulse 1s infinite;
            }
            
            .offline-icon {
                font-size: 24px;
                color: #F44336;
            }
            
            .offline-message {
                font-weight: bold;
                color: #F44336;
            }
            
            @keyframes pulse {
                0% { opacity: 0.7; }
                50% { opacity: 1; }
                100% { opacity: 0.7; }
            }
        `;
        document.head.appendChild(styleSheet);
    }
}); 