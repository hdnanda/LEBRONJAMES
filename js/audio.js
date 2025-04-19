/**
 * Audio Manager for Financial Literacy App
 * Handles sound effects, user preferences, and browser compatibility
 */

// Audio state management
const AudioManager = {
    // State variables
    isEnabled: localStorage.getItem('soundEnabled') !== 'false',
    hasUserInteracted: false,
    audioContext: null,
    isInitialized: false,
    isAudioSupported: false,

    // Sound configuration
    sounds: {
        correct: {
            file: 'assets/sounds/correct.mp3',
            volume: 0.7,
            description: 'Success sound for correct answers'
        },
        incorrect: {
            file: 'assets/sounds/incorrect.mp3',
            volume: 0.6,
            description: 'Error sound for incorrect answers'
        },
        levelComplete: {
            file: 'assets/sounds/level-complete.mp3',
            volume: 0.8,
            description: 'Celebration sound for completing a level'
        },
        whoosh: {
            file: 'assets/sounds/whoosh.mp3',
            volume: 0.5,
            description: 'Whoosh sound effect for answer transitions'
        },
        examStart: {
            file: 'assets/sounds/whoosh.mp3',
            volume: 0.8,
            description: 'Sound played when starting an exam'
        },
        examWarning: {
            file: 'assets/sounds/incorrect.mp3',
            volume: 0.7,
            description: 'Warning sound for exam mode'
        },
        examComplete: {
            file: 'assets/sounds/level-complete.mp3',
            volume: 0.9,
            description: 'Celebration sound for completing an exam'
        },
        examFail: {
            file: 'assets/sounds/incorrect.mp3',
            volume: 0.8,
            description: 'Failure sound for exam mode'
        }
    },

    // Audio cache
    audioCache: {},

    /**
     * Initialize the audio system
     * Sets up audio context, preloads sounds, and handles user interaction
     */
    initialize() {
        if (this.isInitialized) {
            console.log('🎵 Audio system already initialized');
            return;
        }

        try {
            console.log('🎵 Starting audio system initialization...');
            
            // Check browser audio support
            this.checkAudioSupport();
            
            // Set up user interaction detection for audio context
            this.setupUserInteraction();
            
            // Preload all sound effects
            this.preloadSounds();
            
            // Initialize settings UI
            this.initializeSettings();
            
            this.isInitialized = true;
            console.log('✅ Audio system initialized successfully');
            
            // Verify audio files are loaded
            this.verifyAudioFiles();
        } catch (error) {
            console.error('❌ Failed to initialize audio system:', error);
        }
    },

    /**
     * Verify that all audio files are properly loaded
     */
    verifyAudioFiles() {
        console.log('🔍 Verifying audio files...');
        Object.entries(this.audioCache).forEach(([key, audio]) => {
            console.log(`Checking audio file: ${key}`, {
                readyState: audio.readyState,
                error: audio.error,
                loaded: audio.readyState >= 2,
                duration: audio.duration
            });
            
            if (audio.error) {
                console.error(`❌ Error loading ${key}:`, audio.error);
            }
        });
    },

    /**
     * Check if audio is supported in the browser
     */
    checkAudioSupport() {
        try {
            const audio = new Audio();
            this.isAudioSupported = !!(audio.canPlayType && audio.canPlayType('audio/mpeg'));
            console.log('Audio support check:', {
                supported: this.isAudioSupported,
                canPlayMP3: audio.canPlayType('audio/mpeg'),
                canPlayWAV: audio.canPlayType('audio/wav')
            });
        } catch (error) {
            console.error('Error checking audio support:', error);
            this.isAudioSupported = false;
        }
    },

    /**
     * Set up user interaction detection for audio playback
     */
    setupUserInteraction() {
        const interactionEvents = ['click', 'touchstart', 'keydown'];
        
        const handleInteraction = () => {
            if (!this.hasUserInteracted) {
                this.hasUserInteracted = true;
                console.log('User interaction detected, audio enabled');
                
                // Initialize or resume audio context on first interaction
                if (!this.audioContext) {
                    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                } else if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }
                console.log('Audio context state:', this.audioContext.state);
            }
        };

        // Add interaction listeners
        interactionEvents.forEach(event => {
            document.addEventListener(event, handleInteraction, { once: false });
        });
    },

    /**
     * Preload all sound effects
     */
    preloadSounds() {
        if (!this.isAudioSupported) {
            console.warn('⚠️ Audio not supported in this browser');
            return;
        }

        console.log('🎵 Preloading sound effects...');
        Object.entries(this.sounds).forEach(([key, config]) => {
            try {
                console.log(`Loading sound: ${key}`);
                const audio = new Audio(config.file);
                audio.volume = config.volume;
                audio.preload = 'auto';
                
                // Add loading event listeners
                audio.addEventListener('error', (e) => {
                    console.error(`❌ Failed to load sound ${key}:`, e);
                });
                
                audio.addEventListener('canplaythrough', () => {
                    console.log(`✅ Sound ${key} loaded successfully`);
                });
                
                audio.addEventListener('loadeddata', () => {
                    console.log(`📊 Sound ${key} data loaded:`, {
                        duration: audio.duration,
                        readyState: audio.readyState
                    });
                });
                
                // Cache the audio object
                this.audioCache[key] = audio;
            } catch (error) {
                console.error(`❌ Error creating audio object for ${key}:`, error);
            }
        });
    },

    /**
     * Initialize sound settings UI
     */
    initializeSettings() {
        const soundToggle = document.getElementById('sound-effects-toggle');
        if (soundToggle) {
            soundToggle.checked = this.isEnabled;
            soundToggle.disabled = !this.isAudioSupported;
            soundToggle.addEventListener('change', (e) => this.toggleSound(e));
            console.log('Sound settings initialized:', { 
                isEnabled: this.isEnabled,
                isAudioSupported: this.isAudioSupported
            });
        }
    },

    /**
     * Toggle sound effects on/off
     */
    toggleSound(event) {
        this.isEnabled = event.target.checked;
        localStorage.setItem('soundEnabled', this.isEnabled);
        console.log('Sound toggled:', this.isEnabled);
        
        // Play test sound if enabled
        if (this.isEnabled) {
            this.playSound('correct');
        }
    },

    /**
     * Play a sound effect with error handling and overlap prevention
     */
    playSound(soundName) {
        console.log(`🎵 Attempting to play sound: ${soundName}`);
        console.log('Current audio state:', {
            isEnabled: this.isEnabled,
            hasUserInteracted: this.hasUserInteracted,
            isAudioSupported: this.isAudioSupported,
            isInitialized: this.isInitialized,
            audioContext: this.audioContext ? this.audioContext.state : 'null'
        });
        
        // Check if audio is supported
        if (!this.isAudioSupported) {
            console.warn('⚠️ Audio playback not supported in this browser');
            return;
        }

        // Check if sound is enabled
        if (!this.isEnabled) {
            console.log('🔇 Sound disabled, skipping playback');
            return;
        }
        
        try {
            const audio = this.audioCache[soundName];
            if (!audio) {
                console.warn(`⚠️ Sound ${soundName} not found in cache. Available sounds:`, Object.keys(this.audioCache));
                return;
            }

            // Check audio state before playing
            console.log(`📊 Audio state for ${soundName}:`, {
                readyState: audio.readyState,
                paused: audio.paused,
                currentTime: audio.currentTime,
                duration: audio.duration,
                error: audio.error ? audio.error.message : 'none'
            });

            // Reset audio to beginning and stop any current playback
            audio.currentTime = 0;
            
            // Resume audio context if suspended
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume().then(() => {
                    this._playAudio(audio, soundName);
                });
            } else {
                this._playAudio(audio, soundName);
            }
        } catch (error) {
            console.error(`❌ Error playing sound ${soundName}:`, error);
            console.error('Stack trace:', error.stack);
        }
    },

    /**
     * Internal method to handle actual audio playback
     */
    _playAudio(audio, soundName) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log(`✅ Sound "${soundName}" started playing successfully`);
                console.log(`📊 Sound details:`, {
                    name: soundName,
                    volume: audio.volume,
                    duration: audio.duration,
                    currentTime: audio.currentTime,
                    readyState: audio.readyState
                });
            }).catch(error => {
                console.error(`❌ Sound play error for ${soundName}:`, error);
                // Don't call pause() on play error as it might cause additional errors
            });
        }
    }
};

// Initialize audio system when document is ready
document.addEventListener('DOMContentLoaded', () => {
    AudioManager.initialize();
});

// Export the audio manager for use in other files
window.AudioManager = AudioManager;
window.playSound = (soundName) => AudioManager.playSound(soundName); 