<?php
// Enable error logging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');

// Clean any existing output buffers
while (ob_get_level()) {
    ob_end_clean();
}

// Include required files
require_once 'config.php';
require_once 'functions.php';

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://financial-frontend-3xkp.onrender.com');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token, Authorization, Origin, Accept');

try {
    // Start secure session
    secure_session_start();
    
    // Log session details for debugging
    error_log('CSRF Token Request - Session Details:');
    error_log('Session ID: ' . session_id());
    error_log('Session Status: ' . session_status());
    error_log('Current Session Data: ' . print_r($_SESSION, true));
    
    // Generate new token if it doesn't exist or is expired
    if (!isset($_SESSION['csrf_token']) || !isset($_SESSION['csrf_token_time']) || 
        (time() - $_SESSION['csrf_token_time']) > 3600) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        $_SESSION['csrf_token_time'] = time();
        error_log('Generated new CSRF token: ' . $_SESSION['csrf_token']);
    } else {
        error_log('Using existing CSRF token: ' . $_SESSION['csrf_token']);
    }
    
    // Create response
    $response = [
        'success' => true,
        'message' => 'CSRF token retrieved successfully',
        'data' => [
            'token' => $_SESSION['csrf_token'],
            'session_id' => session_id()
        ]
    ];
    
    error_log('Sending CSRF token response: ' . json_encode($response));
    echo json_encode($response);
    
} catch (Exception $e) {
    error_log('CSRF Token Error: ' . $e->getMessage());
    error_log('Stack trace: ' . $e->getTraceAsString());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to generate CSRF token',
        'data' => null
    ]);
}
?> 
