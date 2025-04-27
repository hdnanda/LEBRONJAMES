// Learning Path System
const learningPath = {
    // Level definitions with their properties
    levels: [
        {
            id: 1,
            title: "Money Basics",
            description: "Understanding the fundamentals of money",
            icon: "💰",
            requiredScore: 70,
            xpReward: 100,
            questions: null // This will be populated with random questions
        },
        {
            id: 2,
            title: "Banking 101",
            description: "Learn about banks and accounts",
            icon: "🏦",
            requiredLevel: 1,
            xpReward: 150,
            questions: [6, 7, 8, 9, 10]
        },
        {
            id: 3,
            title: "Credit & Debt",
            description: "Understanding credit and managing debt",
            icon: "💳",
            requiredLevel: 2,
            xpReward: 200,
            questions: [11, 12, 13, 14, 15]
        },
        {
            id: 4,
            title: "Investing Basics",
            description: "Introduction to investing",
            icon: "📈",
            requiredLevel: 3,
            xpReward: 250,
            questions: [16, 17, 18, 19, 20]
        },
        {
            id: 5,
            title: "Retirement Planning",
            description: "Planning for your future",
            icon: "👴",
            requiredLevel: 4,
            xpReward: 300,
            questions: [21, 22, 23, 24, 25]
        }
    ],

    // Current user progress
    userProgress: {
        currentLevel: 1,
        completedLevels: new Set(),
        xp: 0,
        levelScores: {}
    },

    // Initialize the level interface
    initializeLearningPath() {
        const levelContainer = document.createElement('div');
        levelContainer.className = 'level-container';
        levelContainer.innerHTML = this.generateLevelHTML();
        
        // Add click handlers for level buttons
        this.addLevelClickHandlers(levelContainer);
        
        // Insert the level container before the main interface
        const mainInterface = document.querySelector('.main-interface');
        if (mainInterface && mainInterface.parentNode) {
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
                        <div class="level-score">${this.getLevelScore(level)}</div>
                        <div class="level-reward">${level.xpReward} XP</div>
                        ${this.getLevelLockStatus(level)}
                    </div>
                `).join('')}
            </div>
        `;
    },

    // Get level score display
    getLevelScore(level) {
        const score = this.userProgress.levelScores[level.id];
        if (score !== undefined) {
            return `Score: ${score}%`;
        }
        return '';
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
            card.addEventListener('click', () => {
                const levelId = parseInt(card.dataset.levelId);
                if (this.canAccessLevel(levelId)) {
                    this.startLevel(levelId);
                }
            });
        });
    },

    // Check if user can access a level
    canAccessLevel(levelId) {
        return levelId <= this.userProgress.currentLevel;
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

    // Add XP to user's progress
    addXP(amount) {
        this.userProgress.xp += amount;
        // Save progress after XP update
        this.saveProgress();
        // Update the interface to reflect new XP
        this.updateLevelInterface();
    },

    // Complete a level
    completeLevel(levelId, score) {
        const level = this.levels.find(l => l.id === levelId);
        if (level) {
            // Save the score
            this.userProgress.levelScores[levelId] = Math.round(score);
            
            // Mark level as completed
            this.userProgress.completedLevels.add(levelId);
            
            // Unlock next level
            if (levelId === this.userProgress.currentLevel) {
                this.userProgress.currentLevel++;
            }
            
            // Save progress to localStorage
            this.saveProgress();
        }
    },

    // Update the level interface
    updateLevelInterface() {
        const container = document.querySelector('.level-container');
        if (container) {
            container.innerHTML = this.generateLevelHTML();
            this.addLevelClickHandlers(container);
        }
    },

    // Save progress to localStorage
    saveProgress() {
        const progress = {
            currentLevel: this.userProgress.currentLevel,
            completedLevels: Array.from(this.userProgress.completedLevels),
            xp: this.userProgress.xp,
            levelScores: this.userProgress.levelScores
        };
        localStorage.setItem('learningPathProgress', JSON.stringify(progress));
    },

    // Load progress from localStorage
    loadProgress() {
        const saved = localStorage.getItem('learningPathProgress');
        if (saved) {
            const progress = JSON.parse(saved);
            this.userProgress.currentLevel = progress.currentLevel;
            this.userProgress.completedLevels = new Set(progress.completedLevels);
            this.userProgress.xp = progress.xp;
            this.userProgress.levelScores = progress.levelScores;
        }
    }
};

// Initialize the learning path when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Attach the learning path to the window object
    window.learningPath = learningPath;
    // Load any saved progress
    learningPath.loadProgress();
    // Initialize the learning path
    learningPath.initializeLearningPath();
}); 