<?php
// Disable error display
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Include configuration
require_once 'config.php';

// Set CORS headers using environment variable
header('Access-Control-Allow-Origin: ' . $allowed_origin);
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');
header('Access-Control-Allow-Credentials: true');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

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

    // Return token
    echo json_encode([
        'success' => true,
        'token' => $_SESSION['csrf_token']
    ]);
} catch (Exception $e) {
    error_log('CSRF token error: ' . $e->getMessage());
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Failed to generate CSRF token'
    ]);
}
?> 