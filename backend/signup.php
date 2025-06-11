<?php
// --- FILENAME: backend/signup.php ---
// This is a temporary, self-contained script for isolation testing.
// It has ZERO dependencies.

// Use the centralized bootstrap file for all initialization.
require_once __DIR__ . '/bootstrap.php';

// Get data from the request body
$data = json_decode(file_get_contents('php://input'), true);

// Validate input
if (!isset($data['username']) || !isset($data['email']) || !isset($data['password'])) {
    send_json_response(false, 'Missing required fields', null, 400);
}

$username = $data['username'];
$email = $data['email'];
$password = $data['password'];

// Hash the password
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

try {
    $sql = "INSERT INTO users (username, email, password_hash) VALUES (:username, :email, :password)";
    
    // Use RETURNING id for PostgreSQL to get the new user's ID
    if ($db_config['type'] === 'pgsql') {
        $sql .= " RETURNING id";
    }
    
    $stmt = $conn->prepare($sql);
    $stmt->execute([
        'username' => $username,
        'email' => $email,
        'password' => $hashedPassword
    ]);
    
    // Get the new user's ID
    if ($db_config['type'] === 'pgsql') {
        $user_id = $stmt->fetchColumn();
    } else {
        $user_id = $conn->lastInsertId();
    }
    
    // Log the signup activity
    log_activity($user_id, 'signup', 'User account created');
    
    // Generate new CSRF token
    if (session_status() === PHP_SESSION_ACTIVE) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    
    // Return success response
    send_json_response(true, 'Account created successfully', [
        'username' => $username,
        'email' => $email
    ], 201);
    
} catch (Exception $e) {
    // Check for duplicate entry error (error code 23505 for PostgreSQL, 23000 for MySQL)
    if (in_array($e->getCode(), ['23505', '23000'])) {
        error_log('Signup error: Duplicate entry for username or email. ' . $e->getMessage());
        send_json_response(false, 'Username or email already exists.', null, 409);
    } else {
        error_log('Signup error: ' . $e->getMessage());
        send_json_response(false, 'An error occurred during signup.', null, 500);
    }
}
