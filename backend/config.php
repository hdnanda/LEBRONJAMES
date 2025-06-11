<?php
// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Handle CORS preflight requests
require_once __DIR__ . '/cors.php';
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Database configuration
$db_url = getenv('DATABASE_URL');
$is_production = !empty($db_url);

// Initialize database connection parameters
$db_config = [
    'type' => '',      // 'mysql' or 'pgsql'
    'host' => '',
    'port' => '',
    'name' => '',
    'user' => '',
    'pass' => ''
];

if ($is_production) {
    // Production environment (Render) - Use PostgreSQL
    $db_params = parse_url($db_url);
    $db_config = [
        'type' => 'pgsql',
        'host' => $db_params['host'],
        'port' => $db_params['port'] ?? '5432',  // Default PostgreSQL port if not specified
        'name' => ltrim($db_params['path'], '/'),
        'user' => $db_params['user'],
        'pass' => $db_params['pass']
    ];
    
    // Log the parsed URL components for debugging
    error_log("Parsed database URL components:");
    error_log("Host: " . $db_params['host']);
    error_log("Port: " . ($db_params['port'] ?? '5432'));
    error_log("Database: " . ltrim($db_params['path'], '/'));
    error_log("User: " . $db_params['user']);
} else {
    // Local environment - Use MySQL
    $db_config = [
        'type' => 'mysql',
        'host' => 'localhost',
        'port' => '3306',
        'name' => 'financial_literacy_db',
        'user' => 'root',  // Default XAMPP MySQL username
        'pass' => ''       // Default XAMPP MySQL password
    ];
}

// Error reporting (log errors instead of displaying them)
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');

// Log database configuration (without password)
error_log("Database configuration:");
error_log("Environment: " . ($is_production ? 'Production (Render)' : 'Local'));
error_log("Database Type: " . $db_config['type']);
error_log("Host: " . $db_config['host']);
error_log("Port: " . $db_config['port']);
error_log("Database: " . $db_config['name']);
error_log("User: " . $db_config['user']);

// Create database connection based on environment
function get_db_connection() {
    global $db_config;
    
    try {
        if ($db_config['type'] === 'pgsql') {
            // PostgreSQL connection
            $dsn = "pgsql:host={$db_config['host']};port={$db_config['port']};dbname={$db_config['name']};user={$db_config['user']};password={$db_config['pass']}";
            $conn = new PDO($dsn);
            $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } else {
            // MySQL connection
            $conn = new PDO(
                "mysql:host={$db_config['host']};port={$db_config['port']};dbname={$db_config['name']};charset=utf8mb4",
                $db_config['user'],
                $db_config['pass'],
                [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
            );
        }
        return $conn;
    } catch (PDOException $e) {
        error_log("Database connection failed: " . $e->getMessage());
        throw $e;
    }
}

// Establish the database connection for use in other scripts
$conn = get_db_connection();

// Session configuration
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 1);
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_samesite', 'None');

// Set timezone
date_default_timezone_set('UTC');

// Security headers
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('Referrer-Policy: strict-origin-when-cross-origin');

// Constants
define('MAX_LOGIN_ATTEMPTS', 5);
define('LOGIN_TIMEOUT_MINUTES', 30);
define('PASSWORD_MIN_LENGTH', 8);
define('TOKEN_EXPIRY_DAYS', 30);

// Database tables
$TABLES = [
    'users' => 'users',
    'login_logs' => 'login_logs',
    'password_resets' => 'password_resets'
];

// Email configuration (if needed)
$SMTP_CONFIG = [
    'host' => 'smtp.example.com',
    'username' => 'your_smtp_username',
    'password' => 'your_smtp_password',
    'port' => 587,
    'encryption' => 'tls'
];
?> 
