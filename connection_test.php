<?php
// Enable error reporting for debugging (can be removed in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set CORS headers for browser access
header('Access-Control-Allow-Origin: https://financial-frontend-3xkp.onrender.com');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Debug log function
function debug_log($message, $data = null) {
    $log = date('Y-m-d H:i:s') . " - " . $message;
    if ($data !== null) {
        $log .= " - Data: " . json_encode($data);
    }
    error_log($log);
}

debug_log("Connection test accessed", [
    'method' => $_SERVER['REQUEST_METHOD'],
    'remote_addr' => $_SERVER['REMOTE_ADDR']
]);

// Try to include configuration and function files
try {
    // Include database configuration
    if (file_exists('config.php')) {
        require_once 'config.php';
    } else {
        throw new Exception("Config file not found");
    }
    
    // Include functions file if it exists
    if (file_exists('functions.php')) {
        require_once 'functions.php';
    }
    
    // Test database connection
    if (function_exists('get_db_connection')) {
        // If we have a function to get the connection, use it
        $conn = get_db_connection();
        if (!$conn) {
            throw new Exception("Failed to establish database connection");
        }
        
        // Test if we can query the database
        if ($conn->ping()) {
            debug_log("Database connection successful");
            echo json_encode([
                'success' => true,
                'message' => 'Database connection successful',
                'server_info' => $conn->server_info
            ]);
        } else {
            throw new Exception("Database ping failed: " . $conn->error);
        }
        
        $conn->close();
    } else {
        // Manual connection test if the function doesn't exist
        if (!defined('DB_HOST') || !defined('DB_USER') || !defined('DB_PASS') || !defined('DB_NAME')) {
            throw new Exception("Database configuration not properly defined");
        }
        
        $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        
        if ($conn->connect_error) {
            throw new Exception("Connection failed: " . $conn->connect_error);
        }
        
        debug_log("Direct database connection successful");
        echo json_encode([
            'success' => true,
            'message' => 'Database connection successful',
            'server_info' => $conn->server_info
        ]);
        
        $conn->close();
    }
} catch (Exception $e) {
    debug_log("Connection test failed", ['error' => $e->getMessage()]);
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?> 