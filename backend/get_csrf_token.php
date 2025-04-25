<?php
// Ensure no output has been sent yet
if (headers_sent($filename, $linenum)) {
    error_log("Headers already sent in $filename on line $linenum");
}

// Disable output buffering completely
while (ob_get_level()) {
    ob_end_clean();
}

// Set error reporting
error_reporting(E_ALL);
ini_set('display_errors', 0); // Disable displaying errors directly
ini_set('log_errors', 1); // Enable error logging

// Log the start of the script
error_log("Starting get_csrf_token.php execution");

try {
    // Set headers first
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Cache-Control: post-check=0, pre-check=0', false);
    header('Pragma: no-cache');

    // Include required files
    require_once __DIR__ . '/cors.php';
    require_once 'config.php';
    require_once 'functions.php';

    error_log("Files included successfully");

    // Start session if not already started
    if (session_status() === PHP_SESSION_NONE) {
        $sessionParams = [
            'lifetime' => 0,
            'path' => '/',
            'domain' => '',
            'secure' => true,
            'httponly' => true,
            'samesite' => 'None'
        ];
        session_set_cookie_params($sessionParams);
        session_start();
        error_log("Session started with parameters: " . print_r($sessionParams, true));
    }

    // Generate new CSRF token if needed
    if (!isset($_SESSION['csrf_token']) || empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        error_log("New CSRF token generated");
    }

    // Log session and token info
    error_log("Session ID: " . session_id());
    error_log("CSRF Token: " . $_SESSION['csrf_token']);

    // Prepare response
    $response = [
        'success' => true,
        'message' => 'CSRF token retrieved successfully',
        'data' => [
            'token' => $_SESSION['csrf_token'],
            'session_id' => session_id()
        ]
    ];

    error_log("Preparing to send response: " . json_encode($response));

    // Send response
    echo json_encode($response);
    exit();

} catch (Exception $e) {
    error_log("Error in get_csrf_token.php: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());

    $error_response = [
        'success' => false,
        'message' => 'Failed to generate CSRF token',
        'error' => $e->getMessage()
    ];

    if (!headers_sent()) {
        http_response_code(500);
    }
    echo json_encode($error_response);
    exit();
}
?> 
