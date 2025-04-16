<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set JSON content type
header('Content-Type: application/json');

// Include CORS configuration
require_once 'cors.php';

// Test response
echo json_encode([
    'status' => 'working',
    'timestamp' => time(),
    'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'unknown',
    'php_version' => PHP_VERSION
]);
?> 