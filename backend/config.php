<?php
// Database configuration
$db_host = 'localhost';
$db_name = 'financial_literacy_db';
$db_user = 'root';
$db_pass = '';

// Error reporting (log errors instead of displaying them)
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');

// Session configuration
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 1);  // Enable secure cookies for HTTPS
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_samesite', 'None');  // Allow cross-site cookies
ini_set('session.gc_maxlifetime', 3600);  // 1 hour session lifetime
ini_set('session.cookie_lifetime', 0);  // Session cookie expires when browser closes

// Set timezone
date_default_timezone_set('UTC');

// Security headers for local development
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