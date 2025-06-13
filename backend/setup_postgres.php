<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include database configuration
require_once __DIR__ . '/config.php';

// Function to execute SQL file
function execute_sql_file($filename, $pdo) {
    // Read SQL file
    $sql = file_get_contents($filename);
    
    // Split SQL into individual queries
    $queries = explode(';', $sql);
    
    // Execute each query
    foreach ($queries as $query) {
        $query = trim($query);
        if (!empty($query)) {
            try {
                $pdo->exec($query);
                echo "Executed query successfully: " . substr($query, 0, 50) . "...<br>";
            } catch (PDOException $e) {
                echo "Error executing query: " . $e->getMessage() . "<br>";
                echo "Query: " . substr($query, 0, 100) . "...<br><br>";
            }
        }
    }
}

try {
    // Get database connection
    $pdo = get_db_connection();
    
    // Execute schema.pg.sql file
    echo "Executing schema.pg.sql file...<br>";
    execute_sql_file(__DIR__ . '/schema.pg.sql', $pdo);
    
    echo "Database setup completed successfully!<br>";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "<br>";
}
?> 