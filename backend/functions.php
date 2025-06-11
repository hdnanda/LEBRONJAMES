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
        $timeout_minutes = defined('LOGIN_TIMEOUT_MINUTES') ? LOGIN_TIMEOUT_MINUTES : 30;
        
        $sql = "SELECT COUNT(*) as attempts FROM login_logs 
                WHERE (username = :username OR email = :email) 
                AND success = 0 
                AND login_time > NOW() - INTERVAL '{$timeout_minutes} minutes'";
        
        $stmt = $conn->prepare($sql);
        $stmt->execute([':username' => $username, ':email' => $username]);
        
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return isset($result['attempts']) && $result['attempts'] >= MAX_LOGIN_ATTEMPTS;
        
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
    
    try {
        $stmt = $conn->prepare("INSERT INTO activity_logs (user_id, action, details) VALUES (:user_id, :action, :details)");
        $stmt->execute([
            ':user_id' => $user_id,
            ':action' => $activity_type,
            ':details' => $details
        ]);
        return true;
    } catch (Exception $e) {
        // Log error to file but don't output it to the client
        error_log("Failed to log activity: " . $e->getMessage());
        return false;
    }
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
        $session_name = 'secure_session_id';
        $secure = false;
        $httponly = true;
        
        ini_set('session.use_only_cookies', 1);
        ini_set('session.cookie_lifetime', 0);
        ini_set('session.gc_maxlifetime', 3600);
        
        $cookieParams = session_get_cookie_params();
        session_set_cookie_params(
            0,
            '/',
            '',
            $secure,
            $httponly
        );
        
        session_name($session_name);
        session_start();
        
        if (!isset($_SESSION['created'])) {
            $_SESSION['created'] = time();
        } else if (time() - $_SESSION['created'] > 3600) {
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
    $stmt = $conn->prepare("SELECT id, username, email, created_at FROM users WHERE id = :id");
    $stmt->execute([':id' => $user_id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

/**
 * Check if remember me token is valid
 * @param string $token Remember me token
 * @param mysqli $conn Database connection
 * @return array|null User data if token is valid, null otherwise
 */
function validate_remember_token($token, $conn) {
    $stmt = $conn->prepare("SELECT id, username, email FROM users 
                           WHERE remember_token = :token AND token_expiry > NOW()");
    $stmt->execute([':token' => $token]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
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
    $stmt = $conn->prepare("SELECT id, username, email FROM users WHERE id = :id");
    $stmt->execute([':id' => $_SESSION['user_id']]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

/**
 * The single function for sending a JSON response. It finalizes the request.
 * It captures any unexpected output from the buffer and includes it for debugging.
 */
function send_json_response($response_data, $status_code = 200) {
    // Get any junk output that was generated during execution.
    $unexpected_output = ob_get_clean();
    if (!empty($unexpected_output)) {
        $response_data['unexpected_output'] = $unexpected_output;
        // If there's junk, it's a server error, even if the logic succeeded.
        if ($response_data['success']) {
            $response_data['message'] = 'Request succeeded but generated unexpected output.';
        }
        $response_data['success'] = false;
    }

    // Always send a JSON response
    header("Content-Type: application/json; charset=UTF-8");
    http_response_code($status_code);
    echo json_encode($response_data);
    exit();
}

/**
 * Helper function for sending a successful JSON response.
 */
function send_json_success_response($message, $data = null, $status_code = 200) {
    send_json_response([
        'success' => true,
        'message' => $message,
        'data' => $data
    ], $status_code);
}

/**
 * Helper function for sending an error JSON response.
 */
function send_json_error_response($message, $status_code = 500, $error_details = null) {
    send_json_response([
        'success' => false,
        'message' => $message,
        'error_details' => $error_details
    ], $status_code);
}