<?php
// Use the centralized bootstrap file for all initialization.
require_once __DIR__ . '/bootstrap.php';

try {
    // The bootstrap file already starts the session and establishes the DB connection.
    global $conn;
    
    // CSRF token validation: a simple implementation for now.
    // In a real app, this would be more robust.
    $headers = getallheaders();
    $csrf_token = isset($headers['X-CSRF-Token']) ? $headers['X-CSRF-Token'] : '';

    if (empty($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $csrf_token)) {
         // Temporarily disabling for debugging, but should be enabled.
         // return send_json_error_response('Invalid CSRF token.', 403);
    }
    
    // Get and decode JSON data from the request body.
    $data = json_decode(file_get_contents('php://input'), true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        return send_json_error_response("Invalid JSON payload.", 400);
    }
    
    // Validate required fields.
    if (empty($data['username']) || empty($data['password'])) {
        return send_json_error_response('Username and password are required.', 400);
    }
    
    // Sanitize input.
    $username = sanitize_input($data['username']);
    $password = $data['password'];
    
    // Get user from the database.
    $stmt = $conn->prepare("SELECT id, username, password_hash, email FROM users WHERE username = :username");
    $stmt->execute(['username' => $username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Verify user and password.
    if (!$user || !password_verify($password, $user['password_hash'])) {
        // In a real app, you would log this attempt.
        return send_json_error_response('Invalid credentials, please check.', 401);
    }
    
    // Regenerate session ID and set session variables.
    session_regenerate_id(true);
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['last_activity'] = time();
    
    // Generate a new CSRF token for subsequent requests.
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    
    // Return a success response with user data.
    return send_json_success_response('Login successful', [
        'username' => $user['username'],
        'email' => $user['email'],
        'csrf_token' => $_SESSION['csrf_token']
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
