<?php
// Ensure no output before headers
ob_start();

// Include CORS configuration
require_once __DIR__ . '/cors.php';

// Set JSON content type
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Include required files
require_once 'config.php';
require_once 'functions.php';

// Function to send JSON response and exit
function send_json_response($success, $message, $data = null, $status_code = 200) {
    http_response_code($status_code);
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit();
}

try {
    // Start secure session
    secure_session_start();

    // Log request details
    error_log('Login request received');
    error_log('Request method: ' . $_SERVER['REQUEST_METHOD']);
    error_log('Request headers: ' . print_r(getallheaders(), true));
    error_log('Session status: ' . session_status());
    error_log('Session ID: ' . session_id());

    // Initialize database connection
    $conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
    if ($conn->connect_error) {
        error_log('Database connection failed: ' . $conn->connect_error);
        send_json_response(false, 'Database connection failed', null, 500);
    }
    
    // Verify CSRF token
    $csrf_token = '';
    if (function_exists('getallheaders')) {
        $headers = getallheaders();
        $csrf_token = $headers['X-CSRF-Token'] ?? '';
    } else {
        // Fallback for environments where getallheaders() is not available
        $csrf_token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    }
    
    error_log('CSRF Token Debug:');
    error_log('Session token: ' . ($_SESSION['csrf_token'] ?? 'not set'));
    error_log('Received token: ' . $csrf_token);
    
    if (empty($_SESSION['csrf_token']) || $csrf_token !== $_SESSION['csrf_token']) {
        error_log('CSRF token validation failed');
        send_json_response(false, 'Invalid CSRF token', null, 403);
    }
    
    // Get and decode JSON data
    $json = file_get_contents('php://input');
    if (empty($json)) {
        send_json_response(false, 'No input received', null, 400);
    }
    
    $data = json_decode($json, true);
    if ($data === null) {
        send_json_response(false, 'Invalid JSON data: ' . json_last_error_msg(), null, 400);
    }
    
    // Validate required fields
    if (empty($data['username']) || empty($data['password'])) {
        send_json_response(false, 'Username and password are required', null, 400);
    }
    
    // Sanitize input
    $username = sanitize_input($data['username']);
    $password = $data['password']; // Don't sanitize password before hashing
    
    // Check for too many login attempts
    if (check_login_attempts($username, $conn)) {
        send_json_response(false, 'Too many login attempts. Please try again later.', null, 429);
    }
    
    // Get user from database
    $stmt = $conn->prepare("SELECT id, username, password_hash FROM users WHERE username = ?");
    if (!$stmt) {
        error_log('Failed to prepare statement: ' . $conn->error);
        send_json_response(false, 'Database error', null, 500);
    }
    
    $stmt->bind_param("s", $username);
    if (!$stmt->execute()) {
        error_log('Failed to execute statement: ' . $stmt->error);
        send_json_response(false, 'Database error', null, 500);
    }
    
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        // Log failed attempt
        log_login_attempt($username, false, 'User not found');
        send_json_response(false, 'Invalid credentials, please check', null, 401);
    }
    
    $user = $result->fetch_assoc();
    
    // Verify password
    if (!password_verify($password, $user['password_hash'])) {
        // Log failed attempt
        log_login_attempt($username, false, 'Invalid password');
        send_json_response(false, 'Invalid credentials, please check', null, 401);
    }
    
    // Log successful login
    log_login_attempt($username, true);
    
    // Update last login time
    $stmt = $conn->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
    if (!$stmt) {
        error_log('Failed to prepare update statement: ' . $conn->error);
        send_json_response(false, 'Database error', null, 500);
    }
    
    $stmt->bind_param("i", $user['id']);
    if (!$stmt->execute()) {
        error_log('Failed to execute update statement: ' . $stmt->error);
        send_json_response(false, 'Database error', null, 500);
    }
    
    // Set session variables
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['last_activity'] = time();
    
    // Generate new CSRF token
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    
    // Return success response
    send_json_response(true, 'Login successful', [
        'username' => $username,
        'email' => $data['email'] ?? null
    ], 200);
    
} catch (Exception $e) {
    error_log('Login error: ' . $e->getMessage());
    error_log('Stack trace: ' . $e->getTraceAsString());
    error_log('Request data: ' . print_r($_REQUEST, true));
    error_log('Session data: ' . print_r($_SESSION, true));
    error_log('Headers: ' . print_r(getallheaders(), true));
    send_json_response(false, 'An error occurred during login', null, 500);
} finally {
    // Close database connection
    if (isset($conn)) {
        $conn->close();
    }
    // Clean output buffer
    ob_end_flush();
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
            if (!$stmt) {
                error_log('Failed to prepare user_id statement: ' . $conn->error);
                return;
            }
            
            $stmt->bind_param("s", $username);
            if (!$stmt->execute()) {
                error_log('Failed to execute user_id statement: ' . $stmt->error);
                return;
            }
            
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
            if (!$stmt) {
                error_log('Failed to prepare email statement: ' . $conn->error);
                return;
            }
            
            $stmt->bind_param("i", $user_id);
            if (!$stmt->execute()) {
                error_log('Failed to execute email statement: ' . $stmt->error);
                return;
            }
            
            $result = $stmt->get_result();
            if ($result->num_rows > 0) {
                $user = $result->fetch_assoc();
                $email = $user['email'];
            }
        }
        
        $success_int = $success ? 1 : 0; // Convert boolean to integer
        $stmt = $conn->prepare("INSERT INTO login_logs (user_id, username, email, ip_address, user_agent, success, failure_reason) VALUES (?, ?, ?, ?, ?, ?, ?)");
        if (!$stmt) {
            error_log('Failed to prepare log statement: ' . $conn->error);
            return;
        }
        
        $stmt->bind_param("issssis", $user_id, $username, $email, $ip, $user_agent, $success_int, $reason);
        if (!$stmt->execute()) {
            error_log('Failed to execute log statement: ' . $stmt->error);
        }
    } catch (Exception $e) {
        error_log('Error logging login attempt: ' . $e->getMessage());
        error_log('Stack trace: ' . $e->getTraceAsString());
    }
}
?> 
