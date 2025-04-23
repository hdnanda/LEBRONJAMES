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

    // Generate a new token if one doesn't exist or is invalid
    if (!isset($_SESSION['csrf_token']) || empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }

    // Verify the token is valid
    if (!preg_match('/^[a-f0-9]{64}$/', $_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }

    // Return the token
    send_json_response(true, 'CSRF token generated successfully', [
        'token' => $_SESSION['csrf_token'],
        'timestamp' => time()
    ]);

} catch (Exception $e) {
    error_log('CSRF Token Error: ' . $e->getMessage());
    send_json_response(false, 'Failed to generate CSRF token', null, 500);
} finally {
    // Clean output buffer
    ob_end_flush();
}
?> 
