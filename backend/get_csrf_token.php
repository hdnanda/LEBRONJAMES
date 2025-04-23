<?php
require_once __DIR__ . '/cors.php';
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set JSON content type
header('Content-Type: application/json');

// Start session directly if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

try {
    // Generate a new token if one doesn't exist or is invalid
    if (!isset($_SESSION['csrf_token']) || empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }

    // Verify the token is valid
    if (!preg_match('/^[a-f0-9]{64}$/', $_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }

    // Return the token
    echo json_encode([
        'success' => true,
        'token' => $_SESSION['csrf_token'],
        'timestamp' => time()
    ]);

} catch (Exception $e) {
    error_log('CSRF Token Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to generate CSRF token',
        'error' => $e->getMessage()
    ]);
}
?> 
