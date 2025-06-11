<?php
// Include CORS headers
require_once 'cors.php';

// Get the list of PHP files in this directory for API endpoints
$endpoints = array_filter(scandir(__DIR__), function($file) {
    return pathinfo($file, PATHINFO_EXTENSION) === 'php' && $file !== 'index.php';
});

// Get server information
$server_info = [
    'php_version' => phpversion(),
    'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
    'document_root' => $_SERVER['DOCUMENT_ROOT'] ?? 'Unknown',
    'session_enabled' => session_status() === PHP_SESSION_ACTIVE || function_exists('session_start'),
    'request_time' => date('Y-m-d H:i:s'),
    'allowed_origin' => $allowed_origin ?? 'Not set'
];

// Format the response
$response = [
    'status' => 'Backend API is running',
    'available_endpoints' => array_values($endpoints),
    'server_info' => $server_info,
    'debug_tips' => [
        'For testing login, visit: /dummy_user.php',
        'For testing XP, visit: /dummy_xp.php',
        'For a simple test, visit: /test.php'
    ]
];

// Return the response as JSON
echo json_encode($response, JSON_PRETTY_PRINT);
?> 