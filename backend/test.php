<?php
// Simple test file to verify PHP execution
header('Access-Control-Allow-Origin: https://financial-frontend-3xkp.onrender.com');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token, Accept');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

// Return a simple JSON response
echo json_encode([
    'success' => true,
    'message' => 'PHP is working correctly',
    'time' => date('Y-m-d H:i:s'),
    'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown'
]);
?> 