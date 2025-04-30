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
    if (window.streakService) {
        window.streakService.initializeStreaks();
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
                    } catch (error) {
                        console.error('[Error] Error in XP processing:', error);
                    }
                }, 100);
                
                // Update streak through streak service
                if (window.streakService && typeof window.streakService.handleStreakUpdate === 'function') {
                    window.streakService.handleStreakUpdate(true);
                }
            } catch (error) {
                console.error('[Error] Failed to initiate XP award:', error);
            }
            
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
            
            // Update streak through streak service for incorrect answer
            if (window.streakService && typeof window.streakService.handleStreakUpdate === 'function') {
                window.streakService.handleStreakUpdate(false);
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
    if (window.streakService && typeof window.streakService.handleStreakUpdate === 'function') {
        window.streakService.questionStreak = 0;
        window.streakService.updateStreakDisplay();
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
        
        // First check if we're online - if not, use localStorage immediately
        if (!navigator.onLine) {
            console.log('[Debug] Offline mode detected, using localStorage');
            return parseInt(localStorage.getItem('userXP')) || 0;
        }
        
        // Try to fetch from backend - use the Render backend URL
        const response = await fetch('https://financial-backend1.onrender.com/backend/xp_handler.php', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            },
            // Add a timeout to prevent long waiting
            signal: AbortSignal.timeout(3000)
        }).catch(error => {
            console.warn('[Debug] Fetch error:', error);
            return { ok: false, status: 'network-error' };
        });
        
        console.log('[Debug] XP Response Status:', response.status);
        
        if (!response.ok) {
            console.warn(`[Debug] HTTP error! status: ${response.status}, using localStorage fallback`);
            // Use localStorage as fallback
            return parseInt(localStorage.getItem('userXP')) || 0;
        }
        
        // Try to parse JSON response
        let data;
        try {
            data = await response.json();
            console.log('[Debug] XP Response Data:', data);
        } catch (parseError) {
            console.error('[Error] Failed to parse XP response:', parseError);
            // Use localStorage as fallback if JSON parsing fails
            return parseInt(localStorage.getItem('userXP')) || 0;
        }
        
        if (!data.success) {
            console.warn('[Debug] Backend reported failure:', data.error || 'Unknown error');
            return parseInt(localStorage.getItem('userXP')) || 0;
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

// Add XP with bonuses through backend API with improved local fallback
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
        
        // Get current total XP (this already uses localStorage fallback if needed)
        const currentTotalXP = await getTotalXP();
        const newTotalXP = currentTotalXP + earnedXP;
        
        console.log('[Debug] XP Calculation:', {
            currentXP: currentTotalXP,
            earned: earnedXP,
            newTotal: newTotalXP,
            level: currentLevel
        });
        
        // Always update localStorage immediately for reliability
        localStorage.setItem('userXP', newTotalXP);
        localStorage.setItem('pendingXpSync', 'true');
        
        // Update all XP displays immediately
        ['totalXP', 'current-xp'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = newTotalXP;
            }
        });
        
        // Show XP gain notification
        showXPNotification(earnedXP);
        
        // Update progress display (but make it non-blocking)
        setTimeout(() => {
            updateProgressDisplay().catch(error => {
                console.warn('[Debug] Progress display update failed:', error);
            });
        }, 0);
        
        // Only try server update if we're online, but make it non-blocking
        if (navigator.onLine) {
            // Use Promise.race with a timeout to avoid blocking on API call
            Promise.race([
                fetch('https://financial-backend1.onrender.com/backend/xp_handler.php', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ xp: newTotalXP })
                }),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('XP update timeout')), 2000)
                )
            ]).then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Server response not OK');
            }).then(data => {
                console.log('[Debug] XP Update Response:', data);
                localStorage.removeItem('pendingXpSync');
            }).catch(error => {
                console.warn('[Debug] Server update failed (but XP stored locally):', error);
                // Mark for later sync
                localStorage.setItem('pendingXpSync', 'true');
            });
        } else {
            console.log('[Debug] Offline mode detected, skipping server update');
            localStorage.setItem('pendingXpSync', 'true');
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
    // Create a variable to track online status
    let isOnline = navigator.onLine;
    console.log('[Debug] Initial network status:', isOnline ? 'Online' : 'Offline');
    
    // Function to attempt syncing XP with server when connection is restored
    async function syncXPWithServer() {
        if (!navigator.onLine) return;
        
        // Check if we have pending sync
        const pendingSync = localStorage.getItem('pendingXpSync') === 'true';
        
        if (!pendingSync) {
            console.log('[Debug] No pending XP sync needed');
            return;
        }
        
        try {
            console.log('[Debug] Attempting to sync XP with server');
            
            // Get local XP
            const localXP = parseInt(localStorage.getItem('userXP')) || 0;
            
            // Send XP update to backend - use the Render backend URL
            const response = await fetch('https://financial-backend1.onrender.com/backend/xp_handler.php', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ xp: localXP }),
                signal: AbortSignal.timeout(5000)
            }).catch(error => {
                console.warn('[Debug] XP Sync failed:', error);
                return { ok: false };
            });
            
            if (response.ok) {
                console.log('[Debug] XP Sync successful');
                localStorage.removeItem('pendingXpSync');
                
                // Optional: Show a small notification
                const syncNotification = document.createElement('div');
                syncNotification.className = 'xp-notification';
                syncNotification.innerHTML = `XP Synced ✓`;
                syncNotification.style.backgroundColor = '#4CAF50';
                document.body.appendChild(syncNotification);
                
                setTimeout(() => {
                    syncNotification.classList.add('fade-out');
                    setTimeout(() => syncNotification.remove(), 500);
                }, 1500);
            }
        } catch (error) {
            console.error('[Error] XP Sync error:', error);
        }
    }
    
    // Check for local XP on page load
    document.addEventListener('DOMContentLoaded', () => {
        // Update XP display from localStorage
        const xp = localStorage.getItem('userXP') || 0;
        
        ['totalXP', 'current-xp'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = xp;
            }
        });
        
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
    
    // Try to sync every 5 minutes if we're online and have pending sync
    setInterval(() => {
        if (isOnline && localStorage.getItem('pendingXpSync') === 'true') {
            syncXPWithServer();
        }
    }, 300000); // 5 minutes
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
        if (document.body) {
            document.body.appendChild(monitorEl);
            console.log('%c[FLAG-MONITOR] Added visible monitor to page', 'color: green');
        } else {
            setTimeout(addMonitor, 100);
        }
    }
    addMonitor();
    
    // Add direct reset button 
    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'Reset Flag';
    resetBtn.style.marginLeft = '8px';
    resetBtn.style.padding = '4px 8px';
    resetBtn.style.background = 'red';
    resetBtn.style.color = 'white';
    resetBtn.style.border = 'none';
    resetBtn.style.borderRadius = '4px';
    resetBtn.style.cursor = 'pointer';
    resetBtn.onclick = function() {
        console.log('%c[FLAG-MONITOR] Manual flag reset triggered', 'color: red; font-weight: bold');
        window.isProcessingQuestion = false;
        alert('Flag reset to FALSE. Try answering a question now.');
    };
    monitorEl.appendChild(resetBtn);
    
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

// Add recovery button
function addRecoveryButton() {
    const app = document.querySelector('.app-container');
    if (!app) return;
    
    // Create recovery button if it doesn't exist
    if (!document.getElementById('recovery-btn')) {
        const recoveryBtn = document.createElement('button');
        recoveryBtn.id = 'recovery-btn';
        recoveryBtn.className = 'recovery-btn';
        recoveryBtn.textContent = '🔧 Fix Quiz';
        recoveryBtn.style.position = 'fixed';
        recoveryBtn.style.bottom = '10px';
        recoveryBtn.style.right = '10px';
        recoveryBtn.style.zIndex = '9999';
        recoveryBtn.style.padding = '8px 12px';
        recoveryBtn.style.borderRadius = '20px';
        recoveryBtn.style.backgroundColor = '#ff9800';
        recoveryBtn.style.color = 'white';
        recoveryBtn.style.display = 'none';
        recoveryBtn.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
        
        recoveryBtn.addEventListener('click', () => {
            console.log('🔧 Manual recovery triggered');
            isProcessingQuestion = false;
            const optionsContainer = document.getElementById('options-container');
            if (optionsContainer) {
                Array.from(optionsContainer.children).forEach(button => {
                    button.disabled = false;
                });
            }
            // Reload the current question
            loadQuestion();
            // Hide the button after use
            recoveryBtn.style.display = 'none';
        });
        
        app.appendChild(recoveryBtn);
        
        // Show the button after 5 seconds of inactivity
        setInterval(() => {
            const optionsContainer = document.getElementById('options-container');
            if (optionsContainer && document.querySelectorAll('.option-btn').length > 0 && !isProcessingQuestion) {
                // If there are questions but no user activity for 5 seconds, show the button
                const lastActivityTime = window.lastUserActivity || 0;
                if (Date.now() - lastActivityTime > 5000) {
                    recoveryBtn.style.display = 'block';
                }
            } else {
                recoveryBtn.style.display = 'none';
            }
        }, 5000);
    }
}

// Track user activity
document.addEventListener('click', () => {
    window.lastUserActivity = Date.now();
});

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', () => {
    addRecoveryButton();
});

/* Quiz Flow Diagnostics System */
(function setupQuizFlowDiagnostics() {
    console.log('%c[QUIZ-DIAGNOSTIC] Setting up comprehensive quiz flow monitoring', 'color: purple; font-weight: bold');
    
    // Track successful question loads
    let successfulQuestionLoads = 0;
    
    // Track successful answers processed
    let successfulAnswers = 0;
    
    // Track button click timestamps to detect delays
    let lastButtonClickTime = 0;
    
    // Keep a history of actions for debugging
    const actionHistory = [];
    
    function logAction(action, details) {
        const timestamp = new Date().toISOString();
        const entry = { timestamp, action, details };
        actionHistory.push(entry);
        
        // Keep history to last 20 actions
        if (actionHistory.length > 20) {
            actionHistory.shift();
        }
        
        console.log(`%c[QUIZ-DIAGNOSTIC] ${action}`, 'color: purple', details);
    }
    
    // Check for stalled state periodically
    setInterval(() => {
        // If we're in a question but nothing's happened for 10 seconds
        const now = Date.now();
        if (lastButtonClickTime > 0 && (now - lastButtonClickTime) > 10000) {
            console.warn('%c[QUIZ-DIAGNOSTIC] Potential stalled state detected - 10+ seconds since last action', 'color: orange; font-weight: bold');
            
            // Log diagnostic information
            console.log('%c[QUIZ-DIAGNOSTIC] Recent action history:', 'color: purple', actionHistory);
            console.log('%c[QUIZ-DIAGNOSTIC] isProcessingQuestion:', 'color: purple', isProcessingQuestion);
            console.log('%c[QUIZ-DIAGNOSTIC] Current question index:', 'color: purple', currentQuestionIndex);
            
            // Check if options are disabled
            const optionsContainer = document.getElementById('options-container');
            if (optionsContainer) {
                const options = optionsContainer.querySelectorAll('.option-btn');
                const disabledCount = Array.from(options).filter(opt => opt.disabled).length;
                console.log(`%c[QUIZ-DIAGNOSTIC] Options state: ${disabledCount}/${options.length} disabled`, 'color: purple');
                
                // If all options are disabled but continue button isn't visible, that's a problem
                const continueBtn = document.getElementById('continue-btn');
                if (disabledCount === options.length && continueBtn && 
                    (continueBtn.style.display === 'none' || 
                     continueBtn.style.visibility === 'hidden' || 
                     continueBtn.style.opacity === '0')) {
                    console.error('%c[QUIZ-DIAGNOSTIC] CRITICAL ERROR: All options disabled but continue button not visible!', 'color: red; font-weight: bold');
                    
                    // Try to auto-recover
                    logAction('Auto-recovery initiated', { reason: 'Options disabled but continue button not visible' });
                    continueBtn.style.display = 'inline-block';
                    continueBtn.style.opacity = '1';
                    continueBtn.style.visibility = 'visible';
                }
            }
            
            // Reset timer to avoid spamming the console
            lastButtonClickTime = now;
        }
    }, 5000);
    
    // Hook into loadQuestion
    const originalLoadQuestion = window.loadQuestion;
    window.loadQuestion = function() {
        logAction('Question load started', { index: currentQuestionIndex });
        const result = originalLoadQuestion.apply(this, arguments);
        
        // After loading, check that options are truly interactive
        setTimeout(() => {
            const optionsContainer = document.getElementById('options-container');
            if (optionsContainer) {
                const options = optionsContainer.querySelectorAll('.option-btn');
                logAction('Question loaded', { 
                    index: currentQuestionIndex,
                    optionsCount: options.length,
                    disabled: Array.from(options).filter(opt => opt.disabled).length
                });
                
                // Track successful load
                successfulQuestionLoads++;
                lastButtonClickTime = Date.now();
            }
        }, 100);
        
        return result;
    };
    
    // Hook into handleAnswer
    const originalHandleAnswer = window.handleAnswer;
    window.handleAnswer = function() {
        const selectedIndex = arguments[0];
        const correctIndex = arguments[1];
        
        logAction('Answer selected', { selectedIndex, correctIndex });
        lastButtonClickTime = Date.now();
        
        const result = originalHandleAnswer.apply(this, arguments);
        
        // Check if the continue button is properly visible after answering
        setTimeout(() => {
            const continueBtn = document.getElementById('continue-btn');
            const isVisible = continueBtn && 
                continueBtn.style.display !== 'none' && 
                continueBtn.style.visibility !== 'hidden' &&
                continueBtn.style.opacity !== '0';
            
            logAction('Answer processed', { 
                continueButtonVisible: isVisible,
                isProcessingQuestion: isProcessingQuestion
            });
            
            // If continue button isn't visible after answering, that's a problem
            if (!isVisible) {
                console.error('%c[QUIZ-DIAGNOSTIC] ERROR: Continue button not visible after answering!', 'color: red; font-weight: bold');
                // Try to fix it
                if (continueBtn) {
                    continueBtn.style.display = 'inline-block';
                    continueBtn.style.opacity = '1';
                    continueBtn.style.visibility = 'visible';
                    logAction('Auto-fixed continue button', {});
                }
            } else {
                // Track successful answer
                successfulAnswers++;
            }
        }, 500);
        
        return result;
    };
    
    // Hook into handleContinue
    const originalHandleContinue = window.handleContinue;
    window.handleContinue = function() {
        logAction('Continue clicked', { 
            from: currentQuestionIndex,
            to: currentQuestionIndex + 1,
            total: questionsPerLesson
        });
        lastButtonClickTime = Date.now();
        
        return originalHandleContinue.apply(this, arguments);
    };
    
    // Add global status command for debugging
    window.checkQuizStatus = function() {
        const statusReport = {
            currentQuestionIndex,
            totalQuestions: questionsPerLesson,
            successfulQuestionLoads,
            successfulAnswers,
            isProcessingQuestion,
            actionHistory,
            timeElapsedSinceLastAction: Date.now() - lastButtonClickTime
        };
        
        console.log('%c[QUIZ-DIAGNOSTIC] Status Report:', 'color: blue; font-weight: bold', statusReport);
        return statusReport;
    };
    
    console.log('%c[QUIZ-DIAGNOSTIC] Quiz flow monitoring initialized successfully', 'color: purple; font-weight: bold');
})(); 
