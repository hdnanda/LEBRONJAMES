<?php
// Disable output buffering completely
while (ob_get_level()) {
    ob_end_clean();
}

// Set error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include required files
require_once __DIR__ . '/cors.php';
require_once 'config.php';
require_once 'functions.php';

// Set JSON content type and other headers
header('Content-Type: application/json');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Cache-Control: post-check=0, pre-check=0', false);
header('Pragma: no-cache');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

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
    // Start session if not already started
    if (session_status() === PHP_SESSION_NONE) {
        // Set session cookie parameters
        session_set_cookie_params([
            'lifetime' => 0,
            'path' => '/',
            'domain' => '',
            'secure' => true,
            'httponly' => true,
            'samesite' => 'None'
        ]);
        session_start();
    }

    // Log debugging information
    error_log("Session status: " . session_status());
    error_log("Session ID: " . session_id());
    error_log("Session data: " . print_r($_SESSION, true));

    // Generate new CSRF token if needed
    if (!isset($_SESSION['csrf_token']) || empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }

    // Prepare response
    $response = [
        'success' => true,
        'message' => 'CSRF token retrieved successfully',
        'data' => [
            'token' => $_SESSION['csrf_token'],
            'session_id' => session_id()
        ]
    ];

    // Log the response for debugging
    error_log("Sending response: " . json_encode($response));

    // Send response
    echo json_encode($response);
    exit();

} catch (Exception $e) {
    error_log("Error in get_csrf_token.php: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());

    $error_response = [
        'success' => false,
        'message' => 'Failed to generate CSRF token',
        'error' => $e->getMessage(),
        'debug' => [
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ]
    ];

    http_response_code(500);
    echo json_encode($error_response);
    exit();
}
?> 
