<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include configuration
require_once 'config.php';

echo "<h2>Database Connection Test</h2>";

try {
    // Attempt MySQL connection
    $conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

    // Check connection
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }

    echo "<p style='color: green;'>✅ Successfully connected to MySQL!</p>";

    // Test users table
    $result = $conn->query("SHOW TABLES LIKE 'users'");
    if ($result->num_rows > 0) {
        echo "<p style='color: green;'>✅ users table exists</p>";
        
        // Check table structure
        $result = $conn->query("DESCRIBE users");
        echo "<h3>users table structure:</h3>";
        echo "<pre>";
        while ($row = $result->fetch_assoc()) {
            print_r($row);
        }
        echo "</pre>";

        // Check for any records
        $result = $conn->query("SELECT COUNT(*) as count FROM users");
        $count = $result->fetch_assoc()['count'];
        echo "<p>Total records in users: $count</p>";
    } else {
        echo "<p style='color: red;'>❌ users table does not exist!</p>";
    }

    // Test login_logs table
    $result = $conn->query("SHOW TABLES LIKE 'login_logs'");
    if ($result->num_rows > 0) {
        echo "<p style='color: green;'>✅ login_logs table exists</p>";
        
        // Check table structure
        $result = $conn->query("DESCRIBE login_logs");
        echo "<h3>login_logs table structure:</h3>";
        echo "<pre>";
        while ($row = $result->fetch_assoc()) {
            print_r($row);
        }
        echo "</pre>";

        // Check for any records
        $result = $conn->query("SELECT COUNT(*) as count FROM login_logs");
        $count = $result->fetch_assoc()['count'];
        echo "<p>Total records in login_logs: $count</p>";
    } else {
        echo "<p style='color: red;'>❌ login_logs table does not exist!</p>";
    }

    $conn->close();
    echo "<p style='color: green;'>✅ Connection closed successfully</p>";

} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Error: " . $e->getMessage() . "</p>";
    echo "<h3>Troubleshooting steps:</h3>";
    echo "<ol>";
    echo "<li>Check if MySQL is running in XAMPP Control Panel</li>";
    echo "<li>Verify database name is correct (current: $db_name)</li>";
    echo "<li>Verify username and password are correct</li>";
    echo "<li>Check if the database exists</li>";
    echo "</ol>";
}
?> 