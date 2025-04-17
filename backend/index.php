<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include CORS configuration
require_once 'cors.php';

// Set JSON content type
header('Content-Type: application/json');

// Return API status
echo json_encode([
    'status' => 'online',
    'version' => '1.0',
    'timestamp' => time(),
    'endpoints' => [
        'csrf' => '/get_csrf_token.php',
        'login' => '/login.php',
        'signup' => '/signup.php'
    ]
]);
?> 