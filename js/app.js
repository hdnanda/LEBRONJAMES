// Main application logic for Financial Literacy App

// DOM Elements
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const progressText = document.getElementById('progress-text');
const feedbackContainer = document.getElementById('feedback-container');
const feedbackText = document.getElementById('feedback-text');
const continueBtn = document.getElementById('continue-btn');

// State variables
let currentQuestionIndex = 0;
let correctAnswers = 0;
let questionsPerLesson = 10;
let currentQuestions = [];
let isProcessingQuestion = false;
let currentTopic = null;
let currentSubLevel = null;
let currentLevel = null;
let preloadedNextQuestion = null;

// XP System Constants
const XP_SYSTEM = {
    LEVELS: {
        1: { name: "Basics of Money", requiredXP: 0, baseXP: 3 },
        2: { name: "Bank Basics", requiredXP: 100, baseXP: 3 },
        3: { name: "Credit & Debt", requiredXP: 250, baseXP: 3 },
        4: { name: "Investing 101", requiredXP: 450, baseXP: 3 },
        5: { name: "Retirement Planning", requiredXP: 700, baseXP: 3 }
    },
    BONUSES: {
        STREAK: 2,
        SPEED: 5,
        PERFECT: 5
    }
};

// Helper function to shuffle array elements
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Function to load questions for a specific topic and sublevel
function loadQuestionsForSubLevel(topicId, subLevelId) {
    console.log('Loading questions for topic:', topicId, 'sublevel:', subLevelId);
    
    // Ensure proper formatting of IDs
    topicId = parseInt(topicId);
    subLevelId = parseFloat(subLevelId);
    
    // Set currentLevelData based on the topic and sublevel
    const topic = window.topicsData?.find(t => t.id === topicId);
    const subLevel = topic?.subLevels?.find(s => s.id === subLevelId);
    
    if (topic && subLevel) {
        window.currentLevelData = {
            topicId: topicId,
            subLevelId: subLevelId,
            title: subLevel.title,
            isExam: subLevel.isExam || false
        };
    }
    
    // Check if this is an exam
    const isExam = window.currentLevelData && window.currentLevelData.isExam;
    
    // If it's an exam, start exam mode
    if (isExam) {
        window.startExamMode();
    }

    // Check if questions are loaded
    if (!window.questions || !Array.isArray(window.questions)) {
        console.error('Questions not loaded properly. window.questions:', window.questions);
        questionText.textContent = "Error: Questions not loaded. Please refresh the page.";
        return;
    }

    currentTopic = topicId;
    currentSubLevel = subLevelId;
    currentLevel = `${topicId}.${subLevelId}`; // Set the currentLevel
    currentQuestionIndex = 0;
    correctAnswers = 0;
    
    console.log('Total available questions in window.questions:', window.questions.length);
    
    // Filter questions based on topic and sublevel
    let availableQuestions = window.questions.filter(q => 
        q.topicId === topicId && 
        (q.subLevelId === subLevelId || !q.subLevelId) // Include questions without specific sublevel
    );
    
    console.log('Questions matching topic and sublevel:', availableQuestions.length);
    
    // If not enough questions found, include questions from the same topic
    if (availableQuestions.length < questionsPerLesson) {
        console.log('Not enough specific questions, including topic questions');
        const topicQuestions = window.questions.filter(q => q.topicId === topicId);
        availableQuestions = [...new Set([...availableQuestions, ...topicQuestions])];
        console.log('Questions after including topic questions:', availableQuestions.length);
    }
    
    // If still not enough questions, include random questions
    if (availableQuestions.length < questionsPerLesson) {
        console.log('Still not enough questions, including random questions');
        const randomQuestions = window.questions.filter(q => 
            !availableQuestions.includes(q)
        );
        availableQuestions = [...availableQuestions, ...randomQuestions];
        console.log('Questions after including random questions:', availableQuestions.length);
    }
    
    // Shuffle questions and take required number
    currentQuestions = shuffleArray(availableQuestions).slice(0, questionsPerLesson);
    console.log('Final number of questions selected:', currentQuestions.length);
    console.log('Questions per lesson setting:', questionsPerLesson);
    
    // Update progress text
    if (topic && subLevel) {
        progressText.textContent = `${topic.title} - ${subLevel.title}`;
    } else {
        progressText.textContent = `Topic ${topicId} - Level ${subLevelId}`;
        console.warn('Could not find topic or sublevel info:', { topicId, subLevelId, topic, subLevel });
    }
    
    // Load first question
    if (currentQuestions.length > 0) {
        loadQuestion();
    } else {
        console.error('No questions available to load');
        questionText.textContent = "Error: No questions available. Please try another level.";
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize audio system silently
    if (window.AudioManager) {
        window.AudioManager.initialize();
    }
    
    // Add click handler to options container for first interaction
    optionsContainer.addEventListener('click', function firstClick() {
        if (window.AudioManager && !window.AudioManager.hasUserInteracted) {
            window.AudioManager.hasUserInteracted = true;
            if (!window.AudioManager.audioContext) {
                window.AudioManager.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
        }
        optionsContainer.removeEventListener('click', firstClick);
    });
    
    // Initialize streaks if available
    if (window.streakService) {
        window.streakService.initializeStreaks();
    }
    
    // Get parameters from URL
    const urlParams = new URLSearchParams(window.location.search);
    const topicId = parseInt(urlParams.get('topic'));
    const subLevelId = parseFloat(urlParams.get('sublevel'));
    
    if (topicId && subLevelId) {
        // Load questions for the selected topic and sublevel
        loadQuestionsForSubLevel(topicId, subLevelId);
    } else {
        // If no topic/sublevel specified, redirect back to levels.html
        window.location.href = 'levels.html';
    }

    // Initialize settings panel
    initializeSettingsPanel();
});

/**
 * Preload the next question in the background
 */
function preloadNextQuestion() {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questionsPerLesson && currentQuestions[nextIndex]) {
        preloadedNextQuestion = currentQuestions[nextIndex];
    }
}

/**
 * Load the current question and its options
 */
function loadQuestion() {
    try {
        console.log('Loading question. Current index:', currentQuestionIndex);
        console.log('Total questions available:', currentQuestions.length);
        
        // Reset any previous question state
        resetAnimations();
        
        // Get the current question directly from currentQuestions array
        const question = currentQuestions[currentQuestionIndex];
        
        if (!question) {
            console.error('No question found at index:', currentQuestionIndex);
            throw new Error('Invalid question at current index');
        }

        // Now that we know question exists, we can safely log and access its properties
        console.log('Loading question:', {
            index: currentQuestionIndex,
            questionId: question.id,
            question: question.question,
            totalQuestions: currentQuestions.length
        });
        
        // Update question text with emoji
        questionText.textContent = `📈 ${question.question}`;
        
        // Clear previous options
        optionsContainer.innerHTML = '';
        
        // Create a copy of options and shuffle them
        const shuffledOptions = shuffleArray([...question.options]);
        
        // Find the new index of the correct answer after shuffling
        const correctAnswer = question.options[question.correctIndex];
        const newCorrectIndex = shuffledOptions.indexOf(correctAnswer);
        
        // Create and add new options
        shuffledOptions.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.textContent = option;
            button.addEventListener('click', () => handleAnswer(index, newCorrectIndex));
            optionsContainer.appendChild(button);
        });
        
        // Update progress
        updateProgress();
        
        // Reset processing flag
        isProcessingQuestion = false;
        
        // Animate new question appearance
        animateNewQuestion();
    } catch (error) {
        console.error('Error in loadQuestion:', error);
        questionText.textContent = "Error loading questions. Please refresh the page.";
    }
}

/**
 * Handle user's answer selection
 * @param {number} selectedIndex - Index of the selected answer
 * @param {number} correctIndex - Index of the correct answer in the shuffled options
 */
async function handleAnswer(selectedIndex, correctIndex) {
    if (isProcessingQuestion) return;
    isProcessingQuestion = true;
    
    const isCorrect = selectedIndex === correctIndex;
    const selectedButton = optionsContainer.children[selectedIndex];
    const currentQuestion = currentQuestions[currentQuestionIndex];
    
    if (isCorrect) {
        correctAnswers++;
        window.animateCorrectFeedback(selectedButton);
        
        // Calculate and award XP immediately for correct answer
        try {
            const currentLevel = await getCurrentLevel();
            const baseXP = XP_SYSTEM.LEVELS[currentLevel].baseXP;
            const bonuses = {
                streak: correctAnswers >= 3,
                speed: currentQuestion.timeToAnswer && currentQuestion.timeToAnswer < 10
            };
            
            // Award XP immediately
            const earnedXP = await addXP(baseXP, bonuses);
            console.log('[Debug] Awarded XP for correct answer:', earnedXP);
            
            // Update streak through streak service
            if (window.streakService && typeof window.streakService.handleStreakUpdate === 'function') {
                window.streakService.handleStreakUpdate(true);
            }
        } catch (error) {
            console.error('[Error] Failed to award XP:', error);
        }
        
        // Check if this completes an exam
        if (window.currentLevelData?.isExam && currentQuestionIndex === questionsPerLesson - 1) {
            const passThreshold = 0.8; // 80% correct to pass
            const progress = correctAnswers / questionsPerLesson;
            const passed = progress >= passThreshold;
            console.log(`[Debug] Exam completed. Progress: ${progress}, Passed: ${passed}`);
            await handleExamCompletion(passed);
        }
    } else {
        window.animateIncorrectFeedback(selectedButton);
        const correctButton = optionsContainer.children[correctIndex];
        correctButton.classList.add('correct');
        
        // Handle exam mode if active
        if (window.examManager && window.examManager.isExamActive) {
            window.examManager.handleWrongAnswer();
        }
        
        // Update streak through streak service for incorrect answer
        if (window.streakService && typeof window.streakService.handleStreakUpdate === 'function') {
            window.streakService.handleStreakUpdate(false);
        }
    }
    
    // Disable all options after selection
    Array.from(optionsContainer.children).forEach(button => {
        button.disabled = true;
    });
    
    // Show and enable continue button
    const continueBtn = document.getElementById('continue-btn');
    if (continueBtn) {
        continueBtn.style.display = 'inline-block';
        continueBtn.style.opacity = '1';
        continueBtn.style.pointerEvents = 'auto';
        continueBtn.style.visibility = 'visible';
        continueBtn.style.position = 'relative';
        continueBtn.style.zIndex = '50';
        continueBtn.onclick = handleContinue;
    }
    
    // Update progress
    updateProgress();
    
    // Reset processing flag
    isProcessingQuestion = false;
}

/**
 * Handle continue button click
 */
function handleContinue() {
    console.log('Continue button clicked');
    console.log('Current question index:', currentQuestionIndex);
    console.log('Total questions:', questionsPerLesson);
    console.log('Current questions array length:', currentQuestions.length);
    
    // Play whoosh sound for transitioning to next question
    if (window.AudioManager && window.AudioManager.isEnabled) {
        window.AudioManager.playSound('whoosh');
    }
    
    currentQuestionIndex++;
    console.log('New question index after increment:', currentQuestionIndex);
    
    if (currentQuestionIndex < questionsPerLesson) {
        console.log('Loading next question...');
        resetAnimations();
        loadQuestion();
    } else {
        console.log('All questions completed, showing completion message');
        showCompletionMessage();
    }
}

/**
 * Update progress text
 */
function updateProgress() {
    progressText.textContent = `${currentQuestionIndex + 1}/10 📊`;
}

/**
 * Show completion message when all questions are answered
 */
function showCompletionMessage() {
    const totalQuestions = questionsPerLesson;
    const passThreshold = 0.7; // 70% to pass
    const passed = correctAnswers >= (totalQuestions * passThreshold);
    
    // Always reset streak at the end of a session
    if (window.streakService && typeof window.streakService.handleStreakUpdate === 'function') {
        window.streakService.questionStreak = 0;
        window.streakService.updateStreakDisplay();
    }
    
    // Show completion message with enhanced animation
    const feedbackContainer = document.getElementById('feedback-container');
    const feedbackText = document.getElementById('feedback-text');
    const continueBtn = document.getElementById('continue-btn');
    
    // Reset any existing classes and prepare for completion animation
    feedbackContainer.classList.remove('hidden', 'visible');
    feedbackContainer.classList.add('completion');
    continueBtn.classList.add('completion-btn');
    
    // Play level complete sound
    if (window.AudioManager && window.AudioManager.isEnabled) {
        window.AudioManager.playSound('levelComplete');
    }
    
    // Trigger confetti for perfect score
    if (correctAnswers === totalQuestions) {
        if (window.triggerLessonCompleteConfetti) {
            window.triggerLessonCompleteConfetti();
        }
    }
    
    if (passed) {
        feedbackText.innerHTML = `
            <span class="feedback-message">Congratulations! 🎉</span>
            <span class="explanation">You got ${correctAnswers} out of ${totalQuestions} questions correct!</span>
        `;
        
        // Mark level as completed if passed
        if (window.markLevelCompleted) {
            window.markLevelCompleted(currentLevel, true);
        }

        // If this is an exam, save the completed exam status
        if (window.examManager && window.examManager.isExamActive) {
            const completedExams = JSON.parse(localStorage.getItem('completedExams') || '[]');
            if (!completedExams.includes(currentLevel)) {
                completedExams.push(currentLevel);
                localStorage.setItem('completedExams', JSON.stringify(completedExams));
            }
            // Add bonus XP for completing exam
            addXP(20, { exam: true });
        }
    } else {
        feedbackText.innerHTML = `
            <span class="feedback-message">Keep practicing! 💪</span>
            <span class="explanation">You got ${correctAnswers} out of ${totalQuestions} questions correct. Try again to improve!</span>
        `;
        
        // Mark level as not completed if failed
        if (window.markLevelCompleted) {
            window.markLevelCompleted(currentLevel, false);
        }
    }
    
    // Show the completion message with animation
    requestAnimationFrame(() => {
        feedbackContainer.classList.remove('hidden');
        // Force a reflow
        void feedbackContainer.offsetWidth;
        feedbackContainer.classList.add('visible');
    });
    
    // Update continue button to return to levels.html
    continueBtn.textContent = "Return to Levels 🏠";
    continueBtn.onclick = async () => {
        // Get the latest XP before redirecting
        const currentXP = await getTotalXP();
        console.log('[Debug] Final XP before redirect:', currentXP);
        localStorage.setItem('lastEarnedXP', currentXP);
        
        // Add a fade-out animation before redirecting
        feedbackContainer.style.transition = 'all 0.5s ease';
        feedbackContainer.style.opacity = '0';
        feedbackContainer.style.transform = 'translate(-50%, -50%) scale(0.8)';
        setTimeout(() => {
            window.location.href = 'levels.html';
        }, 500);
    };
}

// Load saved progress
function loadProgress() {
    const savedProgress = localStorage.getItem('learningProgress');
    if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        currentQuestionIndex = progress.currentQuestionIndex || 0;
        correctAnswers = progress.correctAnswers || 0;
        currentLevel = progress.currentLevel || null;
        currentQuestions = progress.currentQuestions || [];
    }
}

// Save progress
function saveProgress() {
    const progress = {
        currentQuestionIndex,
        correctAnswers,
        currentLevel,
        currentQuestions
    };
    localStorage.setItem('learningProgress', JSON.stringify(progress));
}

// Initialize the app
function initApp(levelQuestions = null) {
    try {
        // Create learning path container if it doesn't exist
        let pathContainer = document.querySelector('.learning-path-container');
        if (!pathContainer) {
            pathContainer = document.createElement('div');
            pathContainer.className = 'learning-path-container';
            // Initially hide the container
            pathContainer.style.display = 'none';
            // Insert it before the main interface
            const mainInterface = document.querySelector('.main-interface');
            if (mainInterface && mainInterface.parentNode) {
                mainInterface.parentNode.insertBefore(pathContainer, mainInterface);
            }
        }

        // Initialize learning path if available
        if (window.learningPath && typeof window.learningPath.initializeLearningPath === 'function') {
            window.learningPath.initializeLearningPath();
        }

        // Reset streak and ensure display is updated when starting new level
        if (window.streakService) {
            window.streakService.questionStreak = 0;
            window.streakService.updateStreakDisplay();
            // Also reset the progress text
            const progressText = document.getElementById('progress-text');
            if (progressText) {
                progressText.textContent = '0/10 🎯';
            }
        }

        // Get all available questions
        const allQuestions = window.questions || [];
        console.log('Total available questions:', allQuestions.length);
        
        if (allQuestions.length === 0) {
            if (typeof window.questions === 'undefined') {
                console.error('Questions not loaded. Please ensure questions.js is loaded before app.js');
                questionText.textContent = "Error: Questions not loaded. Please refresh the page.";
                return;
            }
            throw new Error('No questions available');
        }
        
        // Reset state variables
        currentQuestionIndex = 0;
        correctAnswers = 0;
        preloadedNextQuestion = null;
        
        // For now, just get 10 random questions from all available questions
        currentQuestions = window.shuffleQuestions(allQuestions).slice(0, questionsPerLesson);
        console.log('Selected questions:', currentQuestions.map(q => q.id));
        
        // Reset animations and UI state
        resetAnimations();
        
        // Load the first question immediately
        const firstQuestion = currentQuestions[0];
        if (firstQuestion) {
            questionText.textContent = `📈 ${firstQuestion.question}`;
            optionsContainer.innerHTML = '';
            
            // Create a copy of options and shuffle them
            const shuffledOptions = shuffleArray([...firstQuestion.options]);
            
            // Find the new index of the correct answer after shuffling
            const correctAnswer = firstQuestion.options[firstQuestion.correctIndex];
            const newCorrectIndex = shuffledOptions.indexOf(correctAnswer);
            
            // Create and add new options
            shuffledOptions.forEach((option, index) => {
                const button = document.createElement('button');
                button.className = 'option-btn';
                button.textContent = option;
                button.addEventListener('click', () => handleAnswer(index, newCorrectIndex));
                optionsContainer.appendChild(button);
            });
            
            // Update progress
            updateProgress();
            
            // Animate new question appearance
            animateNewQuestion();
        }
        
        // Setup continue button
        const continueBtn = document.getElementById('continue-btn');
        if (continueBtn) {
            continueBtn.onclick = handleContinue;
            continueBtn.style.display = 'none';
            continueBtn.style.opacity = '0';
            continueBtn.style.pointerEvents = 'none';
            continueBtn.style.visibility = 'hidden';
            continueBtn.style.position = 'relative';
            continueBtn.style.zIndex = '50';
            continueBtn.textContent = "Continue to Next Question 👍";
        }
        
        // Initialize streak through streak service if available
        if (window.streakService && typeof window.streakService.initializeStreaks === 'function') {
            window.streakService.initializeStreaks();
        }
        
    } catch (error) {
        console.error('Error in initApp:', error);
        questionText.textContent = "Error loading questions. Please refresh the page.";
    }
}

// Reset animations and state
function resetAnimations() {
    // Remove correct/incorrect classes from options
    const options = document.querySelectorAll('.option-btn');
    options.forEach(option => {
        option.classList.remove('correct', 'incorrect');
        option.disabled = false;
    });
    
    // Remove blur effect from options container
    const optionsContainer = document.getElementById('options-container');
    if (optionsContainer) {
        optionsContainer.classList.remove('blur-inactive');
    }
    
    // Hide overlay
    const overlay = document.getElementById('overlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
    
    // Hide feedback container with animation
    const feedbackContainer = document.getElementById('feedback-container');
    if (feedbackContainer) {
        feedbackContainer.classList.remove('visible');
        // Wait for animation to complete before hiding
        setTimeout(() => {
            feedbackContainer.classList.add('hidden');
        }, 300);
    }
    
    // Reset continue button
    const continueBtn = document.getElementById('continue-btn');
    if (continueBtn) {
        continueBtn.textContent = "Continue to Next Question 👍";
        continueBtn.style.display = 'inline-block';
    }
}

// Shuffle questions
function shuffleQuestions(questionsArray = null) {
    // If no array provided, shuffle currentQuestions
    const arrayToShuffle = questionsArray || currentQuestions;
    
    // Create a copy of the array to avoid modifying the original
    const shuffled = [...arrayToShuffle];
    
    // Fisher-Yates shuffle algorithm
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled;
}

// Animate new question appearance
function animateNewQuestion() {
    const questionContainer = document.getElementById('question-container');
    if (questionContainer) {
        // Add fade-in animation
        questionContainer.style.opacity = '0';
        questionContainer.style.transform = 'translateY(20px)';
        
        // Force a reflow to ensure the initial state is rendered
        void questionContainer.offsetWidth;
        
        // Add transition properties
        questionContainer.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        // Trigger the animation
        requestAnimationFrame(() => {
            questionContainer.style.opacity = '1';
            questionContainer.style.transform = 'translateY(0)';
        });
        
        // Clean up after animation
        setTimeout(() => {
            questionContainer.style.transition = '';
        }, 500);
    }
}

// Show welcome back message
function showWelcomeMessage(streak) {
    const message = document.createElement('div');
    message.classList.add('streak-milestone');
    message.textContent = `Welcome back! 👋 Day ${streak} streak! 🔥`;
    document.querySelector('.app-container').appendChild(message);
    
    setTimeout(() => {
        message.classList.add('fade-out');
        setTimeout(() => {
            message.remove();
        }, 1000);
    }, 3000);
}

// Get total XP from backend API
async function getTotalXP() {
    try {
        console.log('[Debug] Fetching total XP from backend...');
        const response = await fetch('https://financial-backend-gc54.onrender.com/xp_handler.php', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        console.log('[Debug] XP Response Status:', response.status);
        console.log('[Debug] XP Response Headers:', [...response.headers.entries()]);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('[Debug] XP Response Data:', data);
        
        if (!data.success) {
            throw new Error(data.error || 'Failed to fetch XP');
        }
        
        // Update local storage and UI
        if (data.xp !== undefined) {
            localStorage.setItem('userXP', data.xp);
            // Update all XP displays
            ['totalXP', 'current-xp'].forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = data.xp;
                }
            });
        }
        
        return data.xp || 0;
    } catch (error) {
        console.error('[Error] Failed to fetch XP:', error);
        // Fallback to localStorage
        return parseInt(localStorage.getItem('userXP')) || 0;
    }
}

// Add XP with bonuses through backend API
async function addXP(baseAmount, bonuses = {}) {
    try {
        console.log('[Debug] Adding XP - Base Amount:', baseAmount, 'Bonuses:', bonuses);
        
        const currentLevel = await getCurrentLevel();
        const levelMultiplier = 1 + (currentLevel - 1) * 0.1; // 10% increase per level
        
        let earnedXP = baseAmount * levelMultiplier;
        
        // Apply bonuses
        if (bonuses.streak) earnedXP += XP_SYSTEM.BONUSES.STREAK;
        if (bonuses.speed) earnedXP += XP_SYSTEM.BONUSES.SPEED;
        if (bonuses.exam) earnedXP *= 1.5; // 50% bonus for exams
        
        // Round XP to nearest integer
        earnedXP = Math.round(earnedXP);
        
        // Get current total XP
        const currentTotalXP = await getTotalXP();
        const newTotalXP = currentTotalXP + earnedXP;
        
        console.log('[Debug] XP Calculation:', {
            currentXP: currentTotalXP,
            earned: earnedXP,
            newTotal: newTotalXP,
            level: currentLevel
        });
        
        // Send XP update to backend
        const response = await fetch('/FinancialLiteracyApp-main/backend/xp_handler.php', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ xp: newTotalXP })
        });
        
        console.log('[Debug] XP Update Response Status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('[Debug] XP Update Response:', data);
        
        if (!data.success) {
            throw new Error(data.error || 'XP update failed on server');
        }
        
        // Update local storage and UI
        localStorage.setItem('userXP', newTotalXP);
        
        // Update all XP displays
        ['totalXP', 'current-xp'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = newTotalXP;
            }
        });
        
        // Show XP gain notification
        showXPNotification(earnedXP);
        
        // Update progress display
        await updateProgressDisplay();
        
        return earnedXP;
    } catch (error) {
        console.error('[Error] Failed to update XP:', error);
        // Show error notification to user
        showFeedback('Failed to update XP. Please try again.', false);
        return 0;
    }
}

// Get current level based on XP from backend
async function getCurrentLevel() {
    const totalXP = await getTotalXP();
    let currentLevel = 1;
    
    for (let level = 5; level > 0; level--) {
        if (totalXP >= XP_SYSTEM.LEVELS[level].requiredXP) {
            currentLevel = level;
            break;
        }
    }
    
    return currentLevel;
}

// Check if a level is unlocked using current XP from backend
async function isLevelUnlocked(levelNumber) {
    const totalXP = await getTotalXP();
    return totalXP >= XP_SYSTEM.LEVELS[levelNumber].requiredXP;
}

// Show XP gain notification
function showXPNotification(amount) {
    const notification = document.createElement('div');
    notification.className = 'xp-notification';
    notification.innerHTML = `+${amount} XP! 🌟`;
    document.body.appendChild(notification);
    
    // Animate notification
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
    }, 2000);
}

// Function to show main menu
async function showMainMenu() {
    const mainInterface = document.querySelector('.main-interface');
    const currentXP = await getTotalXP();
    
    mainInterface.innerHTML = `
        <div class="topics-container">
            <h2>Select a Topic</h2>
            <div class="topics-grid">
                ${window.topicsData.map(topic => `
                    <div class="topic-card">
                        <h3>${topic.icon} ${topic.title}</h3>
                        <div class="sublevels">
                            ${topic.subLevels.map(sublevel => `
                                <button class="sublevel-btn ${sublevel.xpRequired > currentXP ? 'locked' : ''}"
                                        data-topic="${topic.id}"
                                        data-sublevel="${sublevel.id}"
                                        data-xp="${sublevel.xpRequired}">
                                    ${sublevel.title}
                                    ${sublevel.xpRequired > currentXP ? 
                                        `<span class="xp-required">${sublevel.xpRequired} XP</span>` : ''}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    // Add click handlers for sublevel buttons
    document.querySelectorAll('.sublevel-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const topicId = parseInt(btn.dataset.topic);
            const subLevelId = parseFloat(btn.dataset.sublevel);
            const xpRequired = parseInt(btn.dataset.xp);
            const currentXP = await getTotalXP();

            if (currentXP >= xpRequired) {
                loadQuestionsForSubLevel(topicId, subLevelId);
            } else {
                showFeedback(`You need ${xpRequired} XP to unlock this level!`, false);
            }
        });
    });
}

// Function to handle exam completion
async function handleExamCompletion(passed) {
    console.log('\n[Exam Completion] Handling exam completion...');
    console.log(`[Exam Completion] Exam passed:`, passed);
    
    if (passed && window.currentLevelData) {
        const { topicId, subLevelId, isExam } = window.currentLevelData;
        console.log(`[Exam Completion] Current level data:`, window.currentLevelData);
        
        if (isExam) {
            // Calculate score as percentage
            const score = Math.round((correctAnswers / questionsPerLesson) * 100);
            console.log(`[Exam Completion] Exam score: ${score}%`);
            
            // Update XP
            const topic = window.topicsData.find(t => t.id === topicId);
            const subLevel = topic?.subLevels.find(s => s.id === subLevelId);
            
            if (subLevel && subLevel.xpReward) {
                await addXP(subLevel.xpReward, { exam: true });
            }
        }
    } else if (!passed) {
        console.log('[Exam Completion] Exam failed - no completion status saved');
    }
}

// Update progress display
async function updateProgressDisplay() {
    try {
        console.log('[Debug] Updating progress display...');
        const xp = await getTotalXP();
        const level = await getCurrentLevel();
        
        console.log('[Debug] Progress Update:', { xp, level });
        
        // Update UI elements
        ['totalXP', 'current-xp'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = xp;
            }
        });
        
        const levelElement = document.getElementById('current-level');
        if (levelElement) {
            levelElement.textContent = level;
        }
        
        // Update progress bars if they exist
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            const nextLevelXP = XP_SYSTEM.LEVELS[level + 1]?.requiredXP || XP_SYSTEM.LEVELS[level].requiredXP;
            const currentLevelXP = XP_SYSTEM.LEVELS[level].requiredXP;
            const progress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
            progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
        }
        
        // Update local storage
        localStorage.setItem('userXP', xp);
        localStorage.setItem('userLevel', level);
        
        return { xp, level };
    } catch (error) {
        console.error('[Error] Failed to update progress display:', error);
        showFeedback('Failed to update progress display', false);
    }
} 