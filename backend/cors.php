<?php
// Allow specific origins
$allowed_origins = [
    'https://financial-frontend-3xkp.onrender.com',
    'https://financial-backend1.onrender.com',
    'http://localhost:80',  // Add local development
    'http://localhost'      // Add local development
];

// Get the origin from the request
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

// Check if the origin is allowed
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');    // cache for 1 day
}

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'])) {
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    }
    
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'])) {
        header("Access-Control-Allow-Headers: Content-Type, X-CSRF-Token, Authorization, Origin");
    }
    
    // Always return 200 for OPTIONS requests
    http_response_code(200);
    exit(0);
}

// Ensure session is started with proper configuration
if (session_status() === PHP_SESSION_NONE) {
    // More permissive session settings for development
    ini_set('session.cookie_samesite', 'Lax');  // Changed from 'None' to 'Lax'
    ini_set('session.cookie_secure', '0');      // Changed from '1' to '0' for local development
    session_start();
} 