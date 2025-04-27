<?php
// Ensure no output before headers
ob_start();

// Set error handling
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

try {
    // Include required files
    require_once __DIR__ . '/cors.php';
    require_once 'config.php';
    require_once 'functions.php';

    // Set JSON content type
    header('Content-Type: application/json');

    // Handle preflight requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }

    // Start secure session
    secure_session_start();

    // Log request details
    error_log('Signup request received');
    error_log('Request method: ' . $_SERVER['REQUEST_METHOD']);
    error_log('Session ID: ' . session_id());
    
    // Get and decode JSON data
    $json = file_get_contents('php://input');
    error_log('Received JSON data: ' . $json);
    
    if (empty($json)) {
        throw new Exception('No input received');
    }
    
    $data = json_decode($json, true);
    if ($data === null) {
        throw new Exception('Invalid JSON data: ' . json_last_error_msg());
    }

    // Verify CSRF token
    $headers = getallheaders();
    $csrf_token = isset($headers['X-CSRF-Token']) ? $headers['X-CSRF-Token'] : '';
    
    error_log('Session token: ' . ($_SESSION['csrf_token'] ?? 'not set'));
    error_log('Received token: ' . $csrf_token);
    
    if (empty($_SESSION['csrf_token']) || $csrf_token !== $_SESSION['csrf_token']) {
        throw new Exception('Invalid CSRF token');
    }

    // Validate required fields
    if (empty($data['username']) || empty($data['email']) || empty($data['password'])) {
        throw new Exception('All fields are required');
    }
    
    // Sanitize and validate input
    $username = sanitize_input($data['username']);
    $email = filter_var(sanitize_input($data['email']), FILTER_VALIDATE_EMAIL);
    if (!$email) {
        throw new Exception('Invalid email format');
    }
    
    $password = $data['password'];
    if (strlen($password) < PASSWORD_MIN_LENGTH) {
        throw new Exception('Password must be at least ' . PASSWORD_MIN_LENGTH . ' characters long');
    }

    // Initialize database connection
    $conn = get_db_connection();
    
    // Check if username exists
    $stmt = $conn->prepare("SELECT COUNT(*) FROM users WHERE LOWER(username) = LOWER(?)");
    $stmt->execute([$username]);
    if ($stmt->fetchColumn() > 0) {
        throw new Exception('Username already exists', 409);
    }
    
    // Check if email exists
    $stmt = $conn->prepare("SELECT COUNT(*) FROM users WHERE LOWER(email) = LOWER(?)");
    $stmt->execute([$email]);
    if ($stmt->fetchColumn() > 0) {
        throw new Exception('Email already exists', 409);
    }
    
    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    // Begin transaction
    $conn->beginTransaction();
    
    try {
        // Insert new user
        $stmt = $conn->prepare(
            "INSERT INTO users (username, email, password_hash, created_at) 
             VALUES (?, ?, ?, CURRENT_TIMESTAMP)"
        );
        
        $stmt->execute([$username, $email, $hashedPassword]);
        $user_id = $conn->lastInsertId();
        
        // Log the signup
        $stmt = $conn->prepare(
            "INSERT INTO activity_logs (user_id, activity_type, details, created_at) 
             VALUES (?, 'signup', 'User account created', CURRENT_TIMESTAMP)"
        );
        $stmt->execute([$user_id]);
        
        // Commit transaction
        $conn->commit();
        
        // Generate new CSRF token
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        
        // Send success response
        echo json_encode([
            'success' => true,
            'message' => 'Account created successfully',
            'data' => [
                'username' => $username,
                'email' => $email
            ]
        ]);
        
    } catch (Exception $e) {
        // Rollback transaction on error
        $conn->rollBack();
        throw $e;
    }
    
} catch (Exception $e) {
    $status_code = $e->getCode() ?: 500;
    error_log('Signup error: ' . $e->getMessage());
    error_log('Stack trace: ' . $e->getTraceAsString());
    
    http_response_code($status_code);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} finally {
    // Clean output buffer
    if (ob_get_level() > 0) {
        ob_end_flush();
    }
}
?> 