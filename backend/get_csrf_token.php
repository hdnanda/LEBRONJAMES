<?php
// Ensure no output before headers
ob_start();

// Include CORS configuration
require_once __DIR__ . '/cors.php';

// Set JSON content type
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Include required files
require_once 'config.php';
require_once 'functions.php';

// Function to send JSON response and exit
function send_json_response($success, $message, $data = null, $status_code = 200) {
    http_response_code($status_code);
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit();
}

try {
    // Start secure session
    secure_session_start();
    
    // Log session information for debugging
    error_log('Session ID: ' . session_id());
    error_log('Session Status: ' . session_status());
    error_log('Current Session Data: ' . print_r($_SESSION, true));

    // Generate a new token if one doesn't exist
    if (!isset($_SESSION['csrf_token']) || empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        error_log('Generated new CSRF token: ' . $_SESSION['csrf_token']);
    } else {
        error_log('Using existing CSRF token: ' . $_SESSION['csrf_token']);
    }

    // Return the token
    $response_data = [
        'token' => $_SESSION['csrf_token'],
        'timestamp' => time(),
        'session_id' => session_id()
    ];
    
    error_log('Sending CSRF response: ' . print_r($response_data, true));
    send_json_response(true, 'CSRF token generated successfully', $response_data);

} catch (Exception $e) {
    error_log('CSRF Token Error: ' . $e->getMessage());
    error_log('Stack trace: ' . $e->getTraceAsString());
    send_json_response(false, 'Failed to generate CSRF token', null, 500);
} finally {
    // Clean output buffer
    ob_end_flush();
}
?> 
