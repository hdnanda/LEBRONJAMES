<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database configuration
$host = 'localhost';
$username = 'root';
$password = '';
$dbname = 'financial_literacy_db';

try {
    // Create connection
    $conn = new mysqli($host, $username, $password);
    
    // Check connection
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    
    echo "<p style='color: green;'>Connected successfully</p>";
    
    // Create database
    $sql = "CREATE DATABASE IF NOT EXISTS $dbname";
    if ($conn->query($sql) === TRUE) {
        echo "<p style='color: green;'>Database created successfully</p>";
    } else {
        throw new Exception("Error creating database: " . $conn->error);
    }
    
    // Select the database
    $conn->select_db($dbname);
    
    // Create users table
    $sql = "CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        remember_token VARCHAR(255) DEFAULT NULL,
        token_expiry DATETIME DEFAULT NULL,
        email_verified BOOLEAN DEFAULT FALSE,
        verification_token VARCHAR(255) DEFAULT NULL,
        reset_token VARCHAR(255) DEFAULT NULL,
        reset_token_expiry DATETIME DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        last_login DATETIME DEFAULT NULL,
        is_active BOOLEAN DEFAULT TRUE
    )";
    
    if ($conn->query($sql) === TRUE) {
        echo "<p style='color: green;'>Users table created successfully</p>";
    } else {
        throw new Exception("Error creating users table: " . $conn->error);
    }
    
    // Create login_logs table
    $sql = "CREATE TABLE IF NOT EXISTS login_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        username VARCHAR(50),
        email VARCHAR(100),
        ip_address VARCHAR(45) NOT NULL,
        user_agent VARCHAR(255),
        login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        success BOOLEAN DEFAULT FALSE,
        failure_reason VARCHAR(255) DEFAULT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )";
    
    if ($conn->query($sql) === TRUE) {
        echo "<p style='color: green;'>Login_logs table created successfully</p>";
    } else {
        throw new Exception("Error creating login_logs table: " . $conn->error);
    }
    
    // Create user_progress table
    $sql = "CREATE TABLE IF NOT EXISTS user_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        total_xp INT DEFAULT 0,
        current_level INT DEFAULT 1,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )";
    
    if ($conn->query($sql) === TRUE) {
        echo "<p style='color: green;'>User_progress table created successfully</p>";
    } else {
        throw new Exception("Error creating user_progress table: " . $conn->error);
    }
    
    // Create indexes
    $conn->query("CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id)");
    $conn->query("CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)");
    $conn->query("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)");
    
    echo "<p style='color: green;'>Setup completed successfully!</p>";
    
} catch (Exception $e) {
    echo "<p style='color: red;'>Error: " . $e->getMessage() . "</p>";
} finally {
    if (isset($conn)) {
        $conn->close();
    }
}
?> 