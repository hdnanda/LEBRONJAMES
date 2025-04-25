<?php
// Start session first with proper configuration
if (session_status() === PHP_SESSION_NONE) {
    // Set session cookie parameters before starting session
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'domain' => '',
        'secure' => true,
        'httponly' => true,
        'samesite' => 'None'
    ]);

    // Start session
    session_start();
    
    error_log('Session started with ID: ' . session_id());
}

// Allow specific origins
$allowed_origins = [
    'https://financial-frontend-3xkp.onrender.com',
    'https://financial-backend1.onrender.com',
    'http://localhost:80',
    'http://localhost',
    'http://localhost:3000',
    'null'  // For local file testing
];

// Get the origin from the request
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

// For local testing, if origin is empty, allow localhost
if (empty($origin) && isset($_SERVER['HTTP_HOST'])) {
    $origin = 'http://' . $_SERVER['HTTP_HOST'];
}

// Log the request details for debugging
error_log('CORS Request Details:');
error_log('Origin: ' . $origin);
error_log('HTTP_HOST: ' . ($_SERVER['HTTP_HOST'] ?? 'not set'));
error_log('REMOTE_ADDR: ' . ($_SERVER['REMOTE_ADDR'] ?? 'not set'));
error_log('Request Method: ' . $_SERVER['REQUEST_METHOD']);
error_log('Session ID: ' . session_id());

// Check if the origin is allowed
if (in_array($origin, $allowed_origins) || empty($origin)) {
    if (!empty($origin)) {
        header("Access-Control-Allow-Origin: {$origin}");
    } else {
        // If no origin, allow localhost
        header("Access-Control-Allow-Origin: http://localhost");
    }
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');    // cache for 1 day
    header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token, Authorization, Origin, Accept');
    
    // Handle preflight requests
    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
        http_response_code(200);
        exit(0);
    }
} else {
    error_log('Origin not allowed: ' . $origin);
    error_log('Allowed origins: ' . print_r($allowed_origins, true));
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'message' => 'Origin not allowed',
        'debug' => [
            'origin' => $origin,
            'allowed_origins' => $allowed_origins
        ]
    ]);
    exit();
}

// Generate CSRF token if not exists
if (!isset($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    error_log('Generated new CSRF token: ' . $_SESSION['csrf_token']);
} 
