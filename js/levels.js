// Level mapping and interface structure
const levelSystem = {
    // Level definitions with their properties
    levels: [
        {
            id: 1,
            title: "Basics of Money",
            description: "Learn the fundamentals of personal finance",
            icon: "💰",
            requiredLevel: 0,
            xpReward: 100,
            questions: [1, 2, 3, 4, 5] // References to question IDs
        },
        {
            id: 2,
            title: "Banking Basics",
            description: "Understanding checking, savings, and more",
            icon: "🏦",
            requiredLevel: 1,
            xpReward: 150,
            questions: [6, 7, 8, 9, 10]
        },
        {
            id: 3,
            title: "Credit & Debt",
            description: "Learn about credit scores and managing debt",
            icon: "💳",
            requiredLevel: 2,
            xpReward: 200,
            questions: [11, 12, 13, 14, 15]
        },
        {
            id: 4,
            title: "Investing 101",
            description: "Introduction to stocks, bonds, and more",
            icon: "📈",
            requiredLevel: 3,
            xpReward: 250,
            questions: [16, 17, 18, 19, 20]
        },
        {
            id: 5,
            title: "Retirement Planning",
            description: "Planning for your future financial security",
            icon: "👴",
            requiredLevel: 4,
            xpReward: 300,
            questions: [21, 22, 23, 24, 25]
        }
    ],

    // Current user progress
    userProgress: {
        currentLevel: 1,
        xp: 0,
        completedLevels: new Set()
    },

    // Fetch user XP from server or xpService
    async fetchUserXP() {
        try {
            // First try to get username from localStorage
            const username = localStorage.getItem('username');
            
            if (!username) {
                console.warn('No username found in localStorage');
                return;
            }
            
            console.log('Fetching XP for user:', username);
            
            // Check if we're using xpService
            if (window.xpService) {
                console.log('Using xpService to get XP');
                this.userProgress.xp = window.xpService.getCurrentXP();
                this.userProgress.currentLevel = window.xpService.getCurrentLevel();
                
                // Update XP display
                this.updateXPDisplay();
                return;
            }
            
            // Try to fetch from backend with timeout to prevent hanging requests
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            
            try {
                const response = await fetch('/FinancialLiteracyApp-main/backend/xp_handler.php', {
                    method: 'GET',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                this.userProgress.xp = data.xp;
                this.userProgress.currentLevel = data.level;
                
                // Update XP display
                this.updateXPDisplay();
            } catch (fetchError) {
                console.warn('Failed to fetch from backend:', fetchError.message);
                // If offline, show message about not being able to load XP
                if (!navigator.onLine) {
                    this.showOfflineMessage();
                }
            }
        } catch (error) {
            console.error('Error in fetchUserXP:', error);
            if (!navigator.onLine) {
                this.showOfflineMessage();
            }
        }
    },
    
    // Show offline message
    showOfflineMessage() {
        console.log('Showing offline message');
        const container = document.createElement('div');
        container.className = 'offline-message';
        container.innerHTML = `
            <div class="offline-content">
                <div class="offline-icon">⚠️</div>
                <div class="offline-text">
                    <h3>You're Offline</h3>
                    <p>XP data can't be loaded or saved while offline.</p>
                    <p>Please reconnect to continue your progress.</p>
                </div>
            </div>
        `;
        
        // Insert message into page
        document.body.appendChild(container);
        
        // Add offline message styles if not already in CSS
        if (!document.querySelector('#offline-message-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'offline-message-styles';
            styleSheet.textContent = `
                .offline-message {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background-color: rgba(0, 0, 0, 0.8);
                    color: white;
                    padding: 20px;
                    border-radius: 8px;
                    z-index: 10001;
                    max-width: 400px;
                    text-align: center;
                    box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
                }
                
                .offline-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 15px;
                }
                
                .offline-icon {
                    font-size: 48px;
                }
                
                .offline-text h3 {
                    margin-top: 0;
                    color: #F44336;
                }
            `;
            document.head.appendChild(styleSheet);
        }
    },
    
    // Update XP display
    updateXPDisplay() {
        const xpCounter = document.querySelector('.xp-counter');
        if (xpCounter) {
            xpCounter.textContent = `XP: ${this.userProgress.xp}`;
            console.log('Updated XP display to:', this.userProgress.xp);
        }
    },

    // Initialize the level interface
    async initializeLevelInterface() {
        // First fetch user XP
        await this.fetchUserXP();
        
        const levelContainer = document.createElement('div');
        levelContainer.className = 'level-container';
        levelContainer.innerHTML = this.generateLevelHTML();
        
        // Add click handlers for level buttons
        this.addLevelClickHandlers(levelContainer);
        
        // Insert the level container before the main question interface
        const mainInterface = document.querySelector('.main-interface');
        if (mainInterface) {
            mainInterface.parentNode.insertBefore(levelContainer, mainInterface);
        }
    },

    // Generate HTML for the level interface
    generateLevelHTML() {
        return `
            <div class="level-grid">
                ${this.levels.map(level => `
                    <div class="level-card ${this.getLevelStatus(level)}" data-level-id="${level.id}">
                        <div class="level-icon">${level.icon}</div>
                        <div class="level-title">${level.title}</div>
                        <div class="level-description">${level.description}</div>
                        <div class="level-reward">${level.xpReward} XP</div>
                        ${this.getLevelLockStatus(level)}
                    </div>
                `).join('')}
            </div>
        `;
    },

    // Determine level status (completed, current, locked)
    getLevelStatus(level) {
        if (this.userProgress.completedLevels.has(level.id)) {
            return 'completed';
        } else if (level.id === this.userProgress.currentLevel) {
            return 'current';
        } else if (level.id > this.userProgress.currentLevel) {
            return 'locked';
        }
        return '';
    },

    // Generate lock status HTML
    getLevelLockStatus(level) {
        if (level.id > this.userProgress.currentLevel) {
            return '<div class="level-lock">🔒</div>';
        }
        return '';
    },

    // Add click handlers for level buttons
    addLevelClickHandlers(container) {
        container.querySelectorAll('.level-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const levelId = parseInt(card.dataset.levelId);
                if (this.canAccessLevel(levelId)) {
                    this.startLevel(levelId);
                }
            });
        });
    },

    // Check if user can access a level
    canAccessLevel(levelId) {
        const level = this.levels.find(l => l.id === levelId);
        return level && levelId <= this.userProgress.currentLevel;
    },

    // Start a level
    startLevel(levelId) {
        const level = this.levels.find(l => l.id === levelId);
        if (level) {
            // Hide level interface
            document.querySelector('.level-container').style.display = 'none';
            
            // Show main question interface
            const mainInterface = document.querySelector('.main-interface');
            if (mainInterface) {
                mainInterface.style.display = 'block';
            }
            
            // Initialize questions for this level
            window.initApp(level.questions);
        }
    },

    // Update XP - server only
    async updateXP(newXP) {
        try {
            console.log('Updating XP to:', newXP);
            
            // Check if online
            if (!navigator.onLine) {
                console.warn('Cannot update XP while offline');
                this.showOfflineMessage();
                return false;
            }
            
            // If xpService is available, use it
            if (window.xpService) {
                const added = newXP - this.userProgress.xp;
                if (added > 0) {
                    await window.xpService.addXP(added, { levelComplete: true });
                    this.userProgress.xp = window.xpService.getCurrentXP();
                    this.userProgress.currentLevel = window.xpService.getCurrentLevel();
                    this.updateXPDisplay();
                    return true;
                }
            }
            
            // Try to update on server with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            
            try {
                const response = await fetch('/FinancialLiteracyApp-main/backend/xp_handler.php', {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ xp: newXP }),
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                if (data.success) {
                    this.userProgress.xp = data.xp;
                    this.userProgress.currentLevel = data.level;
                    this.updateXPDisplay();
                    return true;
                }
            } catch (fetchError) {
                console.warn('Failed to update XP on server:', fetchError.message);
                return false;
            }
        } catch (error) {
            console.error('Error updating XP:', error);
            return false;
        }
    },
    
    // Calculate level based on XP
    calculateLevel(xp) {
        const levels = {
            1: { requirement: 0 },
            2: { requirement: 100 },
            3: { requirement: 250 },
            4: { requirement: 450 },
            5: { requirement: 700 }
        };
        
        let level = 1;
        for (let i = 5; i >= 1; i--) {
            if (xp >= levels[i].requirement) {
                level = i;
                break;
            }
        }
        
        return level;
    },

    // Complete a level
    async completeLevel(levelId) {
        // Check if online
        if (!navigator.onLine) {
            console.warn('Cannot complete level while offline');
            this.showOfflineMessage();
            return false;
        }
        
        const level = this.levels.find(l => l.id === levelId);
        if (level) {
            this.userProgress.completedLevels.add(levelId);
            const newXP = this.userProgress.xp + level.xpReward;
            
            // Update XP on server
            const updated = await this.updateXP(newXP);
            
            if (updated) {
                // Check if user can progress to next level
                if (levelId === this.userProgress.currentLevel) {
                    this.userProgress.currentLevel++;
                }
                
                // Update the interface
                this.updateLevelInterface();
                return true;
            }
            
            return false;
        }
    },

    // Update the level interface
    updateLevelInterface() {
        const container = document.querySelector('.level-container');
        if (container) {
            container.innerHTML = this.generateLevelHTML();
            this.addLevelClickHandlers(container);
        }
    }
};

// Initialize the level system when the page loads
document.addEventListener('DOMContentLoaded', () => {
    levelSystem.initializeLevelInterface().catch(error => {
        console.error('Failed to initialize level system:', error);
    });
}); 
