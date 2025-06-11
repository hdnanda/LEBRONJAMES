<?php
require_once 'config.php';

// Get data from the request body
$data = json_decode(file_get_contents('php://input'), true);

// Validate input
if (!isset($data['username']) || !isset($data['email']) || !isset($data['password'])) {
    send_json_response(false, 'Missing required fields', null, 400);
    exit;
}

$username = $data['username'];
$email = $data['email'];
$password = $data['password'];

// Hash the password
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

try {
    $stmt = $conn->prepare("INSERT INTO users (username, email, password) VALUES (:username, :email, :password)");
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