<?php
// Database configuration
$db_host = getenv('DB_HOST') ?: 'localhost';
$db_name = getenv('DB_NAME') ?: 'financial_literacy_db';
$db_user = getenv('DB_USER') ?: 'root';
$db_pass = getenv('DB_PASSWORD') ?: '';

// CORS configuration
$allowed_origin = getenv('ALLOWED_ORIGIN') ?: 'https://hdnanda.github.io/LEBRONJAMES';

// Error reporting (log errors instead of displaying them)
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');

// Session configuration
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', getenv('ENVIRONMENT') === 'production' ? 1 : 0);
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_samesite', 'Lax');

// Set timezone
date_default_timezone_set('UTC');

// Security headers
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('Referrer-Policy: strict-origin-when-cross-origin');

if (getenv('ENVIRONMENT') === 'production') {
    // Additional security headers for production
    header('Strict-Transport-Security: max-age=31536000; includeSubDomains');
    header('Content-Security-Policy: default-src \'self\'; script-src \'self\' \'unsafe-inline\' \'unsafe-eval\'; style-src \'self\' \'unsafe-inline\';');
}

// Constants
define('MAX_LOGIN_ATTEMPTS', 5);
define('LOGIN_TIMEOUT_MINUTES', 30);
define('PASSWORD_MIN_LENGTH', 8);
define('TOKEN_EXPIRY_DAYS', 30);

// Database tables
$TABLES = [
    'users' => 'users',
    'login_logs' => 'login_logs',
    'password_resets' => 'password_resets',
    'user_progress' => 'user_progress'
];

// Email configuration
$SMTP_CONFIG = [
    'host' => getenv('SMTP_HOST') ?: 'smtp.example.com',
    'username' => getenv('SMTP_USERNAME') ?: 'your_smtp_username',
    'password' => getenv('SMTP_PASSWORD') ?: 'your_smtp_password',
    'port' => getenv('SMTP_PORT') ?: 587,
    'encryption' => getenv('SMTP_ENCRYPTION') ?: 'tls'
];
?> 
