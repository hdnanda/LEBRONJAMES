<?php
// Log the start of CORS handling
error_log("Starting CORS handling");

// Allow specific origins
$allowed_origins = [
    'https://financial-frontend-3xkp.onrender.com',
    'https://financial-backend1.onrender.com',
    'http://localhost:80',
    'http://localhost:3000',
    'null'  // For local file testing
];

// Get the origin from the request
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

// Log CORS details
error_log("Request Origin: " . $origin);
error_log("Request Method: " . $_SERVER['REQUEST_METHOD']);
error_log("Current allowed origins: " . print_r($allowed_origins, true));

// Always set basic CORS headers
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Max-Age: 86400');    // cache for 1 day
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token, Authorization, Origin, Accept');

// Check if the origin is allowed
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: {$origin}");
    error_log("Origin allowed: {$origin}");
} else {
    // Default to the frontend URL
    header("Access-Control-Allow-Origin: https://financial-frontend-3xkp.onrender.com");
    error_log("Using default origin: https://financial-frontend-3xkp.onrender.com");
}

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    error_log("Handling OPTIONS preflight request");
    http_response_code(200);
    exit();
}

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    $sessionParams = [
        'lifetime' => 0,
        'path' => '/',
        'domain' => '',
        'secure' => true,
        'httponly' => true,
        'samesite' => 'None'
    ];
    session_set_cookie_params($sessionParams);
    session_start();
    error_log("Session started in CORS with ID: " . session_id());
}

// Generate CSRF token if not exists
if (!isset($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    error_log('Generated new CSRF token: ' . $_SESSION['csrf_token']);
} 
