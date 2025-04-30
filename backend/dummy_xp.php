<?php
// Include CORS headers
require_once 'cors.php';

// Start a session
session_start();

// Ensure user is "logged in" for testing
if (!isset($_SESSION['user_id'])) {
    $_SESSION['user_id'] = 1;
    $_SESSION['username'] = 'test_user';
}

// Handle different request methods
switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        // Get stored XP from session or cookie
        $xp = isset($_SESSION['user_xp']) ? $_SESSION['user_xp'] : 100;
        $completedLevels = isset($_SESSION['completed_levels']) ? $_SESSION['completed_levels'] : [];
        
        // Return success response
        echo json_encode([
            'success' => true,
            'xp' => $xp,
            'level' => calculateLevel($xp),
            'completed_levels' => $completedLevels,
            'completed_exams' => [],
            'learning_progress' => new stdClass()
        ]);
        break;

    case 'POST':
        // Get XP data from request
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        
        if (!isset($data['xp']) || !is_numeric($data['xp'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid XP value']);
            exit;
        }
        
        // Store the XP in session
        $xp = (int)$data['xp'];
        $_SESSION['user_xp'] = $xp;
        
        // Store completed levels if provided
        if (isset($data['completed_levels'])) {
            $_SESSION['completed_levels'] = $data['completed_levels'];
        }
        
        // Return success response
        echo json_encode([
            'success' => true,
            'xp' => $xp,
            'level' => calculateLevel($xp),
            'message' => 'XP updated successfully'
        ]);
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}

// Helper function to calculate level based on XP
function calculateLevel($xp) {
    $levels = [
        1 => 0,
        2 => 100,
        3 => 250,
        4 => 450,
        5 => 700
    ];
    
    $level = 1;
    foreach ($levels as $lvl => $threshold) {
        if ($xp >= $threshold) {
            $level = $lvl;
        }
    }
    
    return $level;
}
?> 