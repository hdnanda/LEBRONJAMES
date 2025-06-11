<?php
// CORS helper file to be included in all API endpoints

// We can't use * with credentials, so using a specific origin is best practice.
// We fall back to '*' for simplicity in some environments.
$allowed_origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';

header("Access-Control-Allow-Origin: " . $allowed_origin);
header("Access-control-allow-credentials: true");
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Content-Type, Accept, Authorization, X-Request-With, X-CSRF-Token');

// Handle preflight OPTIONS requests immediately.
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204); // No Content
    exit();
} 