-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS financial_literacy_db;
USE financial_literacy_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
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
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Login logs table
CREATE TABLE IF NOT EXISTS login_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    username VARCHAR(50),
    email VARCHAR(100),
    ip_address VARCHAR(45) NOT NULL,
    user_agent VARCHAR(255),
    login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN DEFAULT FALSE,
    failure_reason VARCHAR(255) DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_login_time (login_time),
    INDEX idx_ip_address (ip_address)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Password reset requests table
CREATE TABLE IF NOT EXISTS password_resets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(50) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_xp INT DEFAULT 0,
    current_level INT DEFAULT 1,
    completed_levels LONGTEXT DEFAULT '[]',
    completed_exams LONGTEXT DEFAULT '[]',
    learning_progress LONGTEXT DEFAULT '{}',
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create triggers
DELIMITER //

-- Update timestamp trigger for users table
CREATE TRIGGER before_user_update 
    BEFORE UPDATE ON users
    FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END//

-- Log failed login attempts trigger
CREATE TRIGGER after_failed_login
    AFTER INSERT ON login_logs
    FOR EACH ROW
BEGIN
    IF NEW.success = FALSE THEN
        INSERT INTO activity_logs (user_id, action, details, ip_address)
        VALUES (NEW.user_id, 'failed_login', 
                CONCAT('Failed login attempt from IP: ', NEW.ip_address), 
                NEW.ip_address);
    END IF;
END//

DELIMITER ;

-- Create indexes for performance
CREATE INDEX idx_user_email_pass ON users(email, password_hash);
CREATE INDEX idx_user_username_pass ON users(username, password_hash);
CREATE INDEX idx_user_remember ON users(remember_token, token_expiry);
CREATE INDEX idx_user_verification ON users(verification_token);
CREATE INDEX idx_user_reset ON users(reset_token, reset_token_expiry);

-- Create views for analytics
CREATE OR REPLACE VIEW user_login_stats AS
SELECT 
    u.id,
    u.username,
    u.email,
    COUNT(l.id) as total_logins,
    SUM(CASE WHEN l.success = 1 THEN 1 ELSE 0 END) as successful_logins,
    SUM(CASE WHEN l.success = 0 THEN 1 ELSE 0 END) as failed_logins,
    MAX(l.login_time) as last_login_attempt
FROM users u
LEFT JOIN login_logs l ON u.id = l.user_id
GROUP BY u.id, u.username, u.email;

-- Insert test user with hashed password (password: Test@123)
INSERT INTO users (username, email, password_hash) VALUES 
('test_user', 'test@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'); 