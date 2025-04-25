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
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/functions.php';

// Log request details
error_log('GET CSRF Request Headers: ' . print_r(getallheaders(), true));
error_log('GET CSRF Request Method: ' . $_SERVER['REQUEST_METHOD']);
error_log('Origin: ' . ($_SERVER['HTTP_ORIGIN'] ?? 'not set'));

// Handle preflight requests first
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    error_log('Handling OPTIONS preflight request');
    
    // Set CORS headers for preflight
    $corsHeaders = [
        'Access-Control-Allow-Origin' => 'https://financial-frontend-3xkp.onrender.com',
        'Access-Control-Allow-Methods' => 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers' => 'Content-Type, X-CSRF-Token, Authorization, Origin, Accept, Cache-Control, Pragma, DNT',
        'Access-Control-Allow-Credentials' => 'true',
        'Access-Control-Max-Age' => '86400'
    ];
    
    foreach ($corsHeaders as $header => $value) {
        header("$header: $value");
        error_log("Setting preflight header - $header: $value");
    }
    
    http_response_code(204);
    exit();
}

// Set headers for actual request
header_remove(); // Clear any existing headers
error_log('Setting headers for actual request');

$actualHeaders = [
    'Content-Type' => 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin' => 'https://financial-frontend-3xkp.onrender.com',
    'Access-Control-Allow-Credentials' => 'true',
    'Access-Control-Allow-Headers' => 'Content-Type, X-CSRF-Token, Authorization, Origin, Accept, Cache-Control, Pragma, DNT',
    'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
    'Pragma' => 'no-cache'
];

foreach ($actualHeaders as $header => $value) {
    header("$header: $value");
    error_log("Setting actual request header - $header: $value");
}

try {
    // Start secure session
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    // Log session details for debugging
    error_log('CSRF Token Request - Session Details:');
    error_log('Session ID: ' . session_id());
    error_log('Session Status: ' . session_status());
    error_log('Session Data: ' . print_r($_SESSION, true));
    
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
    
    // Log response
    error_log('Preparing CSRF response: ' . json_encode($response));
    
    // Ensure clean output
    if (ob_get_length()) ob_clean();
    
    // Send response with proper JSON encoding
    echo json_encode($response, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit();
    
} catch (Exception $e) {
    error_log('CSRF Token Error: ' . $e->getMessage());
    error_log('Stack trace: ' . $e->getTraceAsString());
    
    // Ensure clean output
    if (ob_get_length()) ob_clean();
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to generate CSRF token: ' . $e->getMessage(),
        'data' => null
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit();
}
?> 
