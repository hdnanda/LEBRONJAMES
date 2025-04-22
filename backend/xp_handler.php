<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Ensure no output before headers
ob_start();

// Set CORS headers for Render
header('Access-Control-Allow-Origin: https://financial-literacy-app.onrender.com');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Max-Age: 1728000');
header('Cache-Control: no-store, no-cache, must-revalidate');
header('Content-Type: application/json');

// Debug logging function
function debug_log($message, $data = null) {
    $log = date('Y-m-d H:i:s') . " - " . $message;
    if ($data !== null) {
        $log .= " - Data: " . json_encode($data);
    }
    error_log($log);
}

// Enhanced debug logging for request details
debug_log("XP Handler Request Details", [
    'method' => $_SERVER['REQUEST_METHOD'],
    'uri' => $_SERVER['REQUEST_URI'],
    'query_string' => $_SERVER['QUERY_STRING'] ?? 'none',
    'content_type' => $_SERVER['CONTENT_TYPE'] ?? 'none',
    'raw_input' => file_get_contents('php://input'),
    'session_id' => session_id(),
    'session_data' => isset($_SESSION) ? array_keys($_SESSION) : 'session not started'
]);

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config.php';
require_once 'functions.php';

// Start secure session
secure_session_start();

debug_log("XP Handler accessed", [
    'method' => $_SERVER['REQUEST_METHOD'],
    'session_id' => session_id(),
    'user_id' => $_SESSION['user_id'] ?? 'not set'
]);

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    debug_log("User not authenticated");
    http_response_code(401);
    echo json_encode(['error' => 'User not authenticated']);
    exit;
}

// Get database connection
$conn = get_db_connection();
if (!$conn) {
    debug_log("Database connection failed");
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

// Handle different request methods
switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        debug_log("GET request - Fetching XP for user", ['user_id' => $_SESSION['user_id']]);
        
        // Get current XP and level with all progress data
        $stmt = $conn->prepare("SELECT total_xp, current_level, completed_levels, completed_exams, learning_progress 
                               FROM user_progress WHERE user_id = ?");
        $stmt->bind_param("i", $_SESSION['user_id']);
        
        if (!$stmt->execute()) {
            debug_log("Failed to execute XP fetch query", ['error' => $stmt->error]);
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch XP']);
            exit;
        }
        
        $result = $stmt->get_result();
        
        if ($row = $result->fetch_assoc()) {
            debug_log("XP fetched successfully", [
                'total_xp' => $row['total_xp'],
                'current_level' => $row['current_level'],
                'completed_levels' => $row['completed_levels'],
                'completed_exams' => $row['completed_exams']
            ]);
            echo json_encode([
                'success' => true,
                'xp' => (int)$row['total_xp'],
                'level' => (int)$row['current_level'],
                'completed_levels' => json_decode($row['completed_levels'] ?: '[]'),
                'completed_exams' => json_decode($row['completed_exams'] ?: '[]'),
                'learning_progress' => json_decode($row['learning_progress'] ?: '{}')
            ]);
        } else {
            debug_log("No XP record found, creating default");
            // If no record exists, create one with default values
            $stmt = $conn->prepare("INSERT INTO user_progress 
                (user_id, total_xp, current_level, completed_levels, completed_exams, learning_progress) 
                VALUES (?, 0, 1, '[]', '[]', '{}')");
            $stmt->bind_param("i", $_SESSION['user_id']);
            $stmt->execute();
            echo json_encode([
                'success' => true,
                'xp' => 0,
                'level' => 1,
                'completed_levels' => [],
                'completed_exams' => [],
                'learning_progress' => new stdClass()
            ]);
        }
        break;

    case 'POST':
        $input = file_get_contents('php://input');
        debug_log("POST request - Updating XP", ['raw_input' => $input]);
        
        $data = json_decode($input, true);
        if (!isset($data['xp']) || !is_numeric($data['xp'])) {
            debug_log("Invalid XP value received", ['data' => $data]);
            http_response_code(400);
            echo json_encode(['error' => 'Invalid XP value']);
            exit;
        }

        $xp = (int)$data['xp'];
        debug_log("Processing XP update", ['new_xp' => $xp]);
        
        // Calculate current level based on XP
        $level = 1;
        $xpThresholds = [
            1 => 0,
            2 => 100,
            3 => 250,
            4 => 450,
            5 => 700
        ];
        
        foreach ($xpThresholds as $lvl => $threshold) {
            if ($xp >= $threshold) {
                $level = $lvl;
            }
        }
        
        // Prepare the progress data
        $completed_levels = isset($data['completed_levels']) ? json_encode($data['completed_levels']) : '[]';
        $completed_exams = isset($data['completed_exams']) ? json_encode($data['completed_exams']) : '[]';
        $learning_progress = isset($data['learning_progress']) ? json_encode($data['learning_progress']) : '{}';
        
        // Check if user_progress record exists
        $check_stmt = $conn->prepare("SELECT id FROM user_progress WHERE user_id = ?");
        $check_stmt->bind_param("i", $_SESSION['user_id']);
        $check_stmt->execute();
        $check_result = $check_stmt->get_result();
        
        if ($check_result->num_rows === 0) {
            debug_log("Creating new user_progress record", ['user_id' => $_SESSION['user_id']]);
            // Insert new record
            $insert_stmt = $conn->prepare("INSERT INTO user_progress 
                (user_id, total_xp, current_level, completed_levels, completed_exams, learning_progress) 
                VALUES (?, ?, ?, ?, ?, ?)");
            $insert_stmt->bind_param("iiisss", 
                $_SESSION['user_id'], 
                $xp, 
                $level, 
                $completed_levels,
                $completed_exams,
                $learning_progress
            );
            
            if ($insert_stmt->execute()) {
                debug_log("New user_progress record created successfully");
            } else {
                debug_log("Failed to create user_progress record", ['error' => $insert_stmt->error]);
                http_response_code(500);
                echo json_encode(['error' => 'Failed to create user progress record']);
                exit;
            }
        } else {
            debug_log("Updating existing user_progress record", ['user_id' => $_SESSION['user_id']]);
            // Update existing record
            $update_stmt = $conn->prepare("UPDATE user_progress 
                SET total_xp = ?, current_level = ?, 
                    completed_levels = COALESCE(?, completed_levels),
                    completed_exams = COALESCE(?, completed_exams),
                    learning_progress = COALESCE(?, learning_progress)
                WHERE user_id = ?");
            $update_stmt->bind_param("iisssi", 
                $xp, 
                $level, 
                $completed_levels,
                $completed_exams,
                $learning_progress,
                $_SESSION['user_id']
            );
            
            if ($update_stmt->execute()) {
                debug_log("User_progress record updated successfully", [
                    'affected_rows' => $update_stmt->affected_rows
                ]);
            } else {
                debug_log("Failed to update user_progress record", ['error' => $update_stmt->error]);
                http_response_code(500);
                echo json_encode(['error' => 'Failed to update user progress record']);
                exit;
            }
        }
        
        // Return success response
        echo json_encode([
            'success' => true,
            'xp' => $xp,
            'level' => $level,
            'completed_levels' => json_decode($completed_levels),
            'completed_exams' => json_decode($completed_exams),
            'learning_progress' => json_decode($learning_progress)
        ]);
        break;

    default:
        debug_log("Invalid request method", ['method' => $_SERVER['REQUEST_METHOD']]);
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}

$conn->close();
?> 