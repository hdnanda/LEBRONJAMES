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
    
    // Drop database if exists
    $sql = "DROP DATABASE IF EXISTS $dbname";
    if ($conn->query($sql) === TRUE) {
        echo "<p style='color: green;'>Old database dropped successfully</p>";
    } else {
        throw new Exception("Error dropping database: " . $conn->error);
    }
    
    // Create database
    $sql = "CREATE DATABASE $dbname";
    if ($conn->query($sql) === TRUE) {
        echo "<p style='color: green;'>Database created successfully</p>";
    } else {
        throw new Exception("Error creating database: " . $conn->error);
    }
    
    // Select the database
    if (!$conn->select_db($dbname)) {
        throw new Exception("Error selecting database: " . $conn->error);
    }
    
    // Create users table
    $sql = "CREATE TABLE users (
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
    ) ENGINE=InnoDB";
    
    if ($conn->query($sql) === TRUE) {
        echo "<p style='color: green;'>Users table created successfully</p>";
    } else {
        throw new Exception("Error creating users table: " . $conn->error);
    }
    
    // Create login_logs table
    $sql = "CREATE TABLE login_logs (
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
    ) ENGINE=InnoDB";
    
    if ($conn->query($sql) === TRUE) {
        echo "<p style='color: green;'>Login_logs table created successfully</p>";
    } else {
        throw new Exception("Error creating login_logs table: " . $conn->error);
    }
    
    // Create user_progress table
    $sql = "CREATE TABLE user_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        total_xp INT DEFAULT 0,
        current_level INT DEFAULT 1,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB";
    
    if ($conn->query($sql) === TRUE) {
        echo "<p style='color: green;'>User_progress table created successfully</p>";
    } else {
        throw new Exception("Error creating user_progress table: " . $conn->error);
    }
    
    // Create activity_logs table
    $sql = "CREATE TABLE activity_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        activity_type VARCHAR(50) NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB";
    
    if ($conn->query($sql) === TRUE) {
        echo "<p style='color: green;'>Activity_logs table created successfully</p>";
    } else {
        throw new Exception("Error creating activity_logs table: " . $conn->error);
    }
    
    // Create password_resets table
    $sql = "CREATE TABLE password_resets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB";
    
    if ($conn->query($sql) === TRUE) {
        echo "<p style='color: green;'>Password_resets table created successfully</p>";
    } else {
        throw new Exception("Error creating password_resets table: " . $conn->error);
    }
    
    // Create indexes
    $conn->query("CREATE INDEX idx_user_progress_user_id ON user_progress(user_id)");
    $conn->query("CREATE INDEX idx_users_username ON users(username)");
    $conn->query("CREATE INDEX idx_users_email ON users(email)");
    $conn->query("CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id)");
    $conn->query("CREATE INDEX idx_password_resets_user_id ON password_resets(user_id)");
    $conn->query("CREATE INDEX idx_password_resets_token ON password_resets(token)");
    
    echo "<p style='color: green;'>Setup completed successfully!</p>";
    
} catch (Exception $e) {
    echo "<p style='color: red;'>Error: " . $e->getMessage() . "</p>";
} finally {
    if (isset($conn)) {
        $conn->close();
    }
}
?> 