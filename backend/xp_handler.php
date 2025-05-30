<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set CORS headers for browser access
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token, Accept');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get username from query parameter, POST data, or default to 'test'
// Try GET parameter first
if (isset($_GET['username'])) {
    $username = $_GET['username'];
} else {
    // Try POST data
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    $username = isset($data['username']) ? $data['username'] : 'test';
}

// Sanitize username to prevent directory traversal or invalid filenames
$username = preg_replace('/[^a-zA-Z0-9_-]/', '', $username);

// Simple file-based storage - each user gets their own JSON file
$userDataDir = __DIR__ . '/user_data';
$userDataFile = $userDataDir . '/' . $username . '.json';

// Create directory if it doesn't exist - moved initial check for POST later
// if (!file_exists($userDataDir)) {
//     mkdir($userDataDir, 0755, true);
// }

// Default user data
$userData = [
    'username' => $username,
    'xp' => 0,
    'level' => 1,
    'completed_levels' => [],
    'completed_exams' => [],
    'last_updated' => date('Y-m-d H:i:s')
];

// Process request based on method
switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        // $userData already holds default values.
        // Retrieve user data from file if it exists.
        if (file_exists($userDataFile)) {
            $fileContents = file_get_contents($userDataFile);
            $fileData = json_decode($fileContents, true);

            // Check if decoding was successful and it's an array
            if (is_array($fileData)) {
                // Merge data from file into the default $userData structure.
                // Keys in $fileData will overwrite corresponding keys in $userData.
                // Keys present in $userData but not in $fileData will be preserved.
                $userData = array_merge($userData, $fileData);
            }
            // Optional: Log error or handle case where file exists but JSON is invalid
            // else { error_log("Invalid JSON in user data file: " . $userDataFile); }
        }
        
        // Ensure essential fields are present and correctly typed for the response.
        // This acts as a safeguard, especially if file data is incomplete or from an older version.
        $response_xp = isset($userData['xp']) ? (int)$userData['xp'] : 0;
        $response_level = isset($userData['level']) ? (int)$userData['level'] : 1;
        $response_completed_levels = isset($userData['completed_levels']) && is_array($userData['completed_levels']) ? $userData['completed_levels'] : [];
        $response_completed_exams = isset($userData['completed_exams']) && is_array($userData['completed_exams']) ? $userData['completed_exams'] : [];

        // Return response
        echo json_encode([
            'success' => true,
            'xp' => $response_xp,
            'level' => $response_level,
            'completed_levels' => $response_completed_levels,
            'completed_exams' => $response_completed_exams,
            'message' => 'User data retrieved'
        ]);
        break;
        
    case 'POST':
        // Check user_data directory status before proceeding
        if (!file_exists($userDataDir)) {
            if (!mkdir($userDataDir, 0755, true)) {
                http_response_code(500);
                echo json_encode([
                    'success' => false, 
                    'error' => 'Failed to create user data directory.',
                    'message' => 'Server configuration error: Cannot create data storage.'
                ]);
                exit;
            }
        }
        if (!is_writable($userDataDir)) {
            http_response_code(500);
            echo json_encode([
                'success' => false, 
                'error' => 'User data directory is not writable.',
                'message' => 'Server configuration error: Cannot write to data storage.'
            ]);
            exit;
        }

        // Update user data
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        
        // Validate input
        if (!isset($data['xp']) || !is_numeric($data['xp'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid XP value']);
            exit;
        }
        
        // Get existing data if it exists
        if (file_exists($userDataFile)) {
            $existingData = json_decode(file_get_contents($userDataFile), true);
            if (is_array($existingData)) {
                $userData = array_merge($userData, $existingData);
            }
        }
        
        // Update with new data
        $userData['xp'] = (int)$data['xp'];
        $userData['last_updated'] = date('Y-m-d H:i:s');
        
        // Calculate level based on XP
        $xpThresholds = [
            1 => 0,
            2 => 100,
            3 => 250,
            4 => 450,
            5 => 700
        ];
        
        foreach ($xpThresholds as $lvl => $threshold) {
            if ($userData['xp'] >= $threshold) {
                $userData['level'] = $lvl;
            }
        }
        
        // Ensure existing arrays are initialized if not present from file
        if (!isset($userData['completed_levels']) || !is_array($userData['completed_levels'])) {
            $userData['completed_levels'] = [];
        }
        if (!isset($userData['completed_exams']) || !is_array($userData['completed_exams'])) {
            $userData['completed_exams'] = [];
        }

        // Merge completed_levels
        if (isset($data['completed_levels']) && is_array($data['completed_levels'])) {
            $existingLevelsMap = [];
            foreach ($userData['completed_levels'] as $level) {
                if (isset($level['topicId']) && isset($level['subLevelId'])) {
                    $key = $level['topicId'] . '-' . $level['subLevelId'];
                    $existingLevelsMap[$key] = $level;
                }
            }

            foreach ($data['completed_levels'] as $newLevel) {
                if (isset($newLevel['topicId']) && isset($newLevel['subLevelId'])) {
                    $key = $newLevel['topicId'] . '-' . $newLevel['subLevelId'];
                    if (!isset($existingLevelsMap[$key])) {
                        // Add new level if it doesn't exist
                        $userData['completed_levels'][] = $newLevel;
                    } else {
                        // Optionally, update timestamp if new one is later
                        if (isset($newLevel['timestamp']) && isset($existingLevelsMap[$key]['timestamp'])) {
                            if ($newLevel['timestamp'] > $existingLevelsMap[$key]['timestamp']) {
                                // Find and update the existing level's timestamp
                                foreach ($userData['completed_levels'] as &$existingLvl) {
                                    if (isset($existingLvl['topicId']) && isset($existingLvl['subLevelId']) &&
                                        $existingLvl['topicId'] == $newLevel['topicId'] && 
                                        $existingLvl['subLevelId'] == $newLevel['subLevelId']) {
                                        $existingLvl['timestamp'] = $newLevel['timestamp'];
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        
        // Merge completed_exams
        if (isset($data['completed_exams']) && is_array($data['completed_exams'])) {
            // Merge new exams with existing ones and ensure uniqueness
            $mergedExams = array_merge($userData['completed_exams'], $data['completed_exams']);
            $userData['completed_exams'] = array_values(array_unique($mergedExams));
        }
        
        // Save to file
        $writeSuccess = file_put_contents($userDataFile, json_encode($userData, JSON_PRETTY_PRINT));
        
        if ($writeSuccess === false) {
            // Log error server-side (optional, not implemented here)
            // Return a specific error response to the client
            http_response_code(500); // Internal Server Error
            echo json_encode([
                'success' => false,
                'error' => 'Failed to save user data to file.',
                'message' => 'User data update failed during file write.',
                // Optionally include the data it attempted to save for debugging by the client
                'attempted_data' => $userData 
            ]);
        } else {
            // Return success response
            echo json_encode([
                'success' => true,
                'xp' => (int)$userData['xp'],
                'level' => (int)$userData['level'],
                'completed_levels' => $userData['completed_levels'],
                'completed_exams' => $userData['completed_exams'],
                'message' => 'User data updated'
            ]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        break;
}
?> 
