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

    // Fetch user XP from the server
    async fetchUserXP() {
        try {
            const response = await fetch('https://financial-backend-gc54.onrender.com/xp_handler.php', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.userProgress.xp = data.xp;
            this.userProgress.currentLevel = data.level;
            
            // Update XP display
            const xpCounter = document.querySelector('.xp-counter');
            if (xpCounter) {
                xpCounter.textContent = `XP: ${this.userProgress.xp}`;
            }
            
            // Update level interface
            this.updateLevelInterface();
        } catch (error) {
            console.error('Error fetching XP:', error);
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

    // Update XP on the server
    async updateXP(newXP) {
        try {
            const response = await fetch('/FinancialLiteracyApp-main/backend/xp_handler.php', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    xp: newXP
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.success) {
                this.userProgress.xp = data.xp;
                this.userProgress.currentLevel = data.level;
                
                // Update XP display
                const xpCounter = document.querySelector('.xp-counter');
                if (xpCounter) {
                    xpCounter.textContent = `XP: ${this.userProgress.xp}`;
                }
            }
        } catch (error) {
            console.error('Error updating XP:', error);
        }
    },

    // Complete a level
    async completeLevel(levelId) {
        const level = this.levels.find(l => l.id === levelId);
        if (level) {
            this.userProgress.completedLevels.add(levelId);
            const newXP = this.userProgress.xp + level.xpReward;
            
            // Update XP on server first
            await this.updateXP(newXP);
            
            // Check if user can progress to next level
            if (levelId === this.userProgress.currentLevel) {
                this.userProgress.currentLevel++;
            }
            
            // Update the interface
            this.updateLevelInterface();
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