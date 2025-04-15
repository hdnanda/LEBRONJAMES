<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include configuration
require_once 'config.php';

// Set JSON content type
header('Content-Type: application/json');

// Create response array
$response = [
    'environment' => [
        'ENVIRONMENT' => getenv('ENVIRONMENT') ?: 'not set',
        'DB_HOST' => getenv('DB_HOST') ?: 'not set',
        'DB_NAME' => getenv('DB_NAME') ?: 'not set',
        'DB_USER' => getenv('DB_USER') ?: 'not set',
        'DB_PASSWORD' => getenv('DB_PASSWORD') ? 'set (hidden)' : 'not set',
        'ALLOWED_ORIGIN' => getenv('ALLOWED_ORIGIN') ?: 'not set',
    ],
    'config' => [
        'db_host' => $db_host,
        'db_name' => $db_name,
        'db_user' => $db_user,
        'db_pass' => $db_pass ? 'set (hidden)' : 'not set',
        'allowed_origin' => $allowed_origin,
    ],
    'server' => [
        'REQUEST_METHOD' => $_SERVER['REQUEST_METHOD'],
        'HTTP_ORIGIN' => $_SERVER['HTTP_ORIGIN'] ?? 'not set',
        'HTTP_HOST' => $_SERVER['HTTP_HOST'] ?? 'not set',
        'REMOTE_ADDR' => $_SERVER['REMOTE_ADDR'] ?? 'not set',
    ],
    'session' => [
        'session_id' => session_id(),
        'session_status' => session_status(),
        'session_cookie_params' => session_get_cookie_params(),
    ],
];

// Output response
echo json_encode($response, JSON_PRETTY_PRINT);
?> 