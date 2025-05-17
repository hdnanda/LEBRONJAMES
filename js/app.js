// Main application logic for Financial Literacy App

// Ensure ConnectionHelper is available globally
(function ensureConnectionHelper() {
    if (!window.ConnectionHelper && typeof ConnectionHelper !== 'undefined') {
        console.log('[App] Making ConnectionHelper globally available');
        window.ConnectionHelper = ConnectionHelper;
    } else if (!window.ConnectionHelper) {
        console.warn('[App] ConnectionHelper not found, will attempt to load it');
        
        // Try to load script dynamically
        const script = document.createElement('script');
        script.src = 'js/connection_helper.js';
        script.onload = function() {
            console.log('[App] ConnectionHelper loaded successfully');
            if (typeof ConnectionHelper !== 'undefined' && !window.ConnectionHelper) {
                window.ConnectionHelper = ConnectionHelper;
            }
        };
        document.head.appendChild(script);
    }
})();

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

// Add isProcessingQuestion monitoring
(function setupFlagMonitoring() {
    console.log('[Debug] Setting up isProcessingQuestion flag monitoring');
    
    // Track when the flag was last set to true
    let flagSetTime = null;
    let flagSetLocation = null;
    
    // Override the isProcessingQuestion property with a tracked version
    let _isProcessingQuestion = false;
    Object.defineProperty(window, 'isProcessingQuestion', {
        get: function() {
            return _isProcessingQuestion;
        },
        set: function(value) {
            // Log every change to the flag with timestamp
            const timestamp = new Date().toISOString();
            const trace = new Error().stack;
            console.log(`[${timestamp}] isProcessingQuestion changed from ${_isProcessingQuestion} to ${value}`);
            
            if (value === true) {
                // Track when and where the flag was set to true
                flagSetTime = Date.now();
                flagSetLocation = trace;
                console.log('[FLAG-MONITOR] Flag set to TRUE at:', timestamp);
                console.log('[FLAG-MONITOR] Location:', trace);
            } else if (value === false && _isProcessingQuestion === true) {
                // Calculate how long the flag was true
                const duration = Date.now() - (flagSetTime || Date.now());
                console.log('[FLAG-MONITOR] Flag reset to FALSE after', duration, 'ms');
            }
            
            // Check for flag being true too long (potentially stuck)
            if (_isProcessingQuestion === true && flagSetTime) {
                const stuckDuration = Date.now() - flagSetTime;
                if (stuckDuration > 5000) { // 5 seconds threshold
                    console.error('[FLAG-MONITOR] WARNING! isProcessingQuestion has been TRUE for', stuckDuration, 'ms');
                    console.error('[FLAG-MONITOR] This may indicate the flag is stuck!');
                    console.error('[FLAG-MONITOR] Originally set at:', flagSetLocation);
                }
            }
            
            _isProcessingQuestion = value;
        }
    });
    
    // Set up a periodic check to detect if the flag is stuck
    setInterval(() => {
        if (_isProcessingQuestion === true && flagSetTime) {
            const stuckDuration = Date.now() - flagSetTime;
            if (stuckDuration > 10000) { // 10 seconds threshold
                console.error('[FLAG-MONITOR] CRITICAL! isProcessingQuestion has been TRUE for', stuckDuration/1000, 'seconds');
                console.error('[FLAG-MONITOR] Stack trace when flag was set:', flagSetLocation);
                console.error('[FLAG-MONITOR] This is almost certainly causing the unclickable options issue!');
                
                // Log what the user was doing
                console.error('[FLAG-MONITOR] Current question index:', currentQuestionIndex);
                console.error('[FLAG-MONITOR] Correct answers so far:', correctAnswers);
                
                // Optionally add visible UI indicator
                const appContainer = document.querySelector('.app-container');
                if (appContainer) {
                    const alertBox = document.createElement('div');
                    alertBox.style.position = 'fixed';
                    alertBox.style.top = '10px';
                    alertBox.style.left = '10px';
                    alertBox.style.background = 'red';
                    alertBox.style.color = 'white';
                    alertBox.style.padding = '10px';
                    alertBox.style.zIndex = '9999';
                    alertBox.textContent = `Debug: Flag stuck for ${Math.round(stuckDuration/1000)}s. Check console.`;
                    appContainer.appendChild(alertBox);
                }
            }
        }
    }, 2000);
})();

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

    // Debug: Log the questions object state
    console.log('DEBUG: window.questions state:', window.questions ? 'Exists' : 'Does not exist');
    if (window.questions) {
        console.log('DEBUG: window.questions type:', typeof window.questions);
        console.log('DEBUG: window.questions isArray:', Array.isArray(window.questions));
        console.log('DEBUG: Total questions loaded:', window.questions.length);
        console.log('DEBUG: First 5 questions:', window.questions.slice(0, 5).map(q => ({id: q.id, topic: q.topicId, sublevel: q.subLevelId})));
    }

    // Check if questions are loaded - add retry mechanism
    if (!window.questions || !Array.isArray(window.questions) || window.questions.length === 0) {
        console.error('Questions not loaded properly. window.questions:', window.questions);
        // Try to load questions.js again
        let script = document.createElement('script');
        script.src = 'js/questions.js';
        script.onload = function() {
            console.log('Questions.js loaded successfully via dynamic load');
            // Once questions are loaded, try again
            setTimeout(() => loadQuestionsForSubLevel(topicId, subLevelId), 500);
        };
        script.onerror = function() {
            console.error('Failed to load questions.js dynamically');
            questionText.textContent = "Error: Questions not loaded. Please refresh the page.";
        };
        document.head.appendChild(script);
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
    console.log('DEBUG: Matching question IDs:', availableQuestions.map(q => q.id).join(', '));
    
    // If not enough questions found, include questions from the same topic
    if (availableQuestions.length < questionsPerLesson) {
        console.log('Not enough specific questions, including topic questions');
        const topicQuestions = window.questions.filter(q => q.topicId === topicId);
        availableQuestions = [...new Set([...availableQuestions, ...topicQuestions])];
        console.log('Questions after including topic questions:', availableQuestions.length);
        console.log('DEBUG: Topic question IDs:', topicQuestions.map(q => q.id).join(', '));
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
    console.log('DEBUG: Selected question IDs:', currentQuestions.map(q => q.id).join(', '));
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
    console.log('DEBUG: DOMContentLoaded fired');
    
    // Initialize audio system silently
    if (window.AudioManager) {
        window.AudioManager.initialize();
    }
    
    // CRITICAL FIX: Add multiple safeguards to check if content is loaded
    const checkContentLoaded = () => {
        const questionText = document.getElementById('question-text');
        if (questionText && questionText.textContent.includes('Loading')) {
            console.log('DEBUG: Content still loading, triggering force check');
            forceCheckUIState();
        }
    };
    
    // Check multiple times to ensure content loads
    setTimeout(checkContentLoaded, 1000);
    setTimeout(checkContentLoaded, 2000);
    setTimeout(checkContentLoaded, 3000);
    setTimeout(checkContentLoaded, 5000);
    
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
    if (window.dailyStreakService) {
        window.dailyStreakService.initializeDailyStreak();
    }
    
    // Get parameters from URL
    const urlParams = new URLSearchParams(window.location.search);
    const topicId = parseInt(urlParams.get('topic'));
    const subLevelId = parseFloat(urlParams.get('sublevel'));
    
    if (topicId && subLevelId) {
        // Ensure topics.js is loaded before trying to access topic data
        if (!window.topicsData || !Array.isArray(window.topicsData) || window.topicsData.length === 0) {
            console.warn('Topics data not loaded yet, loading dynamically...');
            let topicsScript = document.createElement('script');
            topicsScript.src = 'js/topics.js';
            topicsScript.onload = function() {
                console.log('Topics.js loaded successfully via dynamic load');
                // Ensure questions.js is loaded too
                if (!window.questions || !Array.isArray(window.questions)) {
                    let questionsScript = document.createElement('script');
                    questionsScript.src = 'js/questions.js';
                    questionsScript.onload = function() {
                        console.log('Questions.js loaded successfully via dynamic load');
                        // Once both are loaded, proceed
                        setTimeout(() => loadQuestionsForSubLevel(topicId, subLevelId), 500);
                    };
                    document.head.appendChild(questionsScript);
                } else {
                    // If questions already loaded, just load questions for sublevel
                    loadQuestionsForSubLevel(topicId, subLevelId);
                }
            };
            document.head.appendChild(topicsScript);
        } else {
            // Load questions for the selected topic and sublevel
            loadQuestionsForSubLevel(topicId, subLevelId);
        }
    } else {
        // If no topic/sublevel specified, redirect back to levels.html
        window.location.href = 'levels.html';
    }

    // Initialize settings panel
    initializeSettingsPanel();
    
    // Add a fallback timer to force check UI state after 3 seconds
    setTimeout(forceCheckUIState, 3000);
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
        
        // CRITICAL FIX: Ensure clean state between questions
        isProcessingQuestion = false;
        
        // Reset any previous question state
        resetAnimations();
        
        // Debug: Log current questions array details
        console.log('DEBUG: Current questions array:', currentQuestions.map(q => ({
            id: q.id, 
            topic: q.topicId, 
            sublevel: q.subLevelId,
            question: q.question.substring(0, 20) + '...'
        })));
        
        // Check if we have questions
        if (!currentQuestions || !Array.isArray(currentQuestions) || currentQuestions.length === 0) {
            console.error('No questions available in currentQuestions array');
            // If we are on a specific topic/sublevel, try to reload them
            if (currentTopic && currentSubLevel) {
                console.log('Attempting to reload questions for topic/sublevel');
                loadQuestionsForSubLevel(currentTopic, currentSubLevel);
                return;
            } else {
                throw new Error('No questions available and cannot reload');
            }
        }
        
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
        
        // Get direct references to the DOM elements we need to update
        const questionText = document.getElementById('question-text');
        const optionsContainer = document.getElementById('options-container');
        const progressText = document.getElementById('progress-text');
        
        // Force-clear any loading texts
        if (questionText) {
            // Update question text with emoji (use original emoji if available)
            const emoji = question.emoji || '📈';
            questionText.innerHTML = `${emoji} ${question.question}`;
            console.log('DEBUG: Updated question text to:', questionText.textContent);
        } else {
            console.error('Question text element not found!');
        }
        
        // Clear previous options
        if (optionsContainer) {
            // CRITICAL FIX: Be more thorough in cleaning up before creating new options
            optionsContainer.innerHTML = '';
            
            // Create a copy of options and shuffle them
            const shuffledOptions = shuffleArray([...question.options]);
            
            // Find the new index of the correct answer after shuffling
            const correctAnswer = question.options[question.correctIndex];
            const newCorrectIndex = shuffledOptions.indexOf(correctAnswer);
            
            // CRITICAL FIX: Reliably track if the options have been created successfully
            let optionsCreated = 0;
            
            // Create and add new options
            shuffledOptions.forEach((option, index) => {
                try {
                    const button = document.createElement('button');
                    button.className = 'option-btn';
                    button.textContent = option;
                    
                    // CRITICAL FIX: Create a closure to capture the current index and correctIndex
                    const handleClick = (function(selectedIndex, correctIndex) {
                        return function() {
                            handleAnswer(selectedIndex, correctIndex);
                        };
                    })(index, newCorrectIndex);
                    
                    // Attach event listener
                    button.addEventListener('click', handleClick);
                    
                    // Mark as having a listener
                    button.setAttribute('data-has-listener', 'true');
                    button.setAttribute('data-option-index', index);
                    
                    // Store the handler function on the button element for potential reattachment
                    button._handleClick = handleClick;
                    
                    // Add to container
                    optionsContainer.appendChild(button);
                    optionsCreated++;
                } catch (error) {
                    console.error('Error creating option button:', error);
                }
            });
            
            console.log('DEBUG: Added', optionsCreated, 'option buttons');
            
            // CRITICAL FIX: Make sure options are visible
            optionsContainer.style.display = 'flex';
            optionsContainer.style.flexDirection = 'column';
            
            // CRITICAL FIX: Verify that options were created successfully
            if (optionsCreated !== shuffledOptions.length) {
                console.error(`Error: Created ${optionsCreated} options but expected ${shuffledOptions.length}`);
                // Try to recover
                setTimeout(() => {
                    if (optionsContainer.children.length < shuffledOptions.length) {
                        console.log('Attempting to recover missing options...');
                        loadQuestion(); // Reload the question
                    }
                }, 500);
            }
            
            // CRITICAL FIX: Double-check event listeners are attached
            setTimeout(() => {
                Array.from(optionsContainer.children).forEach(button => {
                    if (!button.getAttribute('data-has-listener')) {
                        console.warn('Found option without listener:', button.textContent);
                        
                        // Get the stored index
                        const index = parseInt(button.getAttribute('data-option-index'));
                        if (!isNaN(index)) {
                            // Reattach the listener
                            const handleClick = (function(selectedIndex, correctIndex) {
                                return function() {
                                    handleAnswer(selectedIndex, correctIndex);
                                };
                            })(index, newCorrectIndex);
                            
                            button.addEventListener('click', handleClick);
                            button.setAttribute('data-has-listener', 'true');
                            button._handleClick = handleClick;
                            
                            console.log('Reattached listener to option:', button.textContent);
                        }
                    }
                });
            }, 100);
        } else {
            console.error('Options container element not found!');
        }
        
        // Update progress
        if (progressText) {
            progressText.textContent = `${currentQuestionIndex + 1}/10 📊`;
        }
        
        // Reset processing flag
        isProcessingQuestion = false;
        
        // Hide any visible continue button from previous questions
        const continueBtn = document.getElementById('continue-btn');
        if (continueBtn) {
            continueBtn.style.display = 'none';
        }
        
        // Hide any visible feedback container
        const feedbackContainer = document.getElementById('feedback-container');
        if (feedbackContainer) {
            feedbackContainer.classList.add('hidden');
            feedbackContainer.classList.remove('visible');
        }
        
        // Animate new question appearance
        animateNewQuestion();
    } catch (error) {
        console.error('Error in loadQuestion:', error);
        const questionText = document.getElementById('question-text');
        if (questionText) {
            questionText.textContent = "Error loading questions. Please refresh the page.";
        }
        
        // Add a refresh button
        const optionsContainer = document.getElementById('options-container');
        if (optionsContainer) {
            optionsContainer.innerHTML = '';
            const refreshButton = document.createElement('button');
            refreshButton.className = 'option-btn refresh-btn';
            refreshButton.textContent = 'Refresh and Try Again';
            refreshButton.addEventListener('click', () => window.location.reload());
            optionsContainer.appendChild(refreshButton);
        }
        
        // Reset processing flag even on error
        isProcessingQuestion = false;
    }
}

/**
 * Handle user's answer selection
 * @param {number} selectedIndex - Index of the selected answer
 * @param {number} correctIndex - Index of the correct answer in the shuffled options
 */
async function handleAnswer(selectedIndex, correctIndex) {
    console.log('[Debug] handleAnswer called with selectedIndex:', selectedIndex, 'correctIndex:', correctIndex);
    console.log('[Debug] isProcessingQuestion before check:', isProcessingQuestion);
    
    if (isProcessingQuestion) {
        console.warn('[Debug] handleAnswer aborted: isProcessingQuestion is true');
        return;
    }
    
    console.log('[Debug] Setting isProcessingQuestion to true');
    isProcessingQuestion = true;
    
    // Create a timeout to ensure flag is reset even if there's an unexpected error
    const safetyTimeout = setTimeout(() => {
        if (isProcessingQuestion) {
            console.warn('[Debug] Safety timeout triggered! Forcing isProcessingQuestion to false');
            isProcessingQuestion = false;
        }
    }, 3000); // 3 second safety valve
    
    try {
        const isCorrect = selectedIndex === correctIndex;
        const selectedButton = optionsContainer.children[selectedIndex];
        const currentQuestion = currentQuestions[currentQuestionIndex];
        
        if (isCorrect) {
            correctAnswers++;
            window.animateCorrectFeedback(selectedButton);
            
            // Calculate and award XP immediately for correct answer
            try {
                // Use a timeout to prevent network call from blocking UI
                setTimeout(async () => {
                    try {
                        const currentLevel = await getCurrentLevel();
                        const baseXP = XP_SYSTEM.LEVELS[currentLevel].baseXP;
                        const bonuses = {
                            streak: correctAnswers >= 3,
                            speed: currentQuestion.timeToAnswer && currentQuestion.timeToAnswer < 10
                        };
                        
                        // Award XP in background, don't await here to prevent UI blocking
                        addXP(baseXP, bonuses).then(earnedXP => {
                            console.log('[Debug] XP awarded successfully:', earnedXP);
                        }).catch(error => {
                            console.error('[Error] Failed to award XP:', error);
                        });
                
                // Update streak through dailyStreakService
                if (window.dailyStreakService) {
                    window.dailyStreakService.checkAndGiveReward();
                            // Use the new function to update the streak for correct answers
                            if (typeof window.dailyStreakService.handleStreakUpdate === 'function') {
                                window.dailyStreakService.handleStreakUpdate(true);
                            }
                }
            } catch (error) {
                        console.error('[Error] Error in XP processing:', error);
            }
                }, 100);
            
            // Check if this completes an exam in a non-blocking way
            if (window.currentLevelData?.isExam && currentQuestionIndex === questionsPerLesson - 1) {
                const passThreshold = 0.8; // 80% correct to pass
                const progress = correctAnswers / questionsPerLesson;
                const passed = progress >= passThreshold;
                console.log(`[Debug] Exam completed. Progress: ${progress}, Passed: ${passed}`);
                
                // Don't await here, handle exam completion in background
                setTimeout(() => {
                    handleExamCompletion(passed).catch(error => {
                        console.error('[Error] Failed to handle exam completion:', error);
                    });
                }, 200);
                }
            } catch (error) {
                console.error('[Error] Failed to initiate XP award:', error);
            }
        } else {
            window.animateIncorrectFeedback(selectedButton);
            const correctButton = optionsContainer.children[correctIndex];
            correctButton.classList.add('correct');
            
            // Handle exam mode if active (don't block UI thread)
            if (window.examManager && window.examManager.isExamActive) {
                setTimeout(() => {
                    window.examManager.handleWrongAnswer();
                }, 0);
            }
            
            // Update streak for incorrect answers in daily streak service
            if (window.dailyStreakService && typeof window.dailyStreakService.handleStreakUpdate === 'function') {
                window.dailyStreakService.handleStreakUpdate(false);
            }
        }
        
        // Disable all options after selection
        Array.from(optionsContainer.children).forEach(button => {
            button.disabled = true;
            // Important: Remove the data-has-listener attribute once disabled
            button.removeAttribute('data-has-listener');
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
            
            // CRITICAL FIX: Make sure we set onclick handler freshly each time
            continueBtn.onclick = function() {
                handleContinue();
            };
        }
        
        // Update progress without blocking
        setTimeout(() => {
            updateProgress();
        }, 0);
        
    } catch (error) {
        console.error('[Error] Error in handleAnswer:', error);
        // On error, make sure we re-enable option clicking
        Array.from(optionsContainer.children).forEach(button => {
            button.disabled = false;
        });
    } finally {
        // ALWAYS reset the flag, even if errors occur
        console.log('[Debug] Resetting isProcessingQuestion to false');
        isProcessingQuestion = false;
        clearTimeout(safetyTimeout);
    }
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
    
    // CRITICAL FIX: Ensure flags and state are reset before moving on
    isProcessingQuestion = false;
    
    // Hide the continue button properly
    const continueBtn = document.getElementById('continue-btn');
    if (continueBtn) {
        continueBtn.style.display = 'none';
        continueBtn.style.opacity = '0';
        continueBtn.style.pointerEvents = 'none';
    }
    
    // Ensure feedback is hidden
    const feedbackContainer = document.getElementById('feedback-container');
    if (feedbackContainer) {
        feedbackContainer.classList.add('hidden');
        feedbackContainer.classList.remove('visible');
    }
    
    // Reset all option buttons
    const optionsContainer = document.getElementById('options-container');
    if (optionsContainer) {
        Array.from(optionsContainer.children).forEach(button => {
            button.disabled = false;
            button.classList.remove('correct', 'incorrect');
        });
    }
    
    currentQuestionIndex++;
    console.log('New question index after increment:', currentQuestionIndex);
    
    if (currentQuestionIndex < questionsPerLesson) {
        console.log('Loading next question...');
        resetAnimations();
        
        // CRITICAL FIX: Small delay before loading the next question 
        // to ensure DOM is ready
        setTimeout(() => {
            loadQuestion();
        }, 50);
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
    if (window.dailyStreakService) {
        window.dailyStreakService.correctAnswerStreak = 0;
        window.dailyStreakService.updateStreakDisplay();
        window.dailyStreakService.saveStreakData();
    }
    
    // Show completion message with enhanced animation
    const feedbackContainer = document.getElementById('feedback-container');
    const feedbackText = document.getElementById('feedback-text');
    const continueBtn = document.getElementById('continue-btn');
    
    if (!feedbackContainer || !feedbackText || !continueBtn) {
        console.error('Required elements not found for completion message!');
        // As a fallback, redirect to levels page
        setTimeout(() => {
            window.location.href = 'levels.html';
        }, 2000);
        return;
    }
    
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
            // Add bonus XP for completing exam
            addXP(20, { exam: true });
            
            // Check if we should trigger the exam completion handler
            if (window.currentLevelData && window.currentLevelData.isExam) {
                console.log('[showCompletionMessage] Exam passed, explicitly triggering handleExamCompletion');
                handleExamCompletion(true);
            }
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
    
    // CRITICAL FIX: Ensure the continue button is fully visible and functional
    continueBtn.textContent = "Return to Levels 🏠";
    continueBtn.style.display = 'inline-block';
    continueBtn.style.opacity = '1';
    continueBtn.style.visibility = 'visible';
    continueBtn.style.pointerEvents = 'auto';
    
    // Show the completion message with animation
    requestAnimationFrame(() => {
        feedbackContainer.classList.remove('hidden');
        // Force a reflow
        void feedbackContainer.offsetWidth;
        feedbackContainer.classList.add('visible');
        
        // CRITICAL FIX: Make sure completion container is absolutely visible
        feedbackContainer.style.display = 'flex';
        feedbackContainer.style.flexDirection = 'column';
        feedbackContainer.style.alignItems = 'center';
        feedbackContainer.style.justifyContent = 'center';
        feedbackContainer.style.zIndex = '100';
        feedbackContainer.style.pointerEvents = 'auto';
    });
    
    // Update continue button to return to levels.html
    continueBtn.onclick = function() {
        // Get the latest XP before redirecting
        getTotalXP().then(currentXP => {
            console.log('[Debug] Final XP before redirect:', currentXP);
            localStorage.setItem('lastEarnedXP', currentXP);
            
            // Add a fade-out animation before redirecting
            feedbackContainer.style.transition = 'all 0.5s ease';
            feedbackContainer.style.opacity = '0';
            feedbackContainer.style.transform = 'translate(-50%, -50%) scale(0.8)';
            
            // Redirect after animation completes
            setTimeout(() => {
                window.location.href = 'levels.html';
            }, 500);
        }).catch(error => {
            console.error('[Error] Failed to get total XP before redirect:', error);
            // Redirect anyway after a short delay
            setTimeout(() => {
                window.location.href = 'levels.html';
            }, 500);
        });
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
        if (window.levelSystem && typeof window.levelSystem.initializeLevelInterface === 'function') {
            window.levelSystem.initializeLevelInterface();
        }

        // Reset streak and ensure display is updated when starting new level
        if (window.dailyStreakService) {
            window.dailyStreakService.correctAnswerStreak = 0;
            window.dailyStreakService.updateStreakDisplay();
            window.dailyStreakService.saveStreakData();
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
                button.setAttribute('data-has-listener', 'true'); // Mark as having a listener
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
        
        // Initialize streak through dailyStreakService if available
        if (window.dailyStreakService) {
            window.dailyStreakService.initializeDailyStreak();
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
        
        // Use ConnectionHelper to get XP directly from the server
        if (window.ConnectionHelper) {
            const result = await window.ConnectionHelper.getUserXP();
            console.log('[Debug] XP Response Data:', result);
            
            if (result && result.success && typeof result.xp !== 'undefined') {
                // Update all XP displays
                ['totalXP', 'current-xp'].forEach(id => {
                    const element = document.getElementById(id);
                    if (element) {
                        element.textContent = result.xp;
                    }
                });
                
                return result.xp;
            }
        }
        
        // Fallback if ConnectionHelper isn't available or failed
        console.warn('[Debug] Failed to get XP from ConnectionHelper');
        return 0;
    } catch (error) {
        console.error('[Error] Failed to fetch XP:', error);
        return 0;
    }
}

// Add XP with bonuses through backend API
async function addXP(baseAmount, bonuses = {}) {
    try {
        console.log('[Debug] Adding XP - Base Amount:', baseAmount, 'Bonuses:', bonuses);
        
        // Ensure ConnectionHelper is available
        if (!window.ConnectionHelper && typeof ConnectionHelper !== 'undefined') {
            console.log('[Debug] Making ConnectionHelper globally available in addXP');
            window.ConnectionHelper = ConnectionHelper;
        }
        
        const currentLevel = await getCurrentLevel();
        const levelMultiplier = 1 + (currentLevel - 1) * 0.1; // 10% increase per level
        
        let earnedXP = baseAmount * levelMultiplier;
        
        // Apply bonuses
        if (bonuses.streak) earnedXP += XP_SYSTEM.BONUSES.STREAK;
        if (bonuses.speed) earnedXP += XP_SYSTEM.BONUSES.SPEED;
        if (bonuses.exam) earnedXP *= 1.5; // 50% bonus for exams
        
        // Round XP to nearest integer
        earnedXP = Math.round(earnedXP);
        
        console.log('[Debug] XP Calculation:', {
            earned: earnedXP,
            level: currentLevel
        });
        
        // Get current XP from server
        const currentTotalXP = await getTotalXP();
        const newTotalXP = currentTotalXP + earnedXP;
        
        // Update all XP displays immediately for responsiveness
        ['totalXP', 'current-xp'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = newTotalXP;
            }
        });
        
        // Show XP gain notification
        showXPNotification(earnedXP);
        
        // Update server through ConnectionHelper
        if (window.ConnectionHelper) {
            try {
                const result = await window.ConnectionHelper.updateXP(newTotalXP);
                console.log('[Debug] Server update result:', result);
                
                // If server returned a different XP value, update displays again
                if (result && result.success && typeof result.xp !== 'undefined' && result.xp !== newTotalXP) {
                    console.log('[Debug] Server returned different XP:', result.xp);
                    
                    // Update displays with server value
                    ['totalXP', 'current-xp'].forEach(id => {
                        const element = document.getElementById(id);
                        if (element) {
                            element.textContent = result.xp;
                        }
                    });
                }
            } catch (error) {
                console.warn('[Debug] Server update failed:', error);
            }
        } else {
            console.error('[Debug] ConnectionHelper not available');
        }
        
        return earnedXP;
    } catch (error) {
        console.error('[Error] Error in addXP:', error);
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
    // Function kept empty to maintain code compatibility
    // Notification display has been removed as requested
    console.log(`XP gained: +${amount} XP`);
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
            
            // Explicitly mark the level as completed to trigger topic unlocking
            if (window.markLevelCompleted) {
                // Create current level object for markLevelCompleted
                const examLevel = {
                    topicId: topicId,
                    subLevelId: subLevelId
                };
                
                // Mark exam as completed - this ensures it's saved in completedLevels
                const marked = window.markLevelCompleted(examLevel, true);
                console.log(`[Exam Completion] Exam marked as completed in completedLevels: ${marked ? 'Success' : 'Already completed'}`);
                
                // Double check if the level is actually marked as completed
                // This is to debug the issue with topics not unlocking
                if (window.isLevelCompleted) {
                    const isCompleted = window.isLevelCompleted(topicId, subLevelId);
                    console.log(`[Exam Completion] Double check - isLevelCompleted: ${isCompleted}`);
                }
            } else {
                console.warn('[Exam Completion] markLevelCompleted function not available');
                
                // Emergency fallback - directly add to completedLevels
                try {
                    const completedLevels = JSON.parse(localStorage.getItem('completedLevels') || '[]');
                    const alreadyCompleted = completedLevels.some(level => 
                        parseInt(level.topicId) === parseInt(topicId) && 
                        parseFloat(level.subLevelId) === parseFloat(subLevelId)
                    );
                    
                    if (!alreadyCompleted) {
                        completedLevels.push({
                            topicId: parseInt(topicId),
                            subLevelId: parseFloat(subLevelId),
                            timestamp: new Date().getTime()
                        });
                        
                        localStorage.setItem('completedLevels', JSON.stringify(completedLevels));
                        console.log(`[Exam Completion] Emergency fallback - added to completedLevels`);
                    } else {
                        console.log(`[Exam Completion] Already in completedLevels`);
                    }
                } catch (error) {
                    console.error('[Exam Completion] Emergency fallback failed:', error);
                }
            }
            
            // Save exam completion to localStorage
            const completedExams = JSON.parse(localStorage.getItem('completedExams') || '[]');
            const examData = {
                topicId: parseInt(topicId),
                subLevelId: parseFloat(subLevelId),
                timestamp: new Date().getTime(),
                score: score
            };
            
            const alreadyInExams = completedExams.some(exam => 
                exam && exam.topicId === examData.topicId && exam.subLevelId === examData.subLevelId
            );
            
            if (!alreadyInExams) {
                completedExams.push(examData);
                localStorage.setItem('completedExams', JSON.stringify(completedExams));
                console.log('[Exam Completion] Saved exam to completedExams storage:', examData);
            } else {
                console.log('[Exam Completion] Exam already in completedExams');
            }
            
            // Save to server if ConnectionHelper is available
            if (window.ConnectionHelper && typeof window.ConnectionHelper.updateXP === 'function') {
                // Get current XP and completed levels
                const currentXp = await getTotalXP();
                const completedLevels = JSON.parse(localStorage.getItem('completedLevels') || '[]');
                
                // Send data to server
                try {
                    const result = await window.ConnectionHelper.updateXP(currentXp, completedLevels, completedExams);
                    console.log('[Exam Completion] Saved exam completion to server:', result);
                } catch (error) {
                    console.error('[Exam Completion] Failed to save exam completion to server:', error);
                }
            }
            
            // Update XP
            const topic = window.topicsData.find(t => t.id === topicId);
            const subLevel = topic?.subLevels.find(s => s.id === subLevelId);
            
            if (subLevel && subLevel.xpReward) {
                await addXP(subLevel.xpReward, { exam: true });
            }
            
            // DEBUG: Alert user about exam completion status
            alert(`Exam for Topic ${topicId} completed successfully! You should now be able to access the next topic.`);
        }
    } else if (!passed) {
        console.log('[Exam Completion] Exam failed - no completion status saved');
    }
}

// Update progress display
async function updateProgressDisplay() {
    try {
        console.log('[Debug] Updating progress display...');
        
        // Get XP and level using our standard functions
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
        
        return { xp, level };
    } catch (error) {
        console.error('[Error] Failed to update progress display:', error);
        showFeedback('Failed to update progress display', false);
    }
}

// Function to force check and fix UI state if stuck on loading
function forceCheckUIState() {
    console.log('DEBUG: Force checking UI state');
    
    // If we have questions but still showing loading screen, fix it
    if (window.questions && window.questions.length > 0) {
        // Target the actual loading text elements directly
        const questionText = document.getElementById('question-text');
        if (questionText && (questionText.textContent.includes('Loading') || questionText.textContent.trim() === '')) {
            console.log('DEBUG: Question text still shows loading, forcing update');
            
            // If we have current questions loaded but loading text still shows, force display the first question
            if (currentQuestions && currentQuestions.length > 0) {
                const question = currentQuestions[0];
                if (question) {
                    // Update question text directly
                    const emoji = question.emoji || '📈';
                    questionText.textContent = `${emoji} ${question.question}`;
                    console.log('DEBUG: Forced question text update to:', questionText.textContent);
                    
                    // Clear and update options
                    const optionsContainer = document.getElementById('options-container');
                    if (optionsContainer) {
                        // Clear any existing content
                        optionsContainer.innerHTML = '';
                        
                        // Add options
                        if (question.options && Array.isArray(question.options)) {
                            question.options.forEach((option, index) => {
                                const button = document.createElement('button');
                                button.className = 'option-btn';
                                button.textContent = option;
                                button.addEventListener('click', () => handleAnswer(index, question.correctIndex));
                                optionsContainer.appendChild(button);
                            });
                        }
                        
                        // Update progress text
                        const progressText = document.getElementById('progress-text');
                        if (progressText) {
                            progressText.textContent = `1/10 📊`;
                        }
                    }
                }
            } else if (currentTopic && currentSubLevel) {
                // If we have topic and sublevel but no questions loaded, try loading again
                console.log('DEBUG: Force reloading questions');
                loadQuestionsForSubLevel(currentTopic, currentSubLevel);
            }
        }
    }
    
    // Check again in 2 seconds if we still see loading
    setTimeout(() => {
        const questionText = document.getElementById('question-text');
        if (questionText && questionText.textContent.includes('Loading')) {
            console.log('DEBUG: Still showing loading, trying again');
            forceCheckUIState();
        }
    }, 2000);
}

// Network status monitoring and XP sync functionality
(function setupXPSync() {
    let isOnline = navigator.onLine;
    
    async function syncXPWithServer() {
        if (!isOnline) {
            console.log('[Debug] Cannot sync XP while offline');
            return;
        }
        
        try {
            console.log('[Debug] XP sync in progress...');
            
            if (window.ConnectionHelper) {
                // Get XP from backend through ConnectionHelper
                const result = await window.ConnectionHelper.getUserXP();
                console.log('[Debug] XP Sync result:', result);
                
                if (result && result.success) {
                    // XP Synced notification removed
                }
            } else {
                console.warn('[Debug] ConnectionHelper not available for XP sync');
            }
        } catch (error) {
            console.error('[Error] XP Sync error:', error);
        }
    }
    
    // XP Sync notification function removed
    
    // Check for XP on page load
    document.addEventListener('DOMContentLoaded', () => {
        // Update XP display from backend
        getTotalXP();
        
        // Try syncing after a short delay
        setTimeout(syncXPWithServer, 1000);
    });
    
    // Add event listeners for online/offline events
    window.addEventListener('online', () => {
        console.log('[Debug] Network connection restored');
        isOnline = true;
        syncXPWithServer();
    });
    
    window.addEventListener('offline', () => {
        console.log('[Debug] Network connection lost');
        isOnline = false;
    });
})();

// Direct monitoring system - simpler approach
(function() {
    console.log('%c[FLAG-MONITOR] Installing direct flag monitor', 'color: blue; font-weight: bold');
    
    // Keep track of flag state
    let lastKnownState = window.isProcessingQuestion || false;
    let stuckSince = null;
    let monitorStartTime = Date.now();
    
    // Add visible monitor element
    const monitorEl = document.createElement('div');
    monitorEl.style.position = 'fixed';
    monitorEl.style.bottom = '10px';
    monitorEl.style.left = '10px';
    monitorEl.style.background = 'rgba(0,0,0,0.8)';
    monitorEl.style.color = 'white';
    monitorEl.style.padding = '8px';
    monitorEl.style.borderRadius = '4px';
    monitorEl.style.fontSize = '12px';
    monitorEl.style.zIndex = '99999';
    monitorEl.textContent = 'Flag Monitor: Starting...';
    
    // Add the monitor once DOM is ready
    function addMonitor() {
        // Flag monitor has been removed
    }
    
    // Update monitor every 2 seconds
    setInterval(function() {
        // Read the current flag state directly
        const currentState = window.isProcessingQuestion;
        
        // Skip checks until the app has initialized
        if (Date.now() - monitorStartTime < 5000) {
            monitorEl.textContent = `Flag Monitor: Initializing...`;
            return;
        }
        
        // Check if state changed
        if (currentState !== lastKnownState) {
            console.log(`%c[FLAG-MONITOR] Flag changed: ${lastKnownState} → ${currentState}`, 
                        'color: ' + (currentState ? 'red' : 'green'));
            
            if (currentState === true) {
                // Flag just turned true
                stuckSince = Date.now();
            } else {
                // Flag just turned false
                stuckSince = null;
            }
            
            lastKnownState = currentState;
        }
        
        // Check for stuck state
        if (currentState === true && stuckSince) {
            const stuckDuration = Math.round((Date.now() - stuckSince) / 1000);
            monitorEl.textContent = `isProcessingQuestion: TRUE for ${stuckDuration}s`;
            monitorEl.style.background = stuckDuration > 5 ? 'rgba(255,0,0,0.8)' : 'rgba(255,165,0,0.8)';
            
            // Log warnings at specific thresholds
            if (stuckDuration === 5) {
                console.warn('%c[FLAG-MONITOR] WARNING: Flag has been TRUE for 5 seconds', 'color: orange; font-weight: bold');
                console.warn('Current question index:', currentQuestionIndex);
            }
            
            if (stuckDuration === 10) {
                console.error('%c[FLAG-MONITOR] CRITICAL: Flag stuck in TRUE state for 10 seconds', 'color: red; font-size: 16px; font-weight: bold');
                console.error('This is preventing option clicks! Current question:', currentQuestionIndex);
                
                // Create stack trace snapshot
                console.error('Current stack:', new Error().stack);
                
                // Force snapshot of app state
                console.table({
                    'Current Question': currentQuestionIndex + 1,
                    'Total Questions': questionsPerLesson,
                    'Correct Answers': correctAnswers,
                    'Processing Flag': currentState,
                    'Stuck Duration': stuckDuration + 's',
                    'Options Disabled': document.querySelector('.option-btn')?.disabled || 'unknown'
                });
            }
        } else {
            // Flag is false or just set
            monitorEl.textContent = `isProcessingQuestion: ${currentState ? 'TRUE' : 'FALSE'}`;
            monitorEl.style.background = currentState ? 'rgba(255,165,0,0.8)' : 'rgba(0,128,0,0.8)';
        }
    }, 1000);
    
    // Patch handleAnswer to add try-finally
    const originalHandleAnswer = window.handleAnswer || handleAnswer;
    
    function patchedHandleAnswer(...args) {
        console.log('%c[FLAG-MONITOR] handleAnswer called', 'color: blue');
        
        try {
            return originalHandleAnswer.apply(this, args);
        } catch (error) {
            console.error('[FLAG-MONITOR] Error in handleAnswer:', error);
            throw error;
        } finally {
            // Force flag reset
            console.log('%c[FLAG-MONITOR] Forcing flag reset in finally block', 'color: orange');
            setTimeout(() => {
                window.isProcessingQuestion = false;
            }, 100);
        }
    }
    
    // Apply the patch if possible
    if (window.handleAnswer) {
        window.handleAnswer = patchedHandleAnswer;
        console.log('%c[FLAG-MONITOR] Successfully patched global handleAnswer', 'color: green');
    } else if (typeof handleAnswer === 'function') {
        window.handleAnswer = handleAnswer = patchedHandleAnswer;
        console.log('%c[FLAG-MONITOR] Successfully patched local handleAnswer', 'color: green');
    } else {
        console.warn('%c[FLAG-MONITOR] Could not patch handleAnswer - not found', 'color: red');
    }
    
    console.log('%c[FLAG-MONITOR] Direct monitoring system installed successfully', 'color: blue; font-weight: bold');
})();

/* CRITICAL FIX: Monitor for unclickable options issue */
(function addOptionDiagnostics() {
    console.log('Setting up option diagnostic system...');
    // Check for and fix option issues periodically
    setInterval(() => {
        // If we're in a quiz with options
        const optionsContainer = document.getElementById('options-container');
        if (optionsContainer && !isProcessingQuestion) {
            const options = optionsContainer.querySelectorAll('.option-btn');
            if (options.length > 0) {
                // Check if options are properly clickable
                let allHaveListeners = true;
                options.forEach(option => {
                    // If the option isn't disabled (meaning it should be clickable)
                    if (!option.disabled) {
                        // Test if it has any click listeners by checking a custom attribute we'll set
                        if (!option.getAttribute('data-has-listener')) {
                            allHaveListeners = false;
                            console.warn('⚠️ Found option without click listener:', option.textContent);
                        }
                    }
                });
                
                // If we found options without listeners, fix them
                if (!allHaveListeners) {
                    console.log('🔧 Fixing unclickable options...');
                    reattachOptionHandlers();
                }
            }
        }
    }, 1000); // Check every second
    
    // Function to reattach event handlers to options
    function reattachOptionHandlers() {
        const optionsContainer = document.getElementById('options-container');
        if (!optionsContainer) return;
        
        const options = optionsContainer.querySelectorAll('.option-btn:not([disabled])');
        if (options.length === 0) return;
        
        // Get the current question to determine correct answer
        const question = currentQuestions[currentQuestionIndex];
        if (!question) return;
        
        // Try to identify the correct option
        let correctOptionText = '';
        let correctOptionIndex = -1;
        
        // First, check if we can identify the correct option
        options.forEach((option, index) => {
            if (option.classList.contains('correct')) {
                correctOptionIndex = index;
                correctOptionText = option.textContent;
            }
        });
        
        // If we couldn't identify it from the UI, try to get it from the question data
        if (correctOptionIndex === -1 && question.options && question.correctIndex !== undefined) {
            correctOptionText = question.options[question.correctIndex];
            
            // Now find this text in our current options
            options.forEach((option, index) => {
                if (option.textContent === correctOptionText) {
                    correctOptionIndex = index;
                }
            });
        }
        
        // Now reattach click handlers to all options
        options.forEach((option, index) => {
            // Remove existing listeners to avoid duplication
            const newOption = option.cloneNode(true);
            option.parentNode.replaceChild(newOption, option);
            
            // Add the new click listener
            newOption.addEventListener('click', () => handleAnswer(index, correctOptionIndex));
            
            // Mark this option as having a listener
            newOption.setAttribute('data-has-listener', 'true');
            console.log(`🔄 Reattached click handler to option: ${newOption.textContent}`);
        });
        
        console.log('✅ Fixed unclickable options!');
    }
})();

// Remove the "Fix Quiz" debug button
function initializeUI() {
    // ... existing code ...
    
    // Recovery button has been removed for production
    
    // ... existing code ...
}

// ... existing code ...
function checkForStuckState() {
    // ... existing code ...
    
    // Fix Quiz button display has been removed

    // ... existing code ...
}
// ... existing code ... 
