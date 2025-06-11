// Animations for the Financial Literacy App

// Confetti animation for correct answers
function triggerConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;

    const myConfetti = confetti.create(canvas, {
        resize: true,
        useWorker: true
    });

    myConfetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#008000', '#D4AF37', '#C0C0C0', '#ffffff']  // Money-themed colors
    });
}

/**
 * Enhanced confetti animation for lesson completion
 * Shows a more impressive confetti celebration
 */
function triggerLessonCompleteConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;

    const myConfetti = confetti.create(canvas, {
        resize: true,
        useWorker: true
    });
    
    // First burst from the bottom
    myConfetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.7 },
        colors: ['#008000', '#D4AF37', '#C0C0C0', '#ffffff'],  // Money-themed colors
        gravity: 0.8,
        scalar: 1.2
    });
    
    // Side bursts after a small delay
    setTimeout(() => {
        // Left side burst
        myConfetti({
            particleCount: 100,
            angle: 60,
            spread: 50,
            origin: { x: 0, y: 0.5 },
            colors: ['#008000', '#D4AF37', '#C0C0C0', '#ffffff']
        });
        
        // Right side burst
        myConfetti({
            particleCount: 100,
            angle: 120,
            spread: 50,
            origin: { x: 1, y: 0.5 },
            colors: ['#008000', '#D4AF37', '#C0C0C0', '#ffffff']
        });
    }, 300);
}

// Animation for correct answer feedback
function animateCorrectFeedback(element, explanation) {
    console.log('🎯 Starting correct answer animation...');
    
    try {
        if (!element) {
            console.error('Element is null in animateCorrectFeedback');
            return;
        }

        // Add the correct class to trigger the CSS animation
        element.classList.add('correct');
        
        // Show overlay with smooth transition
        const overlay = document.getElementById('overlay');
        if (overlay) {
            overlay.style.transition = 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            overlay.classList.add('active');
            overlay.style.zIndex = '9';
        }
        
        // Add blur effect to inactive elements
        const optionsContainer = document.getElementById('options-container');
        if (optionsContainer) {
            optionsContainer.classList.add('blur-inactive');
        }
        
        // Play a success sound using the AudioManager
        if (window.AudioManager && window.AudioManager.isEnabled) {
            window.AudioManager.playSound('correct');
        }
        
        // Trigger confetti
        triggerConfetti();
        
        // Show feedback container with enhanced animations
        const feedbackContainer = document.getElementById('feedback-container');
        const feedbackText = document.getElementById('feedback-text');
        
        if (feedbackContainer && feedbackText) {
            // Reset any existing classes
            feedbackContainer.classList.remove('hidden', 'visible', 'completion-visible');
            feedbackText.innerHTML = '';
            
            // Log the exact explanation we received
            console.log('%c[EXPLANATION RECEIVED]', 'background: #4CAF50; color: white; padding: 2px 5px; border-radius: 3px;', explanation);
            
            // FIXED: Use the explanation directly, only use fallback if null/undefined
            const explanationToShow = explanation || "Great understanding of this financial concept!";
            
            feedbackText.innerHTML = `
                <span class="feedback-message">That's correct! 🎯</span>
                <span class="explanation">${explanationToShow}</span>
            `;
            
            // Debug log to confirm explanation is being displayed
            console.log('%c[EXPLANATION DISPLAYED] ✅', 'background: #4CAF50; color: white; padding: 2px 5px; border-radius: 3px;', explanationToShow);
            
            // Show the container with a slight delay for better UX
            setTimeout(() => {
                feedbackContainer.classList.remove('hidden');
                // Force a reflow
                void feedbackContainer.offsetWidth;
                feedbackContainer.classList.add('visible');
            }, 100);
        }
        
        // Ensure continue button is properly displayed and interactive
        const continueBtn = document.getElementById('continue-btn');
        if (continueBtn) {
            continueBtn.style.display = 'inline-block';
            continueBtn.style.opacity = '1';
            continueBtn.style.pointerEvents = 'auto';
            continueBtn.style.visibility = 'visible';
            continueBtn.style.position = 'relative';
            continueBtn.style.zIndex = '50';
        }
        
        console.log('✅ Correct answer animation completed successfully');
    } catch (error) {
        console.error('❌ Error in correct answer animation:', error);
    }
}

// Animation for incorrect answer feedback
function animateIncorrectFeedback(element, explanation) {
    console.log('🎯 Starting incorrect answer animation...');
    
    try {
        if (!element) {
            console.error('Element is null in animateIncorrectFeedback');
            return;
        }

        // Add the incorrect class to trigger the CSS animation
        element.classList.add('incorrect');
        
        // Show overlay with smooth transition
        const overlay = document.getElementById('overlay');
        if (overlay) {
            overlay.style.transition = 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            overlay.classList.add('active');
            overlay.style.zIndex = '9';
        }
        
        // Add blur effect to inactive elements
        const optionsContainer = document.getElementById('options-container');
        if (optionsContainer) {
            optionsContainer.classList.add('blur-inactive');
        }
        
        // Play an error sound using the AudioManager
        if (window.AudioManager && window.AudioManager.isEnabled) {
            window.AudioManager.playSound('incorrect');
        }
        
        // Show feedback container with enhanced animations
        const feedbackContainer = document.getElementById('feedback-container');
        const feedbackText = document.getElementById('feedback-text');
        
        if (feedbackContainer && feedbackText) {
            // Reset any existing classes
            feedbackContainer.classList.remove('hidden', 'visible', 'completion-visible');
            feedbackText.innerHTML = '';
            
            // Log the exact explanation we received
            console.log('%c[EXPLANATION RECEIVED]', 'background: #F44336; color: white; padding: 2px 5px; border-radius: 3px;', explanation);
            
            // FIXED: Use the explanation directly, only use fallback if null/undefined
            const explanationToShow = explanation || "Remember this concept for future financial decisions.";
            
            feedbackText.innerHTML = `
                <span class="feedback-message">Let's understand this better 📚</span>
                <span class="explanation">${explanationToShow}</span>
            `;
            
            // Debug log to confirm explanation is being displayed
            console.log('%c[EXPLANATION DISPLAYED] ❌', 'background: #F44336; color: white; padding: 2px 5px; border-radius: 3px;', explanationToShow);
            
            // Show the container with a slight delay for better UX
            setTimeout(() => {
                feedbackContainer.classList.remove('hidden');
                // Force a reflow
                void feedbackContainer.offsetWidth;
                feedbackContainer.classList.add('visible');
            }, 100);
        }
        
        // Ensure continue button is properly displayed and interactive
        const continueBtn = document.getElementById('continue-btn');
        if (continueBtn) {
            continueBtn.style.display = 'inline-block';
            continueBtn.style.opacity = '1';
            continueBtn.style.pointerEvents = 'auto';
            continueBtn.style.visibility = 'visible';
            continueBtn.style.position = 'relative';
            continueBtn.style.zIndex = '50';
        }
        
        console.log('✅ Incorrect answer animation completed successfully');
    } catch (error) {
        console.error('❌ Error in incorrect answer animation:', error);
    }
}

/**
 * Reset all animations and UI elements to their initial state
 */
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
    
    // Hide overlay with smooth transition
    const overlay = document.getElementById('overlay');
    if (overlay) {
        overlay.style.transition = 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        overlay.classList.remove('active');
        overlay.style.zIndex = '40';
    }
    
    // Hide feedback container with smooth animation
    const feedbackContainer = document.getElementById('feedback-container');
    if (feedbackContainer) {
        feedbackContainer.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        feedbackContainer.classList.remove('visible', 'completion-visible');
        
        // Wait for animation to complete before hiding
        setTimeout(() => {
            feedbackContainer.classList.add('hidden');
        }, 400);
    }
    
    // Reset continue button
    const continueBtn = document.getElementById('continue-btn');
    if (continueBtn) {
        continueBtn.textContent = "Continue to Next Question 👍";
        continueBtn.style.display = '';
        continueBtn.style.opacity = '';
        continueBtn.style.pointerEvents = '';
        continueBtn.style.visibility = '';
        continueBtn.style.position = '';
        continueBtn.style.zIndex = '';
    }
}

/**
 * Animate the appearance of a new question
 */
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

// Expose animation functions to global scope
window.animateCorrectFeedback = animateCorrectFeedback;
window.animateIncorrectFeedback = animateIncorrectFeedback;
window.resetAnimations = resetAnimations;
window.animateNewQuestion = animateNewQuestion;
window.triggerConfetti = triggerConfetti;
window.triggerLessonCompleteConfetti = triggerLessonCompleteConfetti;

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    @keyframes gradientTransition {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
    }
    
    .pulse {
        animation: pulse 0.7s;
    }
    
    .streak-milestone {
        position: absolute;
        top: 20%;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(212, 175, 55, 0.8);
        color: #000;
        padding: 15px 25px;
        border-radius: 50px;
        font-weight: bold;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        z-index: 200;
        transition: all 0.5s ease;
    }
    
    .fade-out {
        opacity: 0;
        transform: translateX(-50%) translateY(-20px);
    }
`;
document.head.appendChild(style); 