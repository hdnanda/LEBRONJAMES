<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database configuration
$host = 'localhost';
$username = 'root';
$password = '';

// Database setup script
require_once 'config.php';

// Function to execute SQL file
function execute_sql_file($filename, $conn) {
    // Read SQL file
    $sql = file_get_contents($filename);
    
    // Remove DELIMITER statements and replace // with ;
    $sql = preg_replace('/DELIMITER \/\/\s*/', '', $sql);
    $sql = preg_replace('/\/\//', ';', $sql);
    
    // Split SQL into individual queries
    $queries = explode(';', $sql);
    
    // Execute each query
    foreach ($queries as $query) {
        $query = trim($query);
        if (!empty($query)) {
            if (!$conn->query($query)) {
                echo "Error executing query: " . $conn->error . "<br>";
                echo "Query: " . substr($query, 0, 100) . "...<br><br>";
            }
        }
    }
}

try {
    // Connect to MySQL without selecting a database
    $conn = new mysqli($host, $username, $password);
    
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    
    // Execute schema.sql file
    echo "Executing schema.sql file...<br>";
    execute_sql_file(__DIR__ . '/schema.sql', $conn);
    
    echo "Database setup completed successfully!<br>";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "<br>";
} finally {
    // Close connection if it exists
    if (isset($conn)) {
        $conn->close();
    }
}
?> 