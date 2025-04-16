<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include CORS configuration
require_once 'cors.php';

// Handle OPTIONS request first
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Include required files
require_once 'config.php';
require_once 'functions.php';

// Debug logging function
function debug_log($message, $data = null) {
    $log = date('Y-m-d H:i:s') . " - " . $message;
    if ($data !== null) {
        $log .= " - Data: " . json_encode($data);
    }
    error_log($log);
}

try {
    // Set JSON content type
    header('Content-Type: application/json');

    // Start secure session
    secure_session_start();
    
    // Debug session info
    debug_log("CSRF Token Request", [
        'session_id' => session_id(),
        'session_status' => session_status(),
        'session_data' => isset($_SESSION) ? array_keys($_SESSION) : 'session not started'
    ]);

    // Generate CSRF token if not exists
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        debug_log("Generated new CSRF token");
    } else {
        debug_log("Using existing CSRF token");
    }

    // Return the token with additional security headers
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    header('X-XSS-Protection: 1; mode=block');

    $response = [
        'success' => true,
        'token' => $_SESSION['csrf_token']
    ];
    
    debug_log("CSRF Token Response", $response);
    echo json_encode($response);

} catch (Exception $e) {
    debug_log('CSRF token generation error', ['error' => $e->getMessage()]);
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to generate CSRF token'
    ]);
}
?> 