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

// Default user data - this is a dummy version so we just return mock data
$userData = [
    'username' => $username,
    'xp' => 100,
    'level' => 2,
    'completed_levels' => [1],
    'completed_exams' => [],
    'last_updated' => date('Y-m-d H:i:s')
];

// Process request based on method
switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        // Return mock response
        echo json_encode([
            'success' => true,
            'xp' => (int)$userData['xp'],
            'level' => (int)$userData['level'],
            'completed_levels' => $userData['completed_levels'],
            'completed_exams' => $userData['completed_exams'],
            'message' => 'User data retrieved from dummy endpoint'
        ]);
        break;
        
    case 'POST':
        // Parse input data
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        
        // Validate input
        if (!isset($data['xp']) || !is_numeric($data['xp'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid XP value']);
            exit;
        }
        
        // Update with new data (but we don't actually store it in this dummy version)
        $userData['xp'] = (int)$data['xp'];
        
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
        
        // Return response
        echo json_encode([
            'success' => true,
            'xp' => (int)$userData['xp'],
            'level' => (int)$userData['level'],
            'completed_levels' => $userData['completed_levels'],
            'completed_exams' => $userData['completed_exams'],
            'message' => 'User data updated by dummy endpoint'
        ]);
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        break;
}
?> 
