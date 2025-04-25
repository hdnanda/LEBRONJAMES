<?php
/**
 * Sanitize user input
 * @param string $input The input string to sanitize
 * @return string The sanitized input
 */
function sanitize_input($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

/**
 * Check if user is logged in
 * @return bool True if user is logged in, false otherwise
 */
function is_logged_in() {
    return isset($_SESSION['user_id']);
}

/**
 * Check if user has exceeded maximum login attempts
 * @param string $username Username or email to check
 * @param mysqli $conn Database connection
 * @return bool True if user has exceeded maximum attempts, false otherwise
 */
function check_login_attempts($username, $conn) {
    try {
        $timeout_minutes = LOGIN_TIMEOUT_MINUTES;
        
        $stmt = $conn->prepare("SELECT COUNT(*) as attempts FROM login_logs 
                               WHERE (username = ? OR email = ?) 
                               AND success = 0 
                               AND login_time > DATE_SUB(NOW(), INTERVAL ? MINUTE)");
        
        if (!$stmt) {
            error_log("Failed to prepare statement: " . $conn->error);
            return false;
        }
        
        $stmt->bind_param("ssi", $username, $username, $timeout_minutes);
        
        if (!$stmt->execute()) {
            error_log("Failed to execute statement: " . $stmt->error);
            return false;
        }
        
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        return isset($row['attempts']) && $row['attempts'] >= MAX_LOGIN_ATTEMPTS;
        
    } catch (Exception $e) {
        error_log("Error in check_login_attempts: " . $e->getMessage());
        return false;
    }
}

/**
 * Generate a secure random token
 * @param int $length Length of the token
 * @return string The generated token
 */
function generate_token($length = 32) {
    return bin2hex(random_bytes($length));
}

/**
 * Validate password strength
 * @param string $password The password to validate
 * @return array Array containing validation result and message
 */
function validate_password($password) {
    $errors = [];
    
    if (strlen($password) < PASSWORD_MIN_LENGTH) {
        $errors[] = "Password must be at least " . PASSWORD_MIN_LENGTH . " characters long";
    }
    
    if (!preg_match('/[A-Z]/', $password)) {
        $errors[] = "Password must contain at least one uppercase letter";
    }
    
    if (!preg_match('/[a-z]/', $password)) {
        $errors[] = "Password must contain at least one lowercase letter";
    }
    
    if (!preg_match('/[0-9]/', $password)) {
        $errors[] = "Password must contain at least one number";
    }
    
    if (!preg_match('/[^A-Za-z0-9]/', $password)) {
        $errors[] = "Password must contain at least one special character";
    }
    
    return [
        'valid' => empty($errors),
        'errors' => $errors
    ];
}

/**
 * Send password reset email
 * @param string $email User's email address
 * @param string $token Reset token
 * @return bool True if email was sent successfully, false otherwise
 */
function send_password_reset_email($email, $token) {
    $to = $email;
    $subject = "Password Reset Request";
    $reset_link = "https://your-domain.com/reset-password.php?token=" . $token;
    
    $message = "Hello,\n\n";
    $message .= "You have requested to reset your password. Click the link below to proceed:\n\n";
    $message .= $reset_link . "\n\n";
    $message .= "If you did not request this password reset, please ignore this email.\n\n";
    $message .= "This link will expire in 24 hours.\n\n";
    $message .= "Best regards,\nTheMoneyOlympics Team";
    
    $headers = "From: noreply@your-domain.com\r\n";
    $headers .= "Reply-To: support@your-domain.com\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();
    
    return mail($to, $subject, $message, $headers);
}

/**
 * Log user activity
 * @param int $user_id User ID
 * @param string $activity_type Activity type
 * @param string $details Additional details
 * @return bool True if activity was logged successfully, false otherwise
 */
function log_activity($user_id, $activity_type, $details = '') {
    global $conn;
    
    $stmt = $conn->prepare("INSERT INTO activity_logs (user_id, activity_type, details, created_at) VALUES (?, ?, ?, NOW())");
    $stmt->bind_param("iss", $user_id, $activity_type, $details);
    return $stmt->execute();
}

/**
 * Check if email is valid and exists
 * @param string $email Email to validate
 * @return bool True if email is valid, false otherwise
 */
function is_valid_email($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) && 
           checkdnsrr(explode('@', $email)[1], 'MX');
}

/**
 * Create a secure session ID
 * @return void
 */
function secure_session_start() {
    if (session_status() === PHP_SESSION_NONE) {
        // Set secure session parameters
        $session_params = [
            'lifetime' => 0,
            'path' => '/',
            'domain' => '',
            'secure' => true,
            'httponly' => true,
            'samesite' => 'None'
        ];
        
        // Set session cookie parameters
        session_set_cookie_params($session_params);
        
        // Set additional security measures
        ini_set('session.use_strict_mode', 1);
        ini_set('session.use_only_cookies', 1);
        ini_set('session.cookie_lifetime', 0);
        ini_set('session.gc_maxlifetime', 3600);
        
        // Start session
        session_start();
        
        // Regenerate session ID periodically
        if (!isset($_SESSION['created'])) {
            $_SESSION['created'] = time();
        } else if (time() - $_SESSION['created'] > 1800) {
            // Regenerate session ID every 30 minutes
            session_regenerate_id(true);
            $_SESSION['created'] = time();
        }
    }
}

/**
 * Check if request is AJAX
 * @return bool True if request is AJAX, false otherwise
 */
function is_ajax_request() {
    return !empty($_SERVER['HTTP_X_REQUESTED_WITH']) && 
           strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest';
}

/**
 * Get user by ID
 * @param int $user_id User ID
 * @param mysqli $conn Database connection
 * @return array|null User data or null if not found
 */
function get_user_by_id($user_id, $conn) {
    $stmt = $conn->prepare("SELECT id, username, email, created_at FROM users WHERE id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    return $result->num_rows > 0 ? $result->fetch_assoc() : null;
}

/**
 * Check if remember me token is valid
 * @param string $token Remember me token
 * @param mysqli $conn Database connection
 * @return array|null User data if token is valid, null otherwise
 */
function validate_remember_token($token, $conn) {
    $stmt = $conn->prepare("SELECT id, username, email FROM users 
                           WHERE remember_token = ? AND token_expiry > NOW()");
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $result = $stmt->get_result();
    
    return $result->num_rows > 0 ? $result->fetch_assoc() : null;
}

/**
 * Redirect if not logged in
 */
function require_login() {
    if (!is_logged_in()) {
        header('Location: /FinancialLiteracyApp/login.html');
        exit();
    }
}

/**
 * Get current user data
 */
function get_current_user_data() {
    if (!is_logged_in()) {
        return null;
    }
    
    global $conn;
    $stmt = $conn->prepare("SELECT id, username, email FROM users WHERE id = ?");
    $stmt->bind_param("i", $_SESSION['user_id']);
    $stmt->execute();
    return $stmt->get_result()->fetch_assoc();
}

/**
 * Get database connection
 * @return mysqli Database connection
 */
function get_db_connection() {
    global $db_host, $db_name, $db_user, $db_pass;
    
    $conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
    
    if ($conn->connect_error) {
        error_log("Database connection failed: " . $conn->connect_error);
        throw new Exception('Database connection failed');
    }
    
    return $conn;
}
?> 
