<?php
// Start session first with proper configuration
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_samesite', 'None');
    ini_set('session.cookie_secure', '1');
    ini_set('session.cookie_httponly', '1');
    
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

// Allow specific origins
$allowed_origins = [
    'https://financial-frontend-3xkp.onrender.com',
    'https://financial-backend1.onrender.com',
    'http://localhost:80',  // Add local development
    'http://localhost'      // Add local development
];

// Get the origin from the request
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

// Log the request details for debugging
error_log('CORS Request Details:');
error_log('Origin: ' . $origin);
error_log('Request Method: ' . $_SERVER['REQUEST_METHOD']);
error_log('Session ID: ' . session_id());

// Check if the origin is allowed
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');    // cache for 1 day
    
    // Handle preflight requests
    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, X-CSRF-Token, Authorization, Origin");
        http_response_code(200);
        exit(0);
    }
} else {
    error_log('Origin not allowed: ' . $origin);
    error_log('Allowed origins: ' . print_r($allowed_origins, true));
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'message' => 'Origin not allowed',
        'debug' => [
            'origin' => $origin,
            'allowed_origins' => $allowed_origins
        ]
    ]);
    exit();
}

// Generate CSRF token if not exists
if (!isset($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    error_log('Generated new CSRF token: ' . $_SESSION['csrf_token']);
} 
