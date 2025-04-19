// Daily Streak Service for managing daily login streaks
const dailyStreakService = {
    currentStreak: 0,
    lastLoginDate: null,
    streakBar: null,
    streakFill: null,
    streakText: null,
    rewardGiven: false,

    initializeDailyStreak() {
        // Initialize DOM elements
        this.streakBar = document.querySelector('.streak-progress');
        this.streakFill = document.querySelector('.streak-bar');
        this.streakText = document.querySelector('.streak-text span');
        
        // Load saved streak data
        const savedData = localStorage.getItem('dailyStreakData');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.currentStreak = data.currentStreak || 0;
            this.lastLoginDate = data.lastLoginDate ? new Date(data.lastLoginDate) : null;
            this.rewardGiven = data.rewardGiven || false;
            
            // Check if streak should be maintained or reset
            if (this.lastLoginDate) {
                const lastLogin = new Date(this.lastLoginDate);
                const today = new Date();
                
                // Reset time part to compare only dates
                lastLogin.setHours(0, 0, 0, 0);
                today.setHours(0, 0, 0, 0);
                
                const daysSinceLastLogin = Math.floor((today - lastLogin) / (1000 * 60 * 60 * 24));
                
                if (daysSinceLastLogin > 1) {
                    // Reset streak if more than 1 day has passed
                    this.resetStreak();
                } else if (daysSinceLastLogin === 1) {
                    // Increment streak for consecutive day login
                    this.currentStreak++;
                    this.lastLoginDate = new Date();
                    this.checkAndGiveReward();
                    this.saveStreakData();
                }
            }
        } else {
            // Initialize new streak
            this.currentStreak = 1;
            this.lastLoginDate = new Date();
            this.saveStreakData();
        }
        
        // Update UI
        this.updateStreakDisplay();
        this.showWelcomeBack();
    },

    resetStreak() {
        this.currentStreak = 1;
        this.lastLoginDate = new Date();
        this.rewardGiven = false;
        this.saveStreakData();
        this.updateStreakDisplay();
    },

    updateStreakDisplay() {
        if (!this.streakFill || !this.streakText) return;
        
        // Update the streak counter
        this.streakText.textContent = `${this.currentStreak}/10`;
        
        // Calculate width percentage (each day is 10%)
        const widthPercentage = Math.min(this.currentStreak * 10, 100);
        
        // Update the progress bar width
        this.streakFill.style.width = `${widthPercentage}%`;
        
        // Add special effects for high streaks
        if (this.currentStreak >= 7) {
            this.streakFill.style.background = 'linear-gradient(90deg, #4CAF50, #8BC34A)';
            this.streakFill.style.boxShadow = '0 0 15px rgba(76, 175, 80, 0.5)';
        } else {
            this.streakFill.style.background = '#58cc02';
            this.streakFill.style.boxShadow = '0 0 10px rgba(88, 204, 2, 0.3)';
        }
    },

    checkAndGiveReward() {
        if (this.currentStreak === 10 && !this.rewardGiven) {
            // Give reward
            const currentXP = parseInt(localStorage.getItem('totalXP')) || 0;
            const rewardXP = 500; // 500 XP reward for 10-day streak
            localStorage.setItem('totalXP', currentXP + rewardXP);
            
            // Show reward notification
            this.showRewardNotification(rewardXP);
            
            // Mark reward as given
            this.rewardGiven = true;
            this.saveStreakData();
        }
    },

    showRewardNotification(xp) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'streak-reward-notification';
        notification.innerHTML = `
            <h3>🎉 Amazing Dedication! 🎉</h3>
            <p>You've maintained a 10-day streak!</p>
            <p>Reward: +${xp} XP</p>
        `;
        
        // Add notification styles
        notification.style.position = 'fixed';
        notification.style.top = '20%';
        notification.style.left = '50%';
        notification.style.transform = 'translate(-50%, -50%)';
        notification.style.background = 'var(--app-bg)';
        notification.style.padding = '20px';
        notification.style.borderRadius = '10px';
        notification.style.boxShadow = '0 0 20px rgba(0,0,0,0.3)';
        notification.style.zIndex = '1000';
        notification.style.textAlign = 'center';
        notification.style.animation = 'fadeInOut 4s forwards';
        
        // Add animation keyframes
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translate(-50%, -30%); }
                10% { opacity: 1; transform: translate(-50%, -50%); }
                90% { opacity: 1; transform: translate(-50%, -50%); }
                100% { opacity: 0; transform: translate(-50%, -70%); }
            }
        `;
        document.head.appendChild(style);
        
        // Add to document
        document.body.appendChild(notification);
        
        // Remove after animation
        setTimeout(() => {
            notification.remove();
            style.remove();
        }, 4000);
    },

    showWelcomeBack() {
        if (this.currentStreak > 1) {
            const message = document.createElement('div');
            message.className = 'welcome-back-message';
            message.innerHTML = `Welcome back! 🎯 Day ${this.currentStreak} streak!`;
            
            // Style the message
            message.style.position = 'fixed';
            message.style.top = '10%';
            message.style.left = '50%';
            message.style.transform = 'translate(-50%, -50%)';
            message.style.background = 'var(--app-bg)';
            message.style.padding = '10px 20px';
            message.style.borderRadius = '20px';
            message.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
            message.style.zIndex = '1000';
            message.style.animation = 'fadeInOut 3s forwards';
            
            document.body.appendChild(message);
            
            setTimeout(() => {
                message.remove();
            }, 3000);
        }
    },

    saveStreakData() {
        const data = {
            currentStreak: this.currentStreak,
            lastLoginDate: this.lastLoginDate.toISOString(),
            rewardGiven: this.rewardGiven
        };
        localStorage.setItem('dailyStreakData', JSON.stringify(data));
    }
};

// Make dailyStreakService available globally
window.dailyStreakService = dailyStreakService; 