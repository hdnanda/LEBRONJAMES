<?php
// Allow specific origins
$allowed_origins = [
    'https://financial-frontend-3xkp.onrender.com',
    'https://financial-backend1.onrender.com',
    'http://localhost:80',
    'http://localhost',
    'http://localhost/FinancialLiteracyApp-main',
    'http://localhost:3000'
];

// Get the origin from the request
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

// Check if the origin is allowed
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: {$origin}");
} else {
    // If origin is not in allowed list, deny the request
    http_response_code(403);
    exit('Origin not allowed');
}

// Always allow credentials
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Max-Age: 86400');    // cache for 1 day

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, X-CSRF-Token, Authorization, Origin, Accept");
    exit(0);
}

// Start session before any output
if (session_status() === PHP_SESSION_NONE) {
    // Configure session
    ini_set('session.cookie_samesite', 'None');
    ini_set('session.cookie_secure', '1');
    ini_set('session.cookie_httponly', '1');
    
    // Set session cookie parameters
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'domain' => '',
        'secure' => true,
        'httponly' => true,
        'samesite' => 'None'
    ]);
    
    session_start();
    
    // Generate CSRF token if not exists
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    
    error_log('Session started - ID: ' . session_id());
    error_log('CSRF Token: ' . $_SESSION['csrf_token']);
} 
