// Daily Streak Service for managing daily login streaks
const dailyStreakService = {
    currentStreak: 0,
    lastLoginDate: null,
    streakBar: null,
    streakFill: null,
    streakText: null,
    rewardGiven: false,
    correctAnswerStreak: 0, // Track correct answer streak within sessions

    initializeDailyStreak() {
        // Initialize DOM elements
        this.streakBar = document.querySelector('.streak-progress-bar');
        this.streakFill = document.querySelector('.streak-fill');
        this.streakText = document.getElementById('streak-count');
        
        // Load saved streak data
        const savedData = localStorage.getItem('dailyStreakData');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.currentStreak = data.currentStreak || 0;
            this.lastLoginDate = data.lastLoginDate ? new Date(data.lastLoginDate) : null;
            this.rewardGiven = data.rewardGiven || false;
            this.correctAnswerStreak = data.correctAnswerStreak || 0; // Load correct answer streak
            
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
        this.correctAnswerStreak = 0; // Reset correct answer streak
        this.saveStreakData();
        this.updateStreakDisplay();
    },

    updateStreakDisplay() {
        if (!this.streakFill || !this.streakText) return;
        
        // Update the streak counter
        this.streakText.textContent = this.currentStreak;
        
        // Set up the streak fill bar
        if (this.streakFill) {
            // Update visual effects for the streak bar based on values
            if (this.correctAnswerStreak > 0) {
                // Use correctAnswerStreak for the current session progress
                const streakWidthPercentage = Math.min(this.correctAnswerStreak * 10, 100);
                this.streakFill.style.width = `${streakWidthPercentage}%`;
            } else {
                // Default width for new sessions
                this.streakFill.style.width = '0%';
            }
            
            // Add special effects for high streaks
            if (this.correctAnswerStreak >= 7) {
                this.streakFill.style.background = 'linear-gradient(90deg, #4CAF50, #8BC34A)';
                this.streakFill.style.boxShadow = '0 0 15px rgba(76, 175, 80, 0.5)';
            } else {
                this.streakFill.style.background = '#58cc02';
                this.streakFill.style.boxShadow = '0 0 10px rgba(88, 204, 2, 0.3)';
            }
        }
    },

    checkAndGiveReward() {
        if (this.currentStreak === 10 && !this.rewardGiven) {
            // Give reward using xpService
            const rewardXP = 500; // 500 XP reward for 10-day streak
            
            if (window.xpService && window.xpService.initialized) {
                window.xpService.addXP(rewardXP);
            } else {
                // Fallback if xpService not available
                console.warn('XP Service not available, using direct API call for streak reward');
                fetch('https://financial-backend1.onrender.com/backend/dummy_xp.php', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Username': localStorage.getItem('username')
                    },
                    body: JSON.stringify({ 
                        xp: rewardXP,
                        type: 'streak-reward'
                    })
                }).catch(error => {
                    console.error('Failed to apply streak reward:', error);
                });
            }
            
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

    // Handle streak updates when answering questions
    handleStreakUpdate(isCorrect) {
        if (isCorrect) {
            // Increment the correct answer streak
            this.correctAnswerStreak++;
            
            // Update streak display in settings panel
            const streakDisplay = document.getElementById('streak-count');
            if (streakDisplay) {
                streakDisplay.textContent = this.correctAnswerStreak;
            }
            
            // Update streak bar in the top bar
            const streakFill = document.querySelector('.streak-fill');
            if (streakFill) {
                // Calculate width percentage based on correct answer streak (max 10)
                const streakWidthPercentage = Math.min(this.correctAnswerStreak * 10, 100);
                streakFill.style.width = `${streakWidthPercentage}%`;
                
                // Add special effects for high streaks
                if (this.correctAnswerStreak >= 7) {
                    streakFill.style.background = 'linear-gradient(90deg, #4CAF50, #8BC34A)';
                    streakFill.style.boxShadow = '0 0 15px rgba(76, 175, 80, 0.5)';
                } else {
                    streakFill.style.background = '#58cc02';
                    streakFill.style.boxShadow = '0 0 10px rgba(88, 204, 2, 0.3)';
                }
            }
            
            // Show a small notification for streak milestones
            if (this.correctAnswerStreak === 3 || this.correctAnswerStreak === 5 || 
                this.correctAnswerStreak === 7 || this.correctAnswerStreak === 10) {
                this.showStreakMilestoneNotification();
            }
            
            // Save streak data
            this.saveStreakData();
        } else {
            // Reset the correct answer streak on wrong answers
            this.correctAnswerStreak = 0;
            
            // Update streak display in settings panel
            const streakDisplay = document.getElementById('streak-count');
            if (streakDisplay) {
                streakDisplay.textContent = this.correctAnswerStreak;
            }
            
            // Update streak bar
            const streakFill = document.querySelector('.streak-fill');
            if (streakFill) {
                streakFill.style.width = '0%';
            }
            
            // Save streak data
            this.saveStreakData();
        }
    },
    
    // Show notification for streak milestones
    showStreakMilestoneNotification() {
        const notification = document.createElement('div');
        notification.className = 'streak-milestone-notification';
        notification.innerHTML = `${this.correctAnswerStreak} correct in a row! 🔥`;
        
        // Style the notification
        notification.style.position = 'fixed';
        notification.style.top = '60px';
        notification.style.right = '20px';
        notification.style.background = '#4CAF50';
        notification.style.color = 'white';
        notification.style.padding = '10px 20px';
        notification.style.borderRadius = '4px';
        notification.style.zIndex = '1000';
        notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        notification.style.animation = 'slide-in-right 0.5s forwards';
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slide-in-right {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        // Add to document
        document.body.appendChild(notification);
        
        // Remove after a delay
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                notification.remove();
                style.remove();
            }, 500);
        }, 2000);
    },

    saveStreakData() {
        const data = {
            currentStreak: this.currentStreak,
            lastLoginDate: this.lastLoginDate.toISOString(),
            rewardGiven: this.rewardGiven,
            correctAnswerStreak: this.correctAnswerStreak // Save correct answer streak
        };
        localStorage.setItem('dailyStreakData', JSON.stringify(data));
    }
};

// Make dailyStreakService available globally
window.dailyStreakService = dailyStreakService;

// For backwards compatibility with code that uses streakService
window.streakService = dailyStreakService; 
