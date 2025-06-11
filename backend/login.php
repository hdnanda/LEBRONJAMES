<?php
// Ensure no output before headers
ob_start();

// Set CORS headers for Render
header('Access-Control-Allow-Origin: https://financial-literacy-app.onrender.com');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Max-Age: 1728000');
header('Cache-Control: no-store, no-cache, must-revalidate');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Set JSON content type
header('Content-Type: application/json');

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

    // Initialize database connection
    $conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
    if ($conn->connect_error) {
        error_log('Database connection failed: ' . $conn->connect_error);
        send_json_response(false, 'Database connection failed', null, 500);
    }
    
    // Verify CSRF token
    $headers = getallheaders();
    $csrf_token = $headers['X-CSRF-Token'] ?? '';
    
    if (empty($_SESSION['csrf_token']) || $csrf_token !== $_SESSION['csrf_token']) {
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
    $stmt->bind_param("s", $username);
    $stmt->execute();
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
    $stmt->bind_param("i", $user['id']);
    $stmt->execute();
    
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