<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include CORS configuration
require_once 'cors.php';

// Include required files
require_once 'config.php';
require_once 'functions.php';

try {
    // Set JSON content type
    header('Content-Type: application/json');

    // Start secure session
    secure_session_start();

    // Generate CSRF token if not exists
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }

    // Return the token
    echo json_encode([
        'success' => true,
        'token' => $_SESSION['csrf_token']
    ]);

} catch (Exception $e) {
    error_log('CSRF token generation error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to generate CSRF token'
    ]);
}
?> 