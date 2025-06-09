<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TheMoneyOlympics - Levels</title>
    
    <!-- Device detection (must be before other scripts) -->
    <script src="js/device-detection.js"></script>
    <script src="js/config.js"></script>
    
    <link rel="stylesheet" href="css/styles.css">
    <link rel="stylesheet" href="css/device-specific.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        :root {
            /* Light theme variables (default) */
            --bg-color: #f5f5f5;
            --header-bg: rgba(255, 255, 255, 0.3);
            --card-bg: rgba(255, 255, 255, 0.3);
            --text-color: #333333;
            --accent-color: #D4AF37;
            --border-radius: 12px;
            --border-color: rgba(0, 0, 0, 0.1);
            --overlay-bg: rgba(0, 0, 0, 0.5);
        }

        :root[data-theme="dark"] {
            /* Dark theme variables */
            --bg-color: #000000;
            --header-bg: rgba(64, 64, 64, 0.3);
            --card-bg: rgba(64, 64, 64, 0.3);
            --text-color: #ffffff;
            --accent-color: #D4AF37;
            --border-color: rgba(255, 255, 255, 0.1);
            --overlay-bg: rgba(0, 0, 0, 0.7);
        }

        body {
            background: var(--bg-color);
            color: var(--text-color);
            margin: 0;
            padding: 0;
            min-height: 100vh;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.5;
            transition: all 0.3s ease;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            padding-left: 0;
            background: var(--header-bg);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border-bottom: 1px solid var(--border-color);
        }

        .logo {
            font-family: "Times New Roman", serif;
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--text-color);
            line-height: 1;
            text-decoration: none;
            transition: color 0.3s ease, transform 0.2s ease;
            cursor: pointer;
            padding: 0 1.5rem;
            margin: 0;
            display: flex;
            align-items: center;
            height: 100%;
        }

        .logo:hover {
            transform: scale(1.05);
        }

        [data-theme="dark"] .logo {
            color: #ffffff;
        }

        [data-theme="light"] .logo {
            color: #000000;
        }

        .header-controls {
            display: flex;
            align-items: center;
            gap: 0.8rem;
        }

        .header-controls button {
            background: none;
            border: none;
            color: var(--text-color);
            cursor: pointer;
            padding: 0.5rem;
            font-size: 1.2rem;
            opacity: 0.8;
            transition: opacity 0.2s ease;
            min-width: 40px;
        }

        .header-controls button:hover {
            opacity: 1;
        }

        /* Add back button styling */
        .back-btn {
            background: none;
            border: none;
            color: var(--text-color);
            cursor: pointer;
            padding: 0.5rem;
            font-size: 1.2rem;
            opacity: 0.8;
            transition: opacity 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            margin-right: auto;
        }

        .back-btn:hover {
            opacity: 1;
            background: var(--card-bg);
        }

        .back-btn i {
            font-size: 1rem;
        }

        .main-content {
            padding: 2rem;
            max-width: 1200px;
            margin: 0 auto;
        }

        .journey-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 3rem;
            padding: 0 1rem;
        }

        .journey-title {
            font-size: 2rem;
            font-weight: bold;
            margin: 0;
            color: var(--text-color);
        }

        .xp-counter {
            background: var(--card-bg);
            padding: 0.5rem 1rem;
            border-radius: var(--border-radius);
            font-weight: 500;
            color: var(--text-color);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        }

        .topics-container {
            display: flex;
            flex-direction: column;
            gap: 3rem;
            padding: 0 1rem;
        }

        .topic-container {
            display: flex;
            flex-direction: column;
            gap: 2rem;
        }

        .topic-header {
            background: var(--card-bg);
            border-radius: var(--border-radius);
            padding: 2rem;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid var(--border-color);
        }

        .topic-header .level-content {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 1.5rem;
        }

        .topic-header .topic-icon {
            font-size: 2rem;
            opacity: 0.9;
        }

        .topic-header .topic-text {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .locked-topic {
            opacity: 0.7;
            position: relative;
        }

        .topic-locked-message {
            font-size: 0.8rem;
            color: #ff5252;
            font-style: italic;
        }

        .sub-levels-container {
            display: flex;
            flex-direction: column;
            gap: 3rem;
            position: relative;
            padding: 0 4rem;
        }

        .sub-level-card {
            width: 80px;
            height: 80px;
            background: var(--card-bg);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 1px solid var(--border-color);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            z-index: 2;
        }

        .sub-level-card:nth-child(odd) {
            align-self: flex-start;
            margin-left: 20%;
        }

        .sub-level-card:nth-child(even) {
            align-self: flex-end;
            margin-right: 20%;
        }

        .sub-level-card .level-icon {
            font-size: 1.5rem;
            color: var(--text-color);
            opacity: 0.8;
            transition: opacity 0.2s ease;
        }

        .sub-level-card:hover .level-icon {
            opacity: 1;
        }

        .sub-level-card.completed {
            background: #58cc02;
            border-color: #4CAF50;
        }

        .sub-level-card.completed .level-icon {
            color: white;
            opacity: 1;
        }

        .sub-level-card.locked {
            background: var(--card-bg);
            opacity: 0.5;
        }

        .sub-level-card.locked .level-icon {
            opacity: 0.5;
        }

        .connecting-line {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        }

        .connecting-line path {
            stroke: var(--border-color);
            stroke-width: 2;
            fill: none;
            stroke-dasharray: 4 4;
        }

        .connecting-line path.completed {
            stroke: #58cc02;
            stroke-dasharray: none;
        }

        .level-tooltip {
            position: absolute;
            background: var(--card-bg);
            padding: 1rem;
            border-radius: var(--border-radius);
            border: 1px solid var(--border-color);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            width: 250px;
            opacity: 0;
            visibility: hidden;
            transition: all 0.2s ease;
            z-index: 3;
        }

        .tooltip-title {
            font-weight: bold;
            margin-bottom: 0.5rem;
            color: var(--text-color);
        }

        .tooltip-overview {
            font-size: 0.9rem;
            margin-bottom: 0.5rem;
            color: var(--text-color);
            opacity: 0.8;
        }

        .tooltip-xp {
            font-size: 0.8rem;
            color: var(--accent-color);
            margin-bottom: 0.5rem;
        }

        .start-lesson-btn {
            background: var(--accent-color);
            color: white;
            border: none;
            border-radius: 20px;
            padding: 0.5rem 1rem;
            font-size: 0.9rem;
            cursor: pointer;
            width: 100%;
            transition: all 0.2s ease;
        }

        .start-lesson-btn:hover {
            background: #b38f2d;
            transform: translateY(-2px);
        }

        .start-lesson-btn:active {
            transform: translateY(0);
        }

        .sub-level-card:hover .level-tooltip {
            opacity: 1;
            visibility: visible;
        }

        .sub-level-card:nth-child(odd) .level-tooltip {
            left: 100px;
            top: 50%;
            transform: translateY(-50%);
        }

        .sub-level-card:nth-child(even) .level-tooltip {
            right: 100px;
            top: 50%;
            transform: translateY(-50%);
        }

        /* Mobile specific tooltip positioning */
        html[data-device="mobile"] .sub-level-card .level-tooltip {
            left: 50% !important;
            right: auto !important;
            top: 100% !important;
            transform: translateX(-50%) !important;
            width: 280px;
            max-width: 90vw;
            z-index: 10;
        }
        
        /* Add more space below the node for the tooltip on mobile */
        html[data-device="mobile"] .sub-level-card {
            margin-bottom: 20px;
            position: relative;
        }
        
        /* Debug indicator for device detection */
        html::after {
            content: attr(data-device);
            position: fixed;
            bottom: 10px;
            right: 10px;
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 5px 10px;
            border-radius: 5px;
            font-size: 12px;
            z-index: 9999;
            pointer-events: none;
            opacity: 0.7;
        }

        .topic-card {
            background: none !important;
            border: none !important;
            box-shadow: none !important;
            width: 100%;
            max-width: none;
            margin: 0;
            cursor: default;
            z-index: 3;
            position: relative;
            padding: 0;
            display: flex;
            align-items: center;
        }

        .level-card {
            background: none;
            border: none;
            border-radius: 0;
            width: 280px;
            height: auto;
            padding: 20px;
            display: flex;
            align-items: center;
            gap: 15px;
            position: relative;
            cursor: pointer;
            z-index: 2;
            transition: transform 0.3s ease;
            box-shadow: none;
            margin: 0;
            color: var(--card-text-color);
        }

        .level-card::before {
            display: none;
        }

        /* Position cards on alternating sides */
        .level-card:nth-child(odd) {
            align-self: flex-start;
            margin-left: 50px;
        }

        .level-card:nth-child(even) {
            align-self: flex-end;
            margin-right: 50px;
        }

        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--overlay-bg);
            z-index: 100;
            backdrop-filter: blur(5px);
            -webkit-backdrop-filter: blur(5px);
        }

        .modal-content {
            position: relative;
            background: var(--card-bg);
            margin: 15vh auto;
            padding: 2rem;
            width: 90%;
            max-width: 400px;
            border-radius: var(--border-radius);
            border: 1px solid var(--border-color);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
        }

        .modal-title {
            font-size: 1.5rem;
            font-weight: bold;
            color: var(--text-color);
        }

        .close-btn {
            background: none;
            border: none;
            color: var(--text-color);
            font-size: 1.5rem;
            cursor: pointer;
            opacity: 0.8;
            transition: opacity 0.2s ease;
        }

        .close-btn:hover {
            opacity: 1;
        }

        .user-info {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .user-stat {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            background: var(--card-bg);
            border-radius: var(--border-radius);
            border: 1px solid var(--border-color);
        }

        .settings-option {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 0;
            border-bottom: 1px solid var(--border-color);
        }

        .settings-option:last-child {
            border-bottom: none;
        }

        .settings-option select,
        .settings-option input[type="checkbox"] {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            color: var(--text-color);
            padding: 0.5rem;
            border-radius: var(--border-radius);
        }

        .settings-option select {
            padding: 0.5rem;
            border-radius: var(--border-radius);
            border: 1px solid var(--border-color);
            background-color: var(--input-bg);
            color: var(--text-color);
        }

        .toggle-switch {
            position: relative;
            display: inline-block;
            width: 50px;
            height: 24px;
        }

        .toggle-switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }

        .toggle-slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: var(--card-bg);
            transition: .4s;
            border-radius: 24px;
        }

        .toggle-slider:before {
            position: absolute;
            content: "";
            height: 16px;
            width: 16px;
            left: 4px;
            bottom: 4px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
        }

        input:checked + .toggle-slider {
            background-color: var(--accent-color);
        }

        input:checked + .toggle-slider:before {
            transform: translateX(26px);
        }

        @keyframes slide-in-right {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        .xp-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 20px;
            border-radius: 4px;
            background-color: var(--accent-color);
            color: white;
            z-index: 1000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            animation: slide-in-right 0.5s forwards;
        }

        .fade-out {
            opacity: 0 !important;
            transition: opacity 0.5s ease;
        }

        /* Connection status indicator */
        .connection-status {
            position: fixed;
            bottom: 10px;
            left: 10px;
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 12px;
            display: flex;
            align-items: center;
            gap: 5px;
            z-index: 100;
            opacity: 0.7;
            transition: opacity 0.2s ease;
        }

        .connection-status:hover {
            opacity: 1;
        }

        .connection-status.online {
            background-color: #4CAF50;
            color: white;
        }

        .connection-status.offline {
            background-color: #ff5252;
            color: white;
        }

        /* Settings Section Styles */
        .settings-section {
            border-bottom: 1px solid var(--border-color);
            margin-bottom: 1rem;
            padding-bottom: 1rem;
        }
        
        .settings-section h3 {
            margin-top: 0;
            margin-bottom: 1rem;
            font-size: 1.1rem;
            color: var(--accent-color);
        }
        
        #settings-username, #settings-email {
            font-weight: 500;
            color: var(--accent-color);
        }

        /* Add specific mobile styling for header buttons */
        html[data-device="mobile"] .header-controls {
            gap: 1.2rem;
        }
        
        html[data-device="mobile"] .header-controls button {
            padding: 0.6rem;
        }
    </style>
</head>
<body>
    <header class="header">
        <div class="logo" onclick="window.location.href='homepage.html'">T</div>
        <div class="header-controls">
            <button class="profile-btn" onclick="showAccount()">
                <i class="fas fa-user"></i>
            </button>
            <button class="settings-btn" onclick="showSettings()">
                <i class="fas fa-cog"></i>
            </button>
            <button class="theme-btn" onclick="toggleTheme()">
                <i class="fas fa-moon"></i>
            </button>
        </div>
    </header>

    <main class="main-content">
        <div class="journey-header">
            <h1 class="journey-title">Your Financial Journey</h1>
            <div class="xp-counter">Total XP: <span id="totalXP">0</span></div>
        </div>

        <div class="topics-container" id="topicsContainer">
            <!-- Topics will be dynamically inserted here -->
        </div>
    </main>

    <!-- Connection Status Indicator -->
    <div id="connectionStatus" class="connection-status online">
        <i class="fas fa-wifi"></i>
        <span>Online</span>
    </div>

    <!-- Account Modal -->
    <div id="accountModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">Your Account</h2>
                <button class="close-btn" onclick="closeModal('accountModal')">&times;</button>
            </div>
            <div class="modal-body">
                <div class="user-info">
                    <div class="user-stat">
                        <span class="user-stat-label">Total XP:</span>
                        <span id="modalTotalXP">0</span>
                    </div>
                    <div class="user-stat">
                        <span class="user-stat-label">Current Level:</span>
                        <span id="modalCurrentLevel">1.1</span>
                    </div>
                    <div class="user-stat">
                        <span class="user-stat-label">Completed Levels:</span>
                        <span id="modalCompletedLevels">0</span>
                    </div>
                    <div class="user-stat">
                        <span class="user-stat-label">Next Level:</span>
                        <span id="modalNextLevel">50 XP needed</span>
                    </div>
                    <!-- New Sync Button -->
                    <div class="user-stat" style="display: flex; justify-content: center;">
                        <button id="sync-data-btn" class="sync-btn" style="
                            background: var(--accent-color);
                            color: white;
                            padding: 0.5rem 1rem;
                            border: none;
                            border-radius: var(--border-radius);
                            cursor: pointer;
                            font-weight: 500;
                            margin-top: 0.5rem;
                            display: flex;
                            align-items: center;
                            gap: 0.5rem;
                        ">
                            <i class="fas fa-sync-alt"></i>
                            Sync Progress Data
                        </button>
                    </div>
                    <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                        <button id="logout-btn" class="logout-btn" style="
                            background: var(--accent-color);
                            color: white;
                            padding: 0.5rem 1rem;
                            border: none;
                            border-radius: var(--border-radius);
                            cursor: pointer;
                            font-weight: 500;
                            display: flex;
                            align-items: center;
                            gap: 0.5rem;
                        ">
                            <i class="fas fa-sign-out-alt"></i>
                            Logout
                        </button>
                        <a href="signup.html" style="
                            background: var(--card-bg);
                            color: var(--text-color);
                            border: 1px solid var(--border-color);
                            border-radius: 20px;
                            padding: 0.8rem 1.5rem;
                            font-size: 1rem;
                            cursor: pointer;
                            text-decoration: none;
                            text-align: center;
                            flex: 1;
                            transition: all 0.2s ease;
                        ">Create Account</a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Settings Modal -->
    <div id="settingsModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">Settings</h2>
                <button class="close-btn" onclick="closeModal('settingsModal')">&times;</button>
            </div>
            <div class="modal-body">
                <!-- User Information Section -->
                <div class="settings-section">
                    <h3>User Information</h3>
                    <div class="settings-option">
                        <span>Username:</span>
                        <span id="settings-username">Loading...</span>
                    </div>
                    <div class="settings-option">
                        <span>Email:</span>
                        <span id="settings-email">Loading...</span>
                    </div>
                </div>
                
                <!-- Settings Options -->
                <div class="settings-option">
                    <span>Dark Mode</span>
                    <label class="toggle-switch">
                        <input type="checkbox" id="theme-toggle">
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                <div class="settings-option">
                    <span>Sound Effects</span>
                    <input type="checkbox" id="soundToggle" checked>
                </div>
                <div class="settings-option">
                    <span>Background Music</span>
                    <input type="checkbox" id="musicToggle" checked>
                </div>
                <div class="settings-option">
                    <span>Language</span>
                    <select id="languageSelect">
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                    </select>
                </div>
                <div class="settings-option">
                    <span>Database Connection</span>
                    <button id="dbTestBtn" class="db-test-btn" style="
                        background: var(--accent-color);
                        color: white;
                        border: none;
                        padding: 0.5rem 1rem;
                        border-radius: var(--border-radius);
                        cursor: pointer;
                        font-size: 0.9rem;
                    ">Test Connection</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Load scripts at the end of body -->
    <script src="js/topics.js"></script>
    <script src="js/dailyStreakService.js"></script>
    <script src="js/connection_helper.js"></script>
    <script src="js/auth.js"></script>
    <script src="js/levels.js"></script>
    <script src="js/navigation.js"></script>
    <script>
        // Helper functions
        function isLevelCompleted(topicId, subLevelId) {
            // Ensure proper formatting of IDs
            topicId = parseInt(topicId);
            subLevelId = parseFloat(subLevelId);
            
            // First check localStorage for completed levels
            const completedLevels = JSON.parse(localStorage.getItem('completedLevels') || '[]');
            const isCompletedLocal = completedLevels.some(level => {
                const storedTopicId = parseInt(level.topicId);
                const storedSubLevelId = parseFloat(level.subLevelId);
                return storedTopicId === topicId && storedSubLevelId === subLevelId;
            });
            
            return isCompletedLocal;
        }

        // Check if the final exam of a topic has been completed
        function isTopicExamCompleted(topicId) {
            topicId = parseInt(topicId);
            
            // Find the topic data
            const topic = window.topicsData.find(t => parseInt(t.id) === topicId);
            if (!topic) return false;
            
            // Find the final exam sublevel (should be the last one and have isExam flag)
            const finalExam = topic.subLevels.find(sl => sl.isExam === true);
            if (!finalExam) return false;
            
            // Format key for checking completedExams array
            const examKey = `${topicId}.${finalExam.id}`;
            
            // First check localStorage
            const completedExams = JSON.parse(localStorage.getItem('completedExams') || '[]');
            const isExamCompletedLocal = completedExams.includes(examKey);
            
            // DEBUG LOG: Show exam completion check
            console.log(`[DEBUG] Checking if exam ${examKey} is completed:`, isExamCompletedLocal);
            console.log(`[DEBUG] All completed exams from localStorage:`, completedExams);
            
            // If found in localStorage, return true immediately
            if (isExamCompletedLocal) return true;
            
            // Otherwise, also check if the level itself is completed
            return isLevelCompleted(topicId, finalExam.id);
        }

        // Load completed data from server
        async function syncCompletedDataFromServer() {
            // Only proceed if ConnectionHelper is available
            if (!window.ConnectionHelper || typeof window.ConnectionHelper.getUserXP !== 'function') {
                console.log('[DEBUG] No ConnectionHelper available for syncing');
                return false;
            }
            
            try {
                const result = await window.ConnectionHelper.getUserXP();
                
                // MODIFIED DEBUG LOG
                console.log('[DEBUG] syncCompletedDataFromServer received result:', JSON.stringify(result, null, 2));
                console.log('[DEBUG] result.hasOwnProperty(\'completed_exams\')?:', result.hasOwnProperty('completed_exams'));
                if (result.hasOwnProperty('completed_exams')) {
                    console.log('[DEBUG] Array.isArray(result.completed_exams)?:', Array.isArray(result.completed_exams));
                }
                // END MODIFIED DEBUG LOG

                if (result.success) {
                    // DEBUG LOG: Show server response data
                    console.log('[DEBUG] Server returned user data:', result);
                
                    // Handle completed_levels
                    if (result.hasOwnProperty('completed_levels')) { 
                        if (Array.isArray(result.completed_levels)) {
                            localStorage.setItem('completedLevels', JSON.stringify(result.completed_levels));
                            console.log('[DEBUG] Overwrote local completedLevels with server data:', result.completed_levels);
                        } else {
                            console.warn('[DEBUG] Server sent completed_levels, but it was not an array. Local completedLevels preserved. Server value:', result.completed_levels);
                        }
                    }
                    
                    // Handle completed_exams
                    if (result.hasOwnProperty('completed_exams')) { 
                        if (Array.isArray(result.completed_exams)) {
                            localStorage.setItem('completedExams', JSON.stringify(result.completed_exams));
                            console.log('[DEBUG] Overwrote local completedExams with server data:', result.completed_exams);
                        } else {
                            console.warn('[DEBUG] Server sent completed_exams, but it was not an array. Local completedExams preserved. Server value:', result.completed_exams);
                        }
                    }
                    
                    return true;
                } else {
                    // If result.success is false, log the reason if available
                    console.warn('[DEBUG] Sync failed or ConnectionHelper.getUserXP indicated failure:', result.message || 'No message');
                }
            } catch (error) {
                console.error('Error syncing completed data from server:', error);
            }
            
            return false;
        }

        // Check if a topic should be unlocked
        function isTopicUnlocked(topicId, totalXP) {
            topicId = parseInt(topicId);
            
            // First topic is always unlocked
            if (topicId === 1) return true;
            
            // For other topics, check if the previous topic's final exam is completed
            const previousTopicId = topicId - 1;
            
            // Force sync from server before checking exam completion (for better cross-browser experience)
            const isUnlocked = isTopicExamCompleted(previousTopicId);
            
            // DEBUG LOG: Show topic unlocking check
            console.log(`[DEBUG] Is topic ${topicId} unlocked? ${isUnlocked} (previous topic exam completed: ${isUnlocked})`);
            
            return isUnlocked;
        }

        // Mark a level as completed
        window.markLevelCompleted = function(currentLevel, passed) {
            if (!currentLevel || !passed) return false;

            const topicId = parseInt(currentLevel.topicId);
            const subLevelId = parseFloat(currentLevel.subLevelId);
            
            console.log(`[markLevelCompleted] Marking level as completed: Topic ${topicId}, SubLevel ${subLevelId}, Passed: ${passed}`);
            
            // Save to completedLevels in localStorage
            const completedLevels = JSON.parse(localStorage.getItem('completedLevels') || '[]');
            
            // Check if this level is already marked as completed
            const alreadyCompleted = completedLevels.some(level => 
                parseInt(level.topicId) === topicId && parseFloat(level.subLevelId) === subLevelId
            );
            
            if (!alreadyCompleted) {
                completedLevels.push({
                    topicId: topicId,
                    subLevelId: subLevelId,
                    timestamp: new Date().getTime()
                });
                
                localStorage.setItem('completedLevels', JSON.stringify(completedLevels));
                console.log(`[markLevelCompleted] Level saved to completedLevels, total completed: ${completedLevels.length}`);
                
                // Check if this is an exam level
                console.log(`[markLevelCompleted] Checking if level is exam: Topic ${topicId}, SubLevel ${subLevelId}`);
                const topic = window.topicsData.find(t => parseInt(t.id) === topicId);
                if (!topic) {
                    console.error(`[markLevelCompleted] Topic data not found for topicId: ${topicId}. Ensure topics.js is loaded and window.topicsData is populated.`);
                }

                const isExam = topic && topic.subLevels.some(sl => {
                    const subLevelIdMatches = parseFloat(sl.id) === subLevelId;
                    const isActualExamFlag = sl.isExam === true;
                    // console.log(`[markLevelCompleted] SubLevel Check: sl.id=${sl.id} (parsed ${parseFloat(sl.id)}), sl.isExam=${sl.isExam}. Matches ID: ${subLevelIdMatches}, Is Exam: ${isActualExamFlag}`);
                    return subLevelIdMatches && isActualExamFlag;
                });
                console.log(`[markLevelCompleted] Result of isExam check: ${isExam}. Topic found: ${!!topic}`);
                
                // If it's an exam, add to completedExams
                if (isExam) {
                    const examKey = `${topicId}.${subLevelId}`;
                    console.log(`[markLevelCompleted] Level IS an exam. examKey: ${examKey}`);
                    const completedExamsFromStorage = JSON.parse(localStorage.getItem('completedExams') || '[]');
                    console.log(`[markLevelCompleted] Current completedExams from localStorage (before add):`, JSON.parse(JSON.stringify(completedExamsFromStorage)));
                    if (!completedExamsFromStorage.includes(examKey)) {
                        completedExamsFromStorage.push(examKey);
                        localStorage.setItem('completedExams', JSON.stringify(completedExamsFromStorage));
                        console.log(`[markLevelCompleted] Exam ${examKey} ADDED to completedExams in localStorage. New array:`, JSON.parse(JSON.stringify(completedExamsFromStorage)));
                    } else {
                        console.log(`[markLevelCompleted] Exam ${examKey} was ALREADY in completedExams in localStorage.`);
                    }
                } else {
                    console.log(`[markLevelCompleted] Level is NOT an exam (or topic/sublevel data issue prevented identification).`);
                }
                
                // Get completedExams data to send to server as well
                const completedExamsToServer = JSON.parse(localStorage.getItem('completedExams') || '[]');
                console.log('[markLevelCompleted] completedExams being prepared to send to server:', JSON.parse(JSON.stringify(completedExamsToServer)));
                
                // Save to server if available
                if (window.ConnectionHelper && typeof window.ConnectionHelper.updateXP === 'function') {
                    // First get current XP to avoid overwriting with null
                    window.ConnectionHelper.getUserXP()
                        .then(result => {
                            const currentXP = result.xp || 0;
                            console.log('[markLevelCompleted] About to update XP on server with:', {
                                currentXP,
                                completedLevels,
                                completedExams: completedExamsToServer
                            });
                            // Update with both completed levels and exams
                            return window.ConnectionHelper.updateXP(currentXP, completedLevels, completedExamsToServer);
                        })
                        .then(result => {
                            console.log('[markLevelCompleted] Saved to server:', result);
                        })
                        .catch(error => {
                            console.error('[markLevelCompleted] Error saving to server:', error);
                        });
                }
                
                return true;
            }
            
            return false;
        };

        function createConnectingLines(container, cards) {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.classList.add('connecting-line');
            container.appendChild(svg);

            for (let i = 0; i < cards.length - 1; i++) {
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const start = cards[i].getBoundingClientRect();
                const end = cards[i + 1].getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();

                const startX = (start.left + start.right) / 2 - containerRect.left;
                const startY = (start.top + start.bottom) / 2 - containerRect.top;
                const endX = (end.left + end.right) / 2 - containerRect.left;
                const endY = (end.top + end.bottom) / 2 - containerRect.top;

                // Create curved path
                const midY = (startY + endY) / 2;
                const pathData = `M ${startX} ${startY} 
                                C ${startX} ${midY},
                                  ${endX} ${midY},
                                  ${endX} ${endY}`;

                path.setAttribute('d', pathData);

                // Check if this path should be colored (completed)
                const currentCard = cards[i];
                const nextCard = cards[i + 1];
                if (!currentCard.classList.contains('locked') && !nextCard.classList.contains('locked')) {
                    path.classList.add('completed');
                }

                svg.appendChild(path);
            }

            svg.setAttribute('width', '100%');
            svg.setAttribute('height', '100%');
        }

        // Theme functionality
        function initializeTheme() {
            const root = document.documentElement;
            const savedTheme = localStorage.getItem('theme') || 'light';
            root.setAttribute('data-theme', savedTheme);
            
            const themeToggle = document.getElementById('theme-toggle');
            if (themeToggle) {
                themeToggle.checked = savedTheme === 'dark';
            }
            
            const themeIcon = document.querySelector('.theme-btn i');
            if (themeIcon) {
                themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }

        // Utility function to show notifications
        function showNotification(message, isSuccess = true) {
            const notification = document.createElement('div');
            notification.className = 'xp-notification';
            notification.innerHTML = message;
            notification.style.backgroundColor = isSuccess ? '#4CAF50' : '#FF5252';
            notification.style.color = 'white';
            notification.style.padding = '10px 20px';
            notification.style.borderRadius = '4px';
            notification.style.position = 'fixed';
            notification.style.top = '20px';
            notification.style.right = '20px';
            notification.style.zIndex = '1000';
            notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
            notification.style.animation = 'slide-in-right 0.5s forwards';
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transition = 'opacity 0.5s ease';
                setTimeout(() => notification.remove(), 500);
            }, 3000);
        }

        // Modal functions
        window.showAccount = function() {
            const modal = document.getElementById('accountModal');
            modal.style.display = 'block';
        };

        window.showSettings = function() {
            const modal = document.getElementById('settingsModal');
            modal.style.display = 'block';
            
            // Initialize settings from localStorage
            document.getElementById('soundToggle').checked = 
                localStorage.getItem('soundEffects') !== 'false';
            document.getElementById('musicToggle').checked = 
                localStorage.getItem('backgroundMusic') !== 'false';
            document.getElementById('languageSelect').value = 
                localStorage.getItem('language') || 'en';
                
            // Populate user information from auth
            const usernameElement = document.getElementById('settings-username');
            const emailElement = document.getElementById('settings-email');
            
            if (usernameElement && emailElement) {
                if (window.auth && typeof window.auth.getCurrentUser === 'function') {
                    const username = window.auth.getCurrentUser();
                    const email = window.auth.getUserEmail();
                    
                    usernameElement.textContent = username || 'Guest';
                    emailElement.textContent = email || 'Not available';
                } else {
                    // Fallback if auth object not available
                    const username = localStorage.getItem('username');
                    const email = localStorage.getItem('userEmail');
                    
                    usernameElement.textContent = username || 'Guest';
                    emailElement.textContent = email || 'Not available';
                }
            }
        };

        window.closeModal = function(modalId) {
            document.getElementById(modalId).style.display = 'none';
        };

        function toggleTheme() {
            const root = document.documentElement;
            const currentTheme = root.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            root.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            const themeIcon = document.querySelector('.theme-btn i');
            if (themeIcon) {
                themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
            
            const themeToggle = document.getElementById('theme-toggle');
            if (themeToggle) {
                themeToggle.checked = newTheme === 'dark';
            }
        }
        
        // Expose toggle theme to window
        window.toggleTheme = toggleTheme;

        // Test database connection
        function testDatabaseConnection() {
            const dbTestBtn = document.getElementById('dbTestBtn');
            const originalText = dbTestBtn.textContent;
            
            // Show loading state
            dbTestBtn.textContent = 'Testing...';
            dbTestBtn.disabled = true;
            
            // Use ConnectionHelper to test connection
            ConnectionHelper.testConnection()
            .then(data => {
                if (data.success) {
                    dbTestBtn.textContent = '✓ Connected';
                    dbTestBtn.style.backgroundColor = '#4CAF50'; // Green
                    showNotification('Database Connected ✓');
                } else {
                    throw new Error(data.error || 'Unknown error');
                }
            })
            .catch(error => {
                console.error('[Error] Database test failed:', error);
                dbTestBtn.textContent = '✗ Failed';
                dbTestBtn.style.backgroundColor = '#FF5252'; // Red
                showNotification('Database Error: ' + (error.message || 'Connection failed'), false);
            })
            .finally(() => {
                // Re-enable the button after 3 seconds
                setTimeout(() => {
                    dbTestBtn.disabled = false;
                    dbTestBtn.textContent = originalText;
                    dbTestBtn.style.backgroundColor = 'var(--accent-color)';
                }, 3000);
            });
        }

        // Moved function definitions to global script scope
            function renderTopicsWithXP(totalXP) {
                console.log('[Debug] Rendering topics with XP:', totalXP);
                const topicsContainer = document.getElementById('topicsContainer');
                if (!topicsContainer) {
                    console.error('[Error] Missing topicsContainer element');
                    return;
                }
                
                // Create fallback topics data if window.topicsData is not available
                if (!window.topicsData || !Array.isArray(window.topicsData) || window.topicsData.length === 0) {
                    console.warn('[Warn] Topics data not loaded, using fallback data');
                    window.topicsData = [
                        { 
                            id: 1, 
                            title: "Basic Banking", 
                            icon: "🏦",
                            subLevels: [
                                { id: 1.1, title: "Account Types", xpRequired: 0, xpReward: 50 },
                                { id: 1.2, title: "Banking Services", xpRequired: 50, xpReward: 50 },
                                { id: 1.3, title: "Online Banking", xpRequired: 100, xpReward: 50 },
                                { id: 1.4, title: "Final Exam", xpRequired: 150, isExam: true, xpReward: 100 }
                            ]
                        },
                        { 
                            id: 2, 
                            title: "Saving Basics", 
                            icon: "💰",
                            subLevels: [
                                { id: 2.1, title: "Savings Goals", xpRequired: 200, xpReward: 50 },
                                { id: 2.2, title: "Interest Rates", xpRequired: 250, xpReward: 50 },
                                { id: 2.3, title: "Emergency Funds", xpRequired: 300, xpReward: 50 },
                                { id: 2.4, title: "Final Exam", xpRequired: 350, isExam: true, xpReward: 100 }
                            ]
                        }
                    ];
                }

                // DEBUG LOG: Show completed exams before rendering topics
                const examsBeforeRender = JSON.parse(localStorage.getItem('completedExams') || '[]');
                console.log('[DEBUG] Completed exams before rendering topics:', examsBeforeRender);

                topicsContainer.innerHTML = '';

                window.topicsData.forEach(topic => {
                    const topicContainer = document.createElement('div');
                    topicContainer.className = 'topic-container';

                    // Check if this topic is unlocked based on previous topic completion
                    const isTopicLocked = !isTopicUnlocked(topic.id, totalXP);
                    
                    // DEBUG LOG: Show topic lock status
                    console.log(`[DEBUG] Topic ${topic.id}: ${topic.title} - Locked: ${isTopicLocked}`);

                    // Create topic header
                    const topicHeader = document.createElement('div');
                    topicHeader.className = 'topic-header';
                    
                    // Add locked class if topic is locked
                    if (isTopicLocked) {
                        topicHeader.classList.add('locked-topic');
                    }
                    
                    topicHeader.innerHTML = `
                        <div class="level-content">
                            <div class="topic-icon">${isTopicLocked ? '🔒' : topic.icon}</div>
                            <div class="topic-text">
                                <div class="topic-number">Topic ${topic.id}</div>
                                <div class="topic-title">${topic.title}</div>
                                ${isTopicLocked ? '<div class="topic-locked-message">Complete previous topic\'s final exam to unlock</div>' : ''}
                            </div>
                        </div>
                    `;

                    // Create sub-levels container
                    const subLevelsContainer = document.createElement('div');
                    subLevelsContainer.className = 'sub-levels-container';

                    const subLevelCards = [];

                    topic.subLevels.forEach(subLevel => {
                        const subLevelCard = document.createElement('div');
                        // A sublevel is locked if either:
                        // 1. The entire topic is locked, or
                        // 2. The user doesn't have enough XP for this specific sublevel
                        const isLocked = isTopicLocked || totalXP < subLevel.xpRequired;
                        const isCompleted = isLevelCompleted(topic.id, subLevel.id);

                        subLevelCard.className = `sub-level-card ${isLocked ? 'locked' : ''} ${isCompleted ? 'completed' : ''} ${subLevel.isExam ? 'exam-card' : ''}`;

                        let tooltipContent = `
                            <div class="level-tooltip">
                                <div class="tooltip-title">${subLevel.title}</div>
                                <div class="tooltip-overview">${subLevel.overview || 'Learn about this topic'}</div>
                                <div class="tooltip-xp">XP Reward: ${subLevel.xpReward || 50}</div>
                                ${!isLocked ? '<button class="start-lesson-btn">Start Lesson</button>' : ''}
                        `;

                        if (isLocked) {
                            if (isTopicLocked) {
                                tooltipContent += `<div class="tooltip-xp">Complete previous topic's final exam to unlock</div>`;
                            } else {
                                tooltipContent += `<div class="tooltip-xp">XP Required: ${subLevel.xpRequired}</div>`;
                            }
                        }

                        tooltipContent += `</div>`;

                        subLevelCard.innerHTML = `
                            <div class="level-icon">${isLocked ? '🔒' : subLevel.isExam ? '📝' : '📚'}</div>
                            ${tooltipContent}
                        `;

                        if (!isLocked) {
                            const startButton = subLevelCard.querySelector('.start-lesson-btn');
                            if (startButton) {
                                startButton.addEventListener('click', (e) => {
                                    e.stopPropagation();
                                    window.location.href = `loading-screen.html?topic=${topic.id}&sublevel=${subLevel.id}`;
                                });
                            }
                        }

                        subLevelsContainer.appendChild(subLevelCard);
                        subLevelCards.push(subLevelCard);
                    });

                    // Create connecting lines
                    if (subLevelCards.length > 1) {
                        requestAnimationFrame(() => {
                            createConnectingLines(subLevelsContainer, subLevelCards);
                        });
                    }

                    topicContainer.appendChild(topicHeader);
                    topicContainer.appendChild(subLevelsContainer);
                    topicsContainer.appendChild(topicContainer);
                });
            }

            // Use ConnectionHelper to get user XP
            function loadUserXP() {
                // Show loading indicator
                const xpDisplay = document.getElementById('totalXP');
                if (xpDisplay) {
                    xpDisplay.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                }

                ConnectionHelper.getUserXP()
                    .then(data => {
                        console.log('[Debug] XP Data:', data);
                        
                        // DEBUG LOG: Focus specifically on completed exams from server
                        if (data && data.completed_exams) {
                            console.log('[DEBUG] Server returned completed exams:', data.completed_exams);
                        } else {
                            console.log('[DEBUG] No completed exams data from server');
                        }
                        
                        if (data && typeof data.xp !== 'undefined') {
                            const xp = parseInt(data.xp) || 0;
                            if (xpDisplay) {
                                xpDisplay.textContent = xp;
                            }

                            // IMPORTANT: syncCompletedDataFromServer is now responsible for updating
                            // localStorage with completed_exams and completed_levels from the server.
                            // The following blocks that update localStorage are removed from here
                            // to avoid redundant updates and make syncCompletedDataFromServer the
                            // single source of truth for this during the initial load/sync.

                            renderTopicsWithXP(xp);
                            
                            // Update modal XP display
                            const modalXPDisplay = document.getElementById('modalTotalXP');
                            if (modalXPDisplay) {
                                modalXPDisplay.textContent = xp;
                            }
                        } else {
                            console.warn('[Debug] Invalid XP data format:', data);
                            // Show error and use 0 XP
                            if (xpDisplay) {
                                xpDisplay.textContent = '0';
                            }
                            renderTopicsWithXP(0);
                        }
                    })
                    .catch(error => {
                        console.error('[Error] Failed to fetch XP:', error);
                        if (xpDisplay) {
                            xpDisplay.textContent = '0';
                        }
                        renderTopicsWithXP(0);
                    });
            }

        // Define the initialize function
        function initializeTopicsUI() {
            // <<< ADDED DEBUG LOG >>>
            console.log('[DEBUG] Local completedExams:', localStorage.getItem('completedExams'));
            // <<< END ADDED DEBUG LOG >>>

            // Load user XP data which will render topics
            loadUserXP();
        }
        // Main initialization
        document.addEventListener('DOMContentLoaded', async () => {
            console.log('[Debug] DOM Content Loaded');

            // --- RE-APPLYING FIX FOR CLEANLINESS ---
            // 1. Sync data with the server. This function will also call unlockTopics().
            if (typeof syncCompletedDataFromServer === 'function') {
                await syncCompletedDataFromServer();
            } else {
                console.error('CRITICAL: syncCompletedDataFromServer function not found! Progress sync will not work.');
                // Fallback to unlockTopics directly if sync function is missing
                if(typeof unlockTopics === 'function') unlockTopics();
            }

            // 2. Initialize the theme
            initializeTheme();

            // 3. Get and display the username
            const username = localStorage.getItem('username') || 'Guest';
            const usernameDisplay = document.getElementById('username-display');
            if (usernameDisplay) {
                usernameDisplay.textContent = username;
            }

            // 4. Initialize the rest of the UI (like topics)
            initializeTopicsUI();
            // --- END OF FIX ---

            // DEBUG LOG: Display stored completed exams on page load after sync
            const finalStoredExams = JSON.parse(localStorage.getItem('completedExams') || '[]');
            console.log('[DEBUG] Final completedExams in localStorage after sync:', finalStoredExams);
        });
    </script>
    
    <!-- Feedback container -->
    <div id="feedback-container" class="hidden">
        <div id="feedback-text">
            <span class="feedback-message"></span>
            <span class="explanation"></span>
        </div>
        <button id="continue-btn">Continue</button>
        <button id="retry-btn" class="hidden">Try Again</button>
    </div>
</body>
</html>
