-- Create database is handled by Render

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    remember_token VARCHAR(255),
    token_expiry TIMESTAMP,
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_username ON users(username);
CREATE INDEX idx_email ON users(email);

-- Login logs table
CREATE TABLE IF NOT EXISTS login_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    username VARCHAR(50),
    email VARCHAR(100),
    ip_address VARCHAR(45) NOT NULL,
    user_agent VARCHAR(255),
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN DEFAULT FALSE,
    failure_reason VARCHAR(255)
);

CREATE INDEX idx_login_user_id ON login_logs(user_id);
CREATE INDEX idx_login_time ON login_logs(login_time);
CREATE INDEX idx_ip_address ON login_logs(ip_address);

-- Password reset requests table
CREATE TABLE IF NOT EXISTS password_resets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_reset_token ON password_resets(token);
CREATE INDEX idx_expires_at ON password_resets(expires_at);

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_user_id ON activity_logs(user_id);
CREATE INDEX idx_action ON activity_logs(action);
CREATE INDEX idx_activity_created_at ON activity_logs(created_at);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_xp INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    completed_levels TEXT DEFAULT '[]',
    completed_exams TEXT DEFAULT '[]',
    learning_progress TEXT DEFAULT '{}',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_progress_user_id ON user_progress(user_id);

-- Create functions and triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_user_update
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION log_failed_login()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.success = FALSE THEN
        INSERT INTO activity_logs (user_id, action, details, ip_address)
        VALUES (NEW.user_id, 'failed_login', 
                'Failed login attempt from IP: ' || NEW.ip_address, 
                NEW.ip_address);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_failed_login
    AFTER INSERT ON login_logs
    FOR EACH ROW
    EXECUTE FUNCTION log_failed_login();

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
    COUNT(CASE WHEN l.success = true THEN 1 END) as successful_logins,
    COUNT(CASE WHEN l.success = false THEN 1 END) as failed_logins,
    MAX(l.login_time) as last_login_attempt
FROM users u
LEFT JOIN login_logs l ON u.id = l.user_id
GROUP BY u.id, u.username, u.email;

-- Insert test user with hashed password (password: Test@123)
INSERT INTO users (username, email, password_hash) VALUES 
('test_user', 'test@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'); 