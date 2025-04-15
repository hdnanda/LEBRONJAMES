<?php
// Ensure no output before headers
ob_start();

// Include CORS configuration first
require_once 'cors.php';

// Include other required files
require_once 'config.php';
require_once 'functions.php';

// Set JSON content type
header('Content-Type: application/json');

try {
    // Start secure session
    secure_session_start();

    // Generate CSRF token if not exists
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }

    // Return token
    echo json_encode([
        'success' => true,
        'token' => $_SESSION['csrf_token']
    ]);
} catch (Exception $e) {
    error_log('CSRF token error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to generate CSRF token'
    ]);
}
?> 