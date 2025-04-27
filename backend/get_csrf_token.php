<?php
echo "CSRF test";
// Enable error logging
error_reporting(E_ALL);
ini_set('display_errors', 1); // Set to 1 for debugging, 0 for production
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');

// Clean any existing output buffers
while (ob_get_level()) {
    ob_end_clean();
}

// Include required files
require_once __DIR__ . '/backend/config.php';
require_once __DIR__ . '/backend/functions.php';

// Set security headers
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('Referrer-Policy: strict-origin-when-cross-origin');

// Handle CORS
$allowedOrigins = [
    'https://financial-frontend-3xkp.onrender.com',
    'http://localhost:3000',
    'http://localhost:8080'
];

$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token, Authorization, Origin, Accept');
    header('Access-Control-Max-Age: 86400'); // 24 hours
}

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
    exit();
}

try {
    // Start secure session
    if (session_status() === PHP_SESSION_NONE) {
        // Set secure session parameters
        ini_set('session.cookie_httponly', 1);
        ini_set('session.cookie_secure', 1);
        ini_set('session.cookie_samesite', 'Strict');
        ini_set('session.use_strict_mode', 1);
        ini_set('session.use_only_cookies', 1);
        
        session_start();
    }
    
    // Log session details for debugging
    error_log('CSRF Token Request - Session Details:');
    error_log('Session ID: ' . session_id());
    error_log('Session Status: ' . session_status());
    error_log('Session Data: ' . print_r($_SESSION, true));
    
    // Generate new token if it doesn't exist or is expired
    if (!isset($_SESSION['csrf_token']) || 
        !isset($_SESSION['csrf_token_time']) || 
        (time() - $_SESSION['csrf_token_time']) > 3600) {
        
        // Generate cryptographically secure random token
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        $_SESSION['csrf_token_time'] = time();
        
        error_log('Generated new CSRF token: ' . $_SESSION['csrf_token']);
    } else {
        error_log('Using existing CSRF token: ' . $_SESSION['csrf_token']);
    }
    
    // Create response
    $response = [
        'success' => true,
        'token' => $_SESSION['csrf_token'],
        'expires' => $_SESSION['csrf_token_time'] + 3600
    ];
    
    // Log response
    error_log('Preparing CSRF response: ' . json_encode($response));
    
    // Ensure clean output
    if (ob_get_length()) ob_clean();
    
    // Send response
    echo json_encode($response, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit();
    
} catch (Exception $e) {
    error_log('CSRF Token Error: ' . $e->getMessage());
    error_log('Stack trace: ' . $e->getTraceAsString());
    
    // Ensure clean output
    if (ob_get_length()) ob_clean();
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit();
}
?> 
