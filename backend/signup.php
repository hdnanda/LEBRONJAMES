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

    // Log request details for debugging
    error_log('Signup request received');
    error_log('Request method: ' . $_SERVER['REQUEST_METHOD']);
    error_log('Request headers: ' . print_r(getallheaders(), true));
    error_log('Session status: ' . session_status());
    error_log('Session ID: ' . session_id());
    
    // Initialize database connection
    error_log('Attempting database connection');
    try {
        $conn = get_db_connection();
        error_log('Database connection successful');
    } catch (PDOException $e) {
        error_log('Database Error: ' . $e->getMessage());
        error_log('Error Code: ' . $e->getCode());
        error_log('Error File: ' . $e->getFile() . ' on line ' . $e->getLine());
        send_json_response(false, 'Database connection failed: ' . $e->getMessage(), null, 500);
    }

    // Get and decode JSON data first
    $json = file_get_contents('php://input');
    error_log('Received JSON data: ' . $json);
    
    if (empty($json)) {
        send_json_response(false, 'No input received', null, 400);
    }
    
    $data = json_decode($json, true);
    if ($data === null) {
        error_log('JSON decode error: ' . json_last_error_msg());
        send_json_response(false, 'Invalid JSON data: ' . json_last_error_msg(), null, 400);
    }

    error_log('Decoded JSON data: ' . print_r($data, true));
    
    // Verify CSRF token
    $headers = getallheaders();
    $csrf_token = $headers['X-CSRF-Token'] ?? '';
    
    error_log('CSRF Token Debug:');
    error_log('Session token: ' . ($_SESSION['csrf_token'] ?? 'not set'));
    error_log('Received token: ' . $csrf_token);
    
    if (empty($_SESSION['csrf_token']) || $csrf_token !== $_SESSION['csrf_token']) {
        error_log('CSRF token validation failed');
        error_log('Session token: ' . ($_SESSION['csrf_token'] ?? 'not set'));
        error_log('Received token: ' . $csrf_token);
        send_json_response(false, 'Invalid CSRF token', null, 403);
    }

    error_log('CSRF token validation successful');
    
    // Validate required fields
    if (empty($data['username']) || empty($data['email']) || empty($data['password'])) {
        error_log('Missing required fields');
        send_json_response(false, 'All fields are required', null, 400);
    }
    
    // Sanitize input
    $username = sanitize_input($data['username']);
    $email = sanitize_input($data['email']);
    $password = $data['password']; // Don't sanitize password before hashing
    
    error_log('Input sanitization complete');
    
    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        error_log('Invalid email format: ' . $email);
        send_json_response(false, 'Invalid email format', null, 400);
    }
    
    // Validate password length
    if (strlen($password) < PASSWORD_MIN_LENGTH) {
        error_log('Password too short');
        send_json_response(false, 'Password must be at least ' . PASSWORD_MIN_LENGTH . ' characters long', null, 400);
    }
    
    // Check if username exists
    $stmt = $conn->prepare("SELECT COUNT(*) FROM users WHERE LOWER(username) = LOWER(:username)");
    if (!$stmt) {
        error_log('Failed to prepare username check statement');
        throw new Exception('Database error during username check');
    }
    
    $stmt->execute(['username' => $username]);
    if ($stmt->fetchColumn() > 0) {
        send_json_response(false, 'Username already exists', ['error' => 'username_exists'], 409);
    }
    
    // Check if email exists
    $stmt = $conn->prepare("SELECT COUNT(*) FROM users WHERE LOWER(email) = LOWER(:email)");
    if (!$stmt) {
        error_log('Failed to prepare email check statement');
        throw new Exception('Database error during email check');
    }
    
    $stmt->execute(['email' => $email]);
    if ($stmt->fetchColumn() > 0) {
        send_json_response(false, 'Email already exists', ['error' => 'email_exists'], 409);
    }
    
    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    // Insert new user
    $stmt = $conn->prepare(
        "INSERT INTO users (username, email, password_hash, created_at) 
         VALUES (:username, :email, :password, CURRENT_TIMESTAMP) 
         " . ($db_config['type'] === 'pgsql' ? "RETURNING id" : "")
    );
    
    if (!$stmt) {
        error_log('Failed to prepare insert statement');
        throw new Exception('Database error during user creation');
    }
    
    $stmt->execute([
        'username' => $username,
        'email' => $email,
        'password' => $hashedPassword
    ]);
    
    // Get the new user's ID (handle both MySQL and PostgreSQL)
    if ($db_config['type'] === 'pgsql') {
        $user_id = $stmt->fetchColumn();
    } else {
        $user_id = $conn->lastInsertId();
    }
    
    error_log('User inserted successfully with ID: ' . $user_id);
    
    // Log the signup
    log_activity($user_id, 'signup', 'User account created');
    
    // Generate new CSRF token
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    
    error_log('Signup completed successfully');
    
    // Return success response
    send_json_response(true, 'Account created successfully', [
        'username' => $username,
        'email' => $email
    ], 201);
    
} catch (Exception $e) {
    error_log('Signup error: ' . $e->getMessage());
    error_log('Stack trace: ' . $e->getTraceAsString());
    error_log('Request data: ' . print_r($_REQUEST, true));
    error_log('Session data: ' . print_r($_SESSION, true));
    error_log('Headers: ' . print_r(getallheaders(), true));
    send_json_response(false, 'An error occurred during signup: ' . $e->getMessage(), null, 500);
} finally {
    // Close database connection
    $conn = null;
    // Clean output buffer
    ob_end_flush();
}
?> 