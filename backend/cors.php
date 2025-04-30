<?php
// CORS helper file to be included in all API endpoints

// We can't use * with credentials, so using the specific origin instead
$allowed_origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';

header("Access-Control-Allow-Origin: $allowed_origin");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-CSRF-Token, Accept");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Max-Age: 1728000"); // 20 days
header("Content-Type: application/json");

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Just exit with 200 OK for OPTIONS requests
    http_response_code(200);
    exit();
}
?> 
