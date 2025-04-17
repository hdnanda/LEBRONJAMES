<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// List of allowed origins - update with your actual frontend URL
$allowed_origins = [
    'https://financial-literacy-app.onrender.com',    // Your frontend URL
    'https://financial-backend-gc54.onrender.com',    // Your backend URL
    'http://localhost:3000',                          // Local development
    'http://localhost:5000'                           // Local development
];

// Debug logging for CORS requests
error_log('CORS Request Details: ' . json_encode([
    'method' => $_SERVER['REQUEST_METHOD'] ?? 'none',
    'origin' => $_SERVER['HTTP_ORIGIN'] ?? 'none',
    'headers' => getallheaders()
]));

// Get the Origin header
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

// Function to set CORS headers
function setCorsHeaders($origin) {
    if (!empty($origin)) {
        header("Access-Control-Allow-Origin: $origin");
    }
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-Token");
    header("Access-Control-Expose-Headers: Content-Length, X-JSON");
    header('Vary: Origin');
}

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    if (in_array($origin, $allowed_origins)) {
        setCorsHeaders($origin);
        header("Access-Control-Max-Age: 3600");
        http_response_code(204);
        exit();
    }
}

// For actual requests
if (in_array($origin, $allowed_origins)) {
    setCorsHeaders($origin);
}

// Prevent caching of API responses
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache"); 
