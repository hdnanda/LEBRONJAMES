<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database configuration
$host = 'localhost';
$username = 'root';
$password = '';

try {
    // Connect to MySQL without selecting a database
    $conn = new mysqli($host, $username, $password);
    
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    
    echo "Connected to MySQL server successfully.<br>";
    
    // Read and execute SQL file
    $sql = file_get_contents(__DIR__ . '/setup_basic.sql');
    
    // Split SQL into individual queries
    $queries = explode(';', $sql);
    
    // Execute each query
    foreach ($queries as $query) {
        $query = trim($query);
        if (!empty($query)) {
            if (!$conn->query($query)) {
                echo "Error executing query: " . $conn->error . "<br>";
                echo "Query: " . $query . "<br><br>";
            }
        }
    }
    
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