<?php
// Use the centralized bootstrap file for all initialization.
require_once __DIR__ . '/bootstrap.php';

try {
    // The bootstrap file already starts the session.

    // The bootstrap file establishes the database connection.
    // We can access it via the global $conn variable.
    global $conn;
    
    // Verify CSRF token from headers.
    $csrf_token = get_csrf_token_from_header();
    if (!validate_csrf_token($csrf_token)) {
        return send_json_error_response('Invalid CSRF token.', 403);
    }
    
    // Get and decode JSON data from the request body.
    $data = get_json_input();
    
    // Validate required fields.
    if (empty($data['username']) || empty($data['password'])) {
        return send_json_error_response('Username and password are required.', 400);
    }
    
    // Sanitize input.
    $username = sanitize_input($data['username']);
    $password = $data['password']; // Don't sanitize password before hashing.
    
    // Check for too many login attempts.
    if (check_login_attempts($username)) {
        return send_json_error_response('Too many login attempts. Please try again later.', 429);
    }
    
    // Get user from the database.
    $stmt = $conn->prepare("SELECT id, username, password_hash, email FROM users WHERE username = :username");
    $stmt->execute(['username' => $username]);
    $user = $stmt->fetch();
    
    // Verify user and password.
    if (!$user || !password_verify($password, $user['password_hash'])) {
        log_login_attempt($username, false, 'Invalid credentials');
        return send_json_error_response('Invalid credentials, please check.', 401);
    }
    
    // Log successful login.
    log_login_attempt($username, true);
    
    // Update last login time.
    $update_stmt = $conn->prepare("UPDATE users SET last_login = NOW() WHERE id = :id");
    $update_stmt->execute(['id' => $user['id']]);
    
    // Regenerate session ID and set session variables.
    session_regenerate_id(true);
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['last_activity'] = time();
    
    // Generate a new CSRF token for subsequent requests.
    $_SESSION['csrf_token'] = generate_csrf_token();
    
    // Return a success response with user data.
    return send_json_success_response('Login successful', [
        'username' => $user['username'],
        'email' => $user['email']
    ]);
    
} catch (Exception $e) {
    // Log any unexpected errors and return a generic error message.
    error_log('Login Exception: ' . $e->getMessage());
    return send_json_error_response('An unexpected error occurred during login.', 500);
}

/**
 * Log login attempt
 */
function log_login_attempt($username, $success, $reason = '') {
    global $conn;
    
    try {
        $ip = $_SERVER['REMOTE_ADDR'];
        $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? '';
        
        // Get user_id if available
        $user_id = null;
        if ($success) {
            $stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
            $stmt->bind_param("s", $username);
            $stmt->execute();
            $result = $stmt->get_result();
            if ($result->num_rows > 0) {
                $user = $result->fetch_assoc();
                $user_id = $user['id'];
            }
        }
        
        // Get email if available
        $email = null;
        if ($user_id) {
            $stmt = $conn->prepare("SELECT email FROM users WHERE id = ?");
            $stmt->bind_param("i", $user_id);
            $stmt->execute();
            $result = $stmt->get_result();
            if ($result->num_rows > 0) {
                $user = $result->fetch_assoc();
                $email = $user['email'];
            }
        }
        
        $stmt = $conn->prepare("INSERT INTO login_logs (user_id, username, email, ip_address, user_agent, success, failure_reason) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("issssss", $user_id, $username, $email, $ip, $user_agent, $success, $reason);
        $stmt->execute();
    } catch (Exception $e) {
        error_log('Error logging login attempt: ' . $e->getMessage());
    }
}
?> 
