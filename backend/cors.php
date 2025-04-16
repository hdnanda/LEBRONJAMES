<?php
// List of allowed origins
$allowed_origins = [
    'http://localhost',
    'http://localhost:3000',  // Common React dev server port
    'http://localhost:5000',  // Common dev server port
    'https://hdnanda.github.io',
    'https://financial-backend-qc54.onrender.com',  // Frontend URL
    'https://financial-backend-gc54.onrender.com'   // Backend URL
];

// Get the Origin header from the request
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

// Handle preflight requests first
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Always set CORS headers for preflight
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-Token");
    header("Access-Control-Max-Age: 3600");
    http_response_code(200);
    exit();
}

// For actual requests, check if the origin is allowed
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-Token");
}

// Prevent caching of API responses
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache"); 
