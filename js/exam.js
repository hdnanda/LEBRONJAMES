// Exam state management
const examState = {
    isExamMode: false,
    lives: 3,
    timeLeft: 300, // 5 minutes in seconds
    timer: null,
    currentLevel: null
};

// Initialize exam mode
function initializeExamMode() {
    // Check if we're in exam mode
    const currentLevel = window.xpService && window.xpService.getCurrentLevel ? 
        window.xpService.getCurrentLevel() : 
        (window.getCurrentLevel ? getCurrentLevel() : null);
        
    if (!currentLevel || !currentLevel.isExam) {
        return;
    }

    // Set exam mode flag
    examState.isExamMode = true;
    examState.currentLevel = currentLevel;

    // Show exam UI
    document.getElementById('exam-header').style.display = 'flex';
    document.body.classList.add('exam-mode');

    // Initialize audio system if not already initialized
    if (window.AudioManager && !window.AudioManager.isInitialized) {
        window.AudioManager.initialize();
    }

    // Play exam start sound
    if (window.AudioManager && window.AudioManager.isEnabled) {
        window.AudioManager.playSound('examStart');
    }

    // Show warning message with sound
    const warning = document.getElementById('exam-warning');
    warning.style.display = 'block';
    if (window.AudioManager && window.AudioManager.isEnabled) {
        window.AudioManager.playSound('examWarning');
    }
    setTimeout(() => {
        warning.style.display = 'none';
    }, 5000);

    // Start timer
    startTimer();
}

// Timer functionality
function startTimer() {
    updateTimerDisplay();
    examState.timer = setInterval(() => {
        examState.timeLeft--;
        updateTimerDisplay();
        
        if (examState.timeLeft <= 0) {
            handleExamFailure('Time\'s up!');
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(examState.timeLeft / 60);
    const seconds = examState.timeLeft % 60;
    document.getElementById('timer').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Lives management
function updateLives(remainingLives) {
    const hearts = document.querySelectorAll('.heart');
    hearts.forEach((heart, index) => {
        if (index < remainingLives) {
            heart.classList.remove('lost');
        } else {
            // Add shatter animation
            heart.classList.add('lost');
            heart.style.animation = 'shatter 0.5s ease-out forwards';
            
            // Play shatter sound using AudioManager
            if (window.AudioManager && window.AudioManager.isEnabled) {
                window.AudioManager.playSound('incorrect');
            }
        }
    });
}

// Handle wrong answer
function handleWrongAnswer() {
    examState.lives--;
    updateLives(examState.lives);
    
    if (examState.lives <= 0) {
        handleExamFailure('No lives remaining!');
    }
}

// Handle exam failure
function handleExamFailure(reason) {
    clearInterval(examState.timer);
    
    // Play failure sound
    if (window.AudioManager && window.AudioManager.isEnabled) {
        window.AudioManager.playSound('examFail');
    }
    
    // Apply XP penalty - deduct 100 XP
    if (window.ConnectionHelper) {
        // First get current XP
        window.ConnectionHelper.getUserXP().then(data => {
            if (data && data.success) {
                const currentXP = parseInt(data.xp) || 0;
                const newXP = Math.max(0, currentXP - 100); // Don't go below 0
                
                // Update XP with penalty
                window.ConnectionHelper.updateXP(newXP).then(() => {
                    console.log('[Exam] Applied 100 XP penalty for failing exam');
                    
                    // Show XP penalty notification
                    const notification = document.createElement('div');
                    notification.className = 'xp-notification';
                    notification.innerHTML = `-100 XP! 😢`;
                    notification.style.backgroundColor = '#FF5252';
                    document.body.appendChild(notification);
                    
                    setTimeout(() => {
                        notification.classList.add('fade-out');
                        setTimeout(() => notification.remove(), 500);
                    }, 3000);
                });
            }
        });
    }
    
    // Show XP penalty notification
    const penalty = document.getElementById('xp-penalty');
    if (penalty) {
        penalty.style.display = 'block';
        setTimeout(() => {
            penalty.style.display = 'none';
        }, 3000);
    }
    
    // Redirect back to levels page after delay
    setTimeout(() => {
        window.location.href = 'levels.html';
    }, 3000);
}

// Handle exam success
function handleExamSuccess() {
    clearInterval(examState.timer);
    
    // Play success sound
    if (window.AudioManager && window.AudioManager.isEnabled) {
        window.AudioManager.playSound('examComplete');
    }
    
    // Mark exam as completed - use server API instead of localStorage
    if (window.xpService) {
        // Add bonus XP for completing exam
        window.xpService.addXP(200);
    }
    
    // Redirect back to levels page
    window.location.href = 'levels.html';
}

// Modify the existing handleAnswer function
const originalHandleAnswer = window.handleAnswer;
window.handleAnswer = function(selectedIndex, correctIndex) {
    if (examState.isExamMode) {
        const selectedButton = optionsContainer.children[selectedIndex];
        const correctButton = optionsContainer.children[correctIndex];
        
        if (selectedIndex === correctIndex) {
            // Correct answer in exam mode
            selectedButton.classList.add('correct');
            if (window.AudioManager && window.AudioManager.isEnabled) {
                window.AudioManager.playSound('correct');
            }
            
            // Show feedback
            const feedbackContainer = document.getElementById('feedback-container');
            const feedbackText = document.getElementById('feedback-text');
            const continueBtn = document.getElementById('continue-btn');
            
            feedbackText.textContent = 'Correct! Well done!';
            feedbackContainer.classList.remove('hidden');
            feedbackContainer.classList.add('visible');
            
            // Show and enable continue button
            continueBtn.style.display = 'inline-block';
            continueBtn.style.opacity = '1';
            continueBtn.style.pointerEvents = 'auto';
            continueBtn.style.visibility = 'visible';
            continueBtn.onclick = handleContinue;
            
            if (currentQuestionIndex === questionsPerLesson - 1) {
                handleExamSuccess();
            }
        } else {
            // Wrong answer in exam mode
            selectedButton.classList.add('incorrect');
            correctButton.classList.add('correct');
            if (window.AudioManager && window.AudioManager.isEnabled) {
                window.AudioManager.playSound('incorrect');
            }
            
            // Show feedback
            const feedbackContainer = document.getElementById('feedback-container');
            const feedbackText = document.getElementById('feedback-text');
            const continueBtn = document.getElementById('continue-btn');
            
            feedbackText.textContent = 'Incorrect! The correct answer was: ' + correctButton.textContent;
            feedbackContainer.classList.remove('hidden');
            feedbackContainer.classList.add('visible');
            
            // Show and enable continue button
            continueBtn.style.display = 'inline-block';
            continueBtn.style.opacity = '1';
            continueBtn.style.pointerEvents = 'auto';
            continueBtn.style.visibility = 'visible';
            continueBtn.onclick = handleContinue;
            
            handleWrongAnswer();
        }
        
        // Disable all options after selection
        Array.from(optionsContainer.children).forEach(button => {
            button.disabled = true;
        });
    } else {
        // Normal mode handling
        originalHandleAnswer(selectedIndex, correctIndex);
    }
};

// Initialize exam mode when page loads
document.addEventListener('DOMContentLoaded', initializeExamMode);

class ExamManager {
    constructor() {
        this.lives = 3;
        this.timeLimit = 30 * 60; // 30 minutes in seconds
        this.timeRemaining = this.timeLimit;
        this.timerInterval = null;
        this.isExamActive = false;
        this.shatterSound = new Audio('sounds/shatter.mp3');
        
        // Initialize return button event listener
        const returnBtn = document.getElementById('return-to-levels');
        if (returnBtn) {
            returnBtn.addEventListener('click', () => {
                window.location.href = 'levels.html';
            });
        }
    }

    startExam() {
        this.isExamActive = true;
        this.lives = 3;
        this.timeRemaining = this.timeLimit;
        
        // Show exam elements
        const examHeader = document.getElementById('exam-header');
        const examWarning = document.getElementById('exam-warning');
        
        if (examHeader) {
            examHeader.style.display = 'flex';
            // Reset hearts
            const hearts = examHeader.querySelectorAll('.heart');
            hearts.forEach(heart => {
                heart.classList.remove('lost');
                heart.style.animation = 'none';
                // Force reflow
                void heart.offsetWidth;
                heart.style.animation = '';
            });
        }
        
        if (examWarning) {
            examWarning.style.display = 'block';
            setTimeout(() => {
                examWarning.style.display = 'none';
            }, 3000);
        }
        
        // Add exam mode class to body
        document.body.classList.add('exam-mode');
        
        // Start timer
        this.startTimer();
    }

    endExam() {
        this.isExamActive = false;
        clearInterval(this.timerInterval);
        
        // Hide exam elements
        const examHeader = document.getElementById('exam-header');
        const examWarning = document.getElementById('exam-warning');
        
        if (examHeader) {
            examHeader.style.display = 'none';
        }
        
        if (examWarning) {
            examWarning.style.display = 'none';
        }
        
        // Remove exam mode class from body
        document.body.classList.remove('exam-mode');
    }

    startTimer() {
        this.updateTimerDisplay();
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            this.updateTimerDisplay();
            
            if (this.timeRemaining <= 0) {
                this.handleTimeUp();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const timerElement = document.getElementById('timer');
        if (timerElement) {
            const minutes = Math.floor(this.timeRemaining / 60);
            const seconds = this.timeRemaining % 60;
            timerElement.textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    handleWrongAnswer() {
        if (!this.isExamActive) return;
        
        this.lives--;
        
        // Play shatter sound
        if (this.shatterSound) {
            this.shatterSound.currentTime = 0; // Reset sound to start
            this.shatterSound.play().catch(error => {
                console.error('Error playing shatter sound:', error);
            });
        }
        
        // Animate heart loss
        const hearts = document.querySelectorAll('.heart');
        if (hearts[this.lives]) {
            hearts[this.lives].classList.add('lost');
            hearts[this.lives].style.animation = 'shatter 0.5s ease-out forwards';
        }
        
        if (this.lives <= 0) {
            this.handleExamFailure();
        }
    }

    handleExamFailure() {
        if (!this.isExamActive) return;
        
        // Stop the timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // Play failure sound
        if (window.AudioManager && window.AudioManager.isEnabled) {
            window.AudioManager.playSound('examFail');
        }
        
        // Apply XP penalty - deduct 100 XP
        if (window.ConnectionHelper) {
            // First get current XP
            window.ConnectionHelper.getUserXP().then(data => {
                if (data && data.success) {
                    const currentXP = parseInt(data.xp) || 0;
                    const newXP = Math.max(0, currentXP - 100); // Don't go below 0
                    
                    // Update XP with penalty
                    window.ConnectionHelper.updateXP(newXP).then(() => {
                        console.log('[Exam] Applied 100 XP penalty for failing exam');
                        
                        // Show XP penalty notification
                        const notification = document.createElement('div');
                        notification.className = 'xp-notification';
                        notification.innerHTML = `-100 XP! 😢`;
                        notification.style.backgroundColor = '#FF5252';
                        document.body.appendChild(notification);
                        
                        setTimeout(() => {
                            notification.classList.add('fade-out');
                            setTimeout(() => notification.remove(), 500);
                        }, 3000);
                    });
                }
            });
        }
        
        // Show failure feedback
        const failureFeedback = document.getElementById('exam-failure-feedback');
        if (failureFeedback) {
            failureFeedback.style.display = 'block';
            
            // Hide feedback after 3 seconds
            setTimeout(() => {
                // End exam after delay
                this.endExam();
                
                // Redirect back to levels page
                window.location.href = 'levels.html';
            }, 3000);
        } else {
            this.endExam();
            const failureFeedback = document.getElementById('exam-failure-feedback');
            if (failureFeedback) {
                failureFeedback.style.display = 'block';
            }
            
            failureFeedback.querySelector('p').textContent = 'The exam has ended.';
            
            // Redirect back to levels page after delay
            setTimeout(() => {
                window.location.href = 'levels.html';
            }, 3000);
        }
    }

    handleTimeUp() {
        this.endExam();
        const failureFeedback = document.getElementById('exam-failure-feedback');
        if (failureFeedback) {
            failureFeedback.querySelector('h2').textContent = '⏱️ Time\'s Up! ⏱️';
            failureFeedback.querySelector('p').textContent = 'The exam has ended.';
            failureFeedback.classList.add('visible');
        }
    }
}

// Initialize exam manager
window.examManager = new ExamManager();

// Function to start exam mode
function startExamMode() {
    window.examManager.startExam();
}

// Export the function
window.startExamMode = startExamMode; 
