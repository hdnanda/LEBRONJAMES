<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set CORS headers for browser access
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token, Accept, X-Username');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get username from header
$headers = function_exists('getallheaders') ? getallheaders() : [];
$username = isset($headers['X-Username']) ? $headers['X-Username'] : 'test';

// Simple file-based storage - each user gets their own JSON file
$userDataDir = __DIR__ . '/user_data';
$userDataFile = $userDataDir . '/' . preg_replace('/[^a-zA-Z0-9_-]/', '', $username) . '.json';

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
    'last_updated' => date('Y-m-d H:i:s')
];

// Process request based on method
switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        // Retrieve user data if it exists
        if (file_exists($userDataFile)) {
            $userData = json_decode(file_get_contents($userDataFile), true);
        }
        
        // Return response
        echo json_encode([
            'success' => true,
            'xp' => (int)$userData['xp'],
            'level' => (int)$userData['level'],
            'completed_levels' => $userData['completed_levels'],
            'completed_exams' => $userData['completed_exams'],
            'message' => 'User data retrieved'
        ]);
        break;
        
    case 'POST':
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
        
        // Update completed levels and exams if provided
        if (isset($data['completed_levels']) && is_array($data['completed_levels'])) {
            $userData['completed_levels'] = $data['completed_levels'];
        }
        
        if (isset($data['completed_exams']) && is_array($data['completed_exams'])) {
            $userData['completed_exams'] = $data['completed_exams'];
        }
        
        // Save to file
        file_put_contents($userDataFile, json_encode($userData, JSON_PRETTY_PRINT));
        
        // Return response
        echo json_encode([
            'success' => true,
            'xp' => (int)$userData['xp'],
            'level' => (int)$userData['level'],
            'completed_levels' => $userData['completed_levels'],
            'completed_exams' => $userData['completed_exams'],
            'message' => 'User data updated'
        ]);
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        break;
}
?> 