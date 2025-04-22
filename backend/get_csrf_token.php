<?php
require_once __DIR__ . '/cors.php';
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Log all requests to this endpoint
error_log("CSRF Token Endpoint accessed - Method: " . $_SERVER['REQUEST_METHOD'] . ", Origin: " . ($_SERVER['HTTP_ORIGIN'] ?? 'No Origin'));

// Handle OPTIONS request first
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    error_log("OPTIONS request received");
    http_response_code(200);
    exit();
}

// Include required files
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/functions.php';

// Debug logging function
function debug_log($message, $data = null) {
    $log = date('Y-m-d H:i:s') . " - " . $message;
    if ($data !== null) {
        $log .= " - Data: " . json_encode($data);
    }
    error_log($log);
}

try {
    // Set JSON content type
    header('Content-Type: application/json');

    // Start secure session
    secure_session_start();
    
    // Debug session info
    debug_log("CSRF Token Request - Full Server Info", [
        'session_id' => session_id(),
        'session_status' => session_status(),
        'session_data' => isset($_SESSION) ? array_keys($_SESSION) : 'session not started',
        'request_method' => $_SERVER['REQUEST_METHOD'],
        'http_origin' => $_SERVER['HTTP_ORIGIN'] ?? 'No Origin',
        'request_uri' => $_SERVER['REQUEST_URI'],
        'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown'
    ]);

    // Check if session is properly started
    if (session_status() !== PHP_SESSION_ACTIVE) {
        throw new Exception('Session not active - Status: ' . session_status());
    }

    // Generate a new token if one doesn't exist
    if (!isset($_SESSION['csrf_token']) || empty($_SESSION['csrf_token'])) {
        debug_log("Generating new CSRF token");
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }

    // Return the token with additional security headers
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    header('X-XSS-Protection: 1; mode=block');

    $response = [
        'success' => true,
        'token' => $_SESSION['csrf_token']
    ];
    
    debug_log("CSRF Token Response", $response);
    echo json_encode($response);

} catch (Exception $e) {
    $error_details = [
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString()
    ];
    debug_log('CSRF token generation error', $error_details);
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to generate CSRF token: ' . $e->getMessage(),
        'debug_info' => $error_details
    ]);
}
?> 