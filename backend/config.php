<?php
// --- FILENAME: backend/config.php ---
// This file should ONLY contain configuration variables and database connection logic.
// All session/header/CORS logic is handled in bootstrap.php.

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
        'port' => $db_params['port'] ?? '5432',
        'name' => ltrim($db_params['path'], '/'),
        'user' => $db_params['user'],
        'pass' => $db_params['pass']
    ];
} else {
    // Local environment - Use MySQL
    $db_config = [
        'type' => 'mysql',
        'host' => 'localhost',
        'port' => '3306',
        'name' => 'financial_literacy_db',
        'user' => 'root',
        'pass' => ''
    ];
}

// Create database connection based on environment
function get_db_connection() {
    global $db_config;
    
    try {
        if ($db_config['type'] === 'pgsql') {
            $dsn = "pgsql:host={$db_config['host']};port={$db_config['port']};dbname={$db_config['name']};user={$db_config['user']};password={$db_config['pass']}";
            $conn = new PDO($dsn);
        } else {
            $dsn = "mysql:host={$db_config['host']};port={$db_config['port']};dbname={$db_config['name']};charset=utf8mb4";
            $conn = new PDO($dsn, $db_config['user'], $db_config['pass']);
        }
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $conn;
    } catch (PDOException $e) {
        error_log("Database connection failed: " . $e->getMessage());
        // In a real app, you'd want to return a proper JSON error here,
        // but for now, we just log and let it fail to help with debugging.
        throw $e;
    }
}

// Establish the database connection for use in other scripts
$conn = get_db_connection();

// Constants
define('PASSWORD_MIN_LENGTH', 8);