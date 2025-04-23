// Streak Service for managing user streaks and progress
const streakService = {
    currentStreak: 0,
    questionStreak: 0,
    lastActivityDate: null,
    streakBar: null,
    streakFill: null,
    streakCount: null,

    initializeStreaks() {
        // Initialize DOM elements
        this.streakBar = document.querySelector('.streak-progress-bar');
        this.streakFill = document.querySelector('.streak-fill');
        this.streakCount = document.getElementById('streak-count');
        
        // Ensure streak fill has proper initial state
        if (this.streakFill) {
            this.streakFill.style.display = 'block';
            this.streakFill.style.transition = 'width 0.3s ease';
        }
        
        // Load saved streak data
        const savedData = localStorage.getItem('streakData');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.currentStreak = data.currentStreak || 0;
            // Always reset question streak when initializing a new session
            this.questionStreak = 0;
            this.lastActivityDate = data.lastActivityDate ? new Date(data.lastActivityDate) : null;
            
            // Check if streak should be maintained or reset
            const today = new Date().toDateString();
            if (this.lastActivityDate) {
                const lastLogin = new Date(this.lastActivityDate);
                const daysSinceLastLogin = Math.floor((new Date() - lastLogin) / (1000 * 60 * 60 * 24));
                
                if (daysSinceLastLogin > 1) {
                    // Reset streaks if more than 1 day has passed
                    this.resetStreak();
                } else if (daysSinceLastLogin === 1) {
                    // Increment daily streak for consecutive day login
                    this.currentStreak++;
                }
            }
            
            // Update last activity date
            this.lastActivityDate = new Date();
            this.saveStreakData();
        } else {
            // Initialize new streak
            this.currentStreak = 1;
            this.questionStreak = 0;
            this.lastActivityDate = new Date();
            this.saveStreakData();
        }
        
        // Update UI with current streaks
        this.updateStreakDisplay();
    },

    resetStreak() {
        // Reset streak values
        this.currentStreak = 0;
        this.questionStreak = 0;
        
        // Reset localStorage
        localStorage.setItem('currentStreak', '0');
        localStorage.setItem('streakData', JSON.stringify({
            currentStreak: 0,
            questionStreak: 0,
            lastActivityDate: new Date().toISOString()
        }));
        
        // Force a reflow to ensure the transition works
        if (this.streakFill) {
            this.streakFill.style.width = '0%';
            this.streakFill.classList.remove('orange');
        }
        
        // Update streak text display
        const streakText = document.querySelector('.streak-text span');
        if (streakText) {
            streakText.textContent = '0/10';
        }
        
        // Update the display
        this.updateStreakDisplay();
    },

    handleStreakUpdate(isCorrect) {
        if (isCorrect) {
            this.questionStreak++;
            this.updateStreakDisplay();
        } else {
            this.resetStreak();
        }
        this.saveStreakData();
    },

    updateStreakDisplay() {
        if (!this.streakFill) return;
        
        // Calculate width: each correct answer adds exactly 10%
        const widthPercentage = Math.min(this.questionStreak * 10, 100);
        
        // Force a reflow to ensure the transition works
        void this.streakFill.offsetWidth;
        
        // Update the width with a smooth transition
        this.streakFill.style.width = `${widthPercentage}%`;
        
        // Color transition: green (1-4 correct), orange (5-10 correct)
        if (this.questionStreak >= 5 && this.questionStreak <= 10) {
            this.streakFill.classList.add('orange');
        } else {
            this.streakFill.classList.remove('orange');
        }
        
        // Update streak text display
        const streakText = document.querySelector('.streak-text span');
        if (streakText) {
            streakText.textContent = `${this.questionStreak}/10`;
        }
        
        // Update streak count display
        if (this.streakCount) {
            this.streakCount.textContent = this.currentStreak;
        }
    },

    saveStreakData() {
        const data = {
            currentStreak: this.currentStreak,
            questionStreak: this.questionStreak,
            lastActivityDate: this.lastActivityDate ? this.lastActivityDate.toISOString() : null
        };
        localStorage.setItem('streakData', JSON.stringify(data));
    }
};

// Make streakService available globally
window.streakService = streakService; 