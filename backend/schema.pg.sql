-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    remember_token VARCHAR(255) DEFAULT NULL,
    token_expiry TIMESTAMPTZ DEFAULT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255) DEFAULT NULL,
    reset_token VARCHAR(255) DEFAULT NULL,
    reset_token_expiry TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMPTZ DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Login logs table
CREATE TABLE IF NOT EXISTS login_logs (
    id SERIAL PRIMARY KEY,
    user_id INT,
    username VARCHAR(50),
    email VARCHAR(100),
    ip_address VARCHAR(45) NOT NULL,
    user_agent VARCHAR(255),
    login_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN DEFAULT FALSE,
    failure_reason VARCHAR(255) DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Password reset requests table
CREATE TABLE IF NOT EXISTS password_resets (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INT,
    action VARCHAR(50) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- User progress table
CREATE TABLE IF NOT EXISTS user_progress (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    total_xp INT DEFAULT 0,
    current_level INT DEFAULT 1,
    completed_levels TEXT DEFAULT '[]',
    completed_exams TEXT DEFAULT '[]',
    learning_progress TEXT DEFAULT '{}',
    last_updated TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the updated_at timestamp on users table
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_login_logs_user_id ON login_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_login_logs_login_time ON login_logs(login_time);
CREATE INDEX IF NOT EXISTS idx_login_logs_ip_address ON login_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);
CREATE INDEX IF NOT EXISTS idx_password_resets_expires_at ON password_resets(expires_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email_pass ON users(email, password_hash);
CREATE INDEX IF NOT EXISTS idx_users_username_pass ON users(username, password_hash);
CREATE INDEX IF NOT EXISTS idx_users_remember ON users(remember_token, token_expiry);
CREATE INDEX IF NOT EXISTS idx_users_verification ON users(verification_token);
CREATE INDEX IF NOT EXISTS idx_users_reset ON users(reset_token, reset_token_expiry);

-- Create a view for user login stats
CREATE OR REPLACE VIEW user_login_stats AS
SELECT
    u.id,
    u.username,
    u.email,
    COUNT(l.id) as total_logins,
    SUM(CASE WHEN l.success THEN 1 ELSE 0 END) as successful_logins,
    SUM(CASE WHEN NOT l.success THEN 1 ELSE 0 END) as failed_logins,
    MAX(l.login_time) as last_login_attempt
FROM users u
LEFT JOIN login_logs l ON u.id = l.user_id
GROUP BY u.id, u.username, u.email; 