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
            
            const response = await fetch('https://financial-backend1.onrender.com/xp_handler.php', {
                method: 'GET',
                credentials: 'same-origin',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-Username': this.currentUser
                },
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
            
            const response = await fetch('https://financial-backend1.onrender.com/xp_handler.php', {
                method: 'POST',
                credentials: 'same-origin',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-Username': this.currentUser
                },
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
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'xp-notification';
        notification.innerHTML = `
            <span class="xp-amount">+${amount} XP</span>
            ${leveledUp ? '<span class="level-up">LEVEL UP!</span>' : ''}
        `;
        
        // Add to document
        document.body.appendChild(notification);
        
        // Animate
        setTimeout(() => {
            notification.classList.add('visible');
        }, 100);
        
        // Remove after animation
        setTimeout(() => {
            notification.classList.remove('visible');
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    },
    
    /**
     * Show offline notification
     */
    showOfflineNotification() {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'offline-notification';
        notification.innerHTML = `
            <span class="offline-icon">📡</span>
            <span class="offline-text">You're offline! XP changes will not be saved.</span>
        `;
        
        // Add to document
        document.body.appendChild(notification);
        
        // Animate
        setTimeout(() => {
            notification.classList.add('visible');
        }, 100);
        
        // Remove after animation
        setTimeout(() => {
            notification.classList.remove('visible');
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }
};

// Export for public use
window.xpService = xpService;

// Helper functions - all backend-based without localStorage

/**
 * Get user XP from server
 */
export async function getUserXP() {
    try {
        const username = localStorage.getItem('username');
        if (!username) {
            console.warn('getUserXP: No username found');
            return 0;
        }
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch('https://financial-backend1.onrender.com/xp_handler.php', {
            method: 'GET',
            credentials: 'same-origin',
            headers: { 
                'Content-Type': 'application/json',
                'X-Username': username
            },
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            console.warn(`getUserXP: Server returned ${response.status}`);
            return 0;
        }
        
        const data = await response.json();
        return data.xp || 0;
    } catch (error) {
        console.warn('getUserXP: Error fetching from server', error);
        return 0;
    }
}

/**
 * Update user XP on server
 */
export async function updateUserXP(xp) {
    try {
        const username = localStorage.getItem('username');
        if (!username) {
            console.warn('updateUserXP: No username found');
            return false;
        }
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch('https://financial-backend1.onrender.com/xp_handler.php', {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 
                'Content-Type': 'application/json',
                'X-Username': username
            },
            body: JSON.stringify({ xp }),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            console.warn(`updateUserXP: Server returned ${response.status}`);
            return false;
        }
        
        const data = await response.json();
        return data.success || false;
    } catch (error) {
        console.warn('updateUserXP: Error updating server', error);
        return false;
    }
} 
