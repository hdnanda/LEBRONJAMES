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
    // Log request details
    error_log('GET CSRF Token Request:');
    error_log('Headers: ' . print_r(getallheaders(), true));
    error_log('Session ID: ' . session_id());
    error_log('Session Data: ' . print_r($_SESSION, true));

    // Start session if not already started
    if (session_status() === PHP_SESSION_NONE) {
        error_log('Starting new session');
        session_start();
    }

    // Ensure we have a CSRF token
    if (!isset($_SESSION['csrf_token']) || empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        error_log('Generated new CSRF token: ' . $_SESSION['csrf_token']);
    }

    // Prepare response data
    $responseData = [
        'success' => true,
        'message' => 'CSRF token retrieved successfully',
        'data' => [
            'token' => $_SESSION['csrf_token'],
            'session_id' => session_id()
        ]
    ];
    
    error_log('Preparing to send response: ' . json_encode($responseData));
    
    // Ensure headers are set correctly
    if (!headers_sent()) {
        header('Content-Type: application/json');
    } else {
        error_log('Headers already sent before JSON response');
    }
    
    // Send response
    echo json_encode($responseData);
    error_log('Response sent successfully');

} catch (Exception $e) {
    error_log('Error in get_csrf_token.php: ' . $e->getMessage());
    error_log('Stack trace: ' . $e->getTraceAsString());
    
    $errorResponse = [
        'success' => false,
        'message' => 'Failed to generate CSRF token',
        'error' => $e->getMessage()
    ];
    
    if (!headers_sent()) {
        http_response_code(500);
        header('Content-Type: application/json');
    }
    
    echo json_encode($errorResponse);
} finally {
    // Clean output buffer if it's active
    if (ob_get_level() > 0) {
        ob_end_flush();
    }
}
?> 
