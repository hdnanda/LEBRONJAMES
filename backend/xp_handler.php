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

// Create directory if it doesn't exist
if (!file_exists($userDataDir)) {
    mkdir($userDataDir, 0755, true);
}

// Default user data
$userData = [
    'username' => $username,
    'xp' => 0,
    'level' => 1,
    'completed_levels' => [],
    'completed_exams' => [],
    'last_completed_topic_exam' => 0,
    'last_updated' => date('Y-m-d H:i:s')
];

// Process request based on method
switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        // Retrieve user data if it exists
        if (file_exists($userDataFile)) {
            $fileData = json_decode(file_get_contents($userDataFile), true);
            // Merge with defaults to ensure new fields are present
            $userData = array_merge($userData, $fileData);
        }
        
        // Return response
        echo json_encode([
            'success' => true,
            'xp' => (int)$userData['xp'],
            'level' => (int)$userData['level'],
            'completed_levels' => $userData['completed_levels'] ?? [],
            'completed_exams' => $userData['completed_exams'] ?? [],
            'last_completed_topic_exam' => (int)($userData['last_completed_topic_exam'] ?? 0),
            'message' => 'User data retrieved'
        ]);
        break;
        
    case 'POST':
        // Update user data
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        
        // Validate input for xp
        if (!isset($data['xp']) || !is_numeric($data['xp'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid XP value']);
            exit;
        }
        
        // Get existing data if it exists
        if (file_exists($userDataFile)) {
            $existingData = json_decode(file_get_contents($userDataFile), true);
            if (is_array($existingData)) {
                $userData = array_merge($userData, $existingData); // Merge existing with defaults first
            }
        }
        
        // Update with new data
        $userData['xp'] = (int)$data['xp'];
        $userData['last_updated'] = date('Y-m-d H:i:s');
        
        // Update completed levels if provided
        if (isset($data['completed_levels']) && is_array($data['completed_levels'])) {
            $userData['completed_levels'] = $data['completed_levels'];
        }
        
        // Update completed_exams if provided (keeping for now, though new logic won't rely on it)
        if (isset($data['completed_exams']) && is_array($data['completed_exams'])) {
            $userData['completed_exams'] = $data['completed_exams'];
        }

        // Update last_completed_topic_exam if provided
        if (isset($data['last_completed_topic_exam']) && is_numeric($data['last_completed_topic_exam'])) {
            $userData['last_completed_topic_exam'] = (int)$data['last_completed_topic_exam'];
        }
        
        // Calculate level based on XP
        $xpThresholds = [
            1 => 0,
            2 => 100,
            3 => 250,
            4 => 450,
            5 => 700
        ];
        
        $currentLevel = 1; // Renamed to avoid conflict with $userData['level']
        foreach ($xpThresholds as $lvl => $threshold) {
            if ($userData['xp'] >= $threshold) {
                $currentLevel = $lvl;
            }
        }
        $userData['level'] = $currentLevel; // Assign calculated level
        
        // Save to file
        file_put_contents($userDataFile, json_encode($userData, JSON_PRETTY_PRINT));
        
        // Return response
        echo json_encode([
            'success' => true,
            'xp' => (int)$userData['xp'],
            'level' => (int)$userData['level'],
            'completed_levels' => $userData['completed_levels'] ?? [],
            'completed_exams' => $userData['completed_exams'] ?? [], // Kept for now
            'last_completed_topic_exam' => (int)($userData['last_completed_topic_exam'] ?? 0),
            'message' => 'User data updated'
        ]);
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        break;
}
?> 
